# API Reference

REST endpoints under `/api`. All responses are JSON. There is no
authentication yet — endpoints are open.

## `GET /api/customers`

List all customers, alphabetical by name.

**Response `200`** — array of customers:

```json
[
  {
    "id": "cmf...",
    "clinicId": "cmf...",
    "name": "Jessica Tan",
    "phone": "081234567801",
    "dateOfBirth": null,
    "gender": "FEMALE",
    "notes": "Sensitive skin. Avoid strong exfoliation.",
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

## `POST /api/customers`

Create a customer. Resolves the target clinic with `clinic.findFirst()` —
returns `500` if no clinic exists.

**Request body** (JSON):

| Field   | Type   | Required |
| ------- | ------ | -------- |
| `name`  | string | ✅       |
| `phone` | string | ✅       |
| `notes` | string | —        |

**Response `201`** — the created customer object.
**Response `500`** — `{ "error": "Clinic not configured" }` when no clinic exists.

```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{"name":"New Person","phone":"081234567899"}'
```

## `PATCH /api/customers/[id]`

Update a customer's saved WhatsApp message template.

**Request body** (JSON):

| Field           | Type   | Required |
| --------------- | ------ | -------- |
| `customMessage` | string | ✅       |

Max 2000 characters; supports the `{name}` placeholder.

**Response `200`** — the updated customer object.
**Response `400`** — `{ "error": "..." }` when the body is invalid.

```bash
curl -X PATCH http://localhost:3000/api/customers/<id> \
  -H "Content-Type: application/json" \
  -d '{"customMessage":"Hi {name}! Thanks for visiting 🌸"}'
```

## `GET /api/appointments`

All appointments (past and future), ascending by `scheduledAt`. Each item
embeds its `customer` and `package` (with `service`).

**Response `200`** — array of appointments with nested relations.

## `GET /api/follow-ups`

Customers with packages that have remaining sessions and no upcoming
(non-cancelled) appointment. Same rule as the Follow-ups page.

**Response `200`** — array of:

```json
[
  {
    "customer": { "id": "...", "name": "Kevin Hartono", "phone": "081234567804" },
    "package": { "id": "...", "name": "Weight Loss Program", "remainingSessions": 3 },
    "reason": "NO_NEXT_APPOINTMENT"
  }
]
```

## Error handling

No global error handler: unexpected failures surface as Next.js default 500s.
Validation of `POST /api/customers` is minimal (no schema validation) — invalid
bodies will throw and return 500 rather than 400.

## Not implemented yet

- `PATCH/DELETE` endpoints, appointment creation/updates
- Auth, rate limiting, pagination
