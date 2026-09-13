# Data Model

The Prisma schema (`prisma/schema.prisma`) describes a multi-clinic CRM.
All IDs are CUIDs; every model carries `createdAt`, most also `updatedAt`.

## Entity relationships

```
Clinic 1──n User
Clinic 1──n Customer
Clinic 1──n Service
Customer 1──n Package ──1 Service
Customer 1──n TreatmentSession ──1 Package
Customer 1──n Appointment ──? Package (optional)
```

Or as an entity diagram:

```
┌────────┐       ┌───────────┐
│ Clinic │       │   User    │
└───┬────┘       └───────────┘
    │ 1:n
┌───▼────────┐  1:n  ┌─────────┐  n:1  ┌─────────┐
│  Customer  │──────▶│ Package │◀──────│ Service │
└───┬────┬───┘       └────┬────┘       └─────────┘
    │    │                │ 1:n
    │    │         ┌──────▼───────────┐
    │    │         │ TreatmentSession │  (unique: packageId + sessionNumber)
    │    │         └──────────────────┘
    │ 1:n │
    │  ┌──▼───────────┐   n:0..1 Package
    │  │ Appointment  │───────────────────
    │  └──────────────┘
```

## Models

### Clinic

The tenant root. `name`, optional `phone` and `address`. All other records
cascade from a clinic.

### User

A staff member. Fields: `clinicId`, `name`, unique `email`,
`role` (`OWNER` | `OPERATOR`). Not yet used for authentication.

### Customer

| Field          | Type             | Notes                          |
| -------------- | ---------------- | ------------------------------ |
| `name`         | String           | Required                       |
| `phone`        | String           | Required, indexed              |
| `dateOfBirth`| DateTime?        | Optional                       |
| `gender`     | `MALE`/`FEMALE`? | Optional                       |
| `notes`        | String?          | Free-text (skin notes, etc.)   |
| `customMessage`| String?          | Saved WhatsApp message template for this customer; supports the `{name}` placeholder |

Relations: `packages`, `appointments`, `treatments`.

### Service

A treatment type the clinic sells: `name`, optional `description`,
`defaultPrice` (`Decimal(12,2)`), `active` flag (soft-disable).

### Package

A customer's purchase of a service in bulk:

| Field          | Type     | Notes                              |
| -------------- | -------- | ---------------------------------- |
| `totalSessions`| Int      | Sessions purchased                 |
| `price`        | Decimal  | Price paid for the whole package   |
| `purchaseDate` | DateTime | When bought                        |

**Remaining sessions** are derived, not stored:

```ts
remaining = pkg.totalSessions - pkg.treatments.length
```

### TreatmentSession

One completed visit against a package. `sessionNumber` is unique per package
(`@@unique([packageId, sessionNumber])`), so a session can't be logged twice.
`notes` records what happened.

### Appointment

A scheduled visit: `scheduledAt`, `status`, optional `packageId` (SetNull on
package deletion), optional `notes`.

`AppointmentStatus` lifecycle:

```
PENDING ──▶ CONFIRMED ──▶ COMPLETED
   │                          
   ├──▶ CANCELLED             
   └──▶ NO_SHOW               
```

## Derived business rules

These are computed in code (pages + API), not in the database:

1. **Remaining sessions** — `totalSessions - treatments.length`.
2. **A package needs a follow-up** when:
   - it has sessions remaining (`remaining > 0`), **and**
   - it has **no** appointment that is in the future (`scheduledAt > now`)
     with status ≠ `CANCELLED`.

   A cancelled appointment does *not* count as "booked", so the customer
   resurfaces in Follow-ups — by design.
3. **Expiring package** — `0 < remaining <= 1` (shown as "Packages ending"
   on the dashboard).
4. **Next appointment** for a customer — the first appointment with
   `scheduledAt > now` and status ≠ `CANCELLED`, sorted by `scheduledAt desc`
   (most recent first) in the customer detail page.
5. **Per-customer message** — `customMessage` is a template with a `{name}`
   placeholder, resolved at send time via `resolveMessageTemplate()` in
   `lib/whatsapp.ts`. When empty, a default template is used. The Broadcast
   page uses the same `{name}` resolution for its promo text.

## Multi-tenancy note

Every table is scoped by `clinicId`, but the MVP operates on a single clinic:
code picks `clinic.findFirst()`. When multi-clinic support arrives, replace
these call sites with a session-based clinic resolver.

## Where things live

| Concern                | Location                                  |
| ---------------------- | ----------------------------------------- |
| Schema                 | `prisma/schema.prisma`                    |
| Migrations             | `prisma/migrations/`                      |
| Seed data              | `prisma/seed.ts`                          |
| Generated client       | `app/generated/prisma/` (don't edit)      |
| Client singleton       | `lib/prisma.ts`                           |
| Follow-up rule impl.   | `app/(dashboard)/follow-ups/page.tsx`, `app/api/follow-ups/route.ts`, `app/(dashboard)/dashboard/page.tsx` |
