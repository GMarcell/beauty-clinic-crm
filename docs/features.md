# Features

What the app does, page by page. All pages are server-rendered and read
straight from PostgreSQL via Prisma.

## Dashboard (`/dashboard`)

The landing page (root `/` redirects here). Shows:

- Time-aware greeting ("Good morning/afternoon/evening")
- Four stat cards linking to their sections:
  - **Customers** — total count
  - **Upcoming** — future, non-cancelled appointments
  - **Follow-ups** — customers needing rebooking (capped at 5 for the list)
  - **Packages ending** — packages with exactly 1 session left
- **Upcoming appointments** — next 8 appointments
- **Follow-up reminders** — up to 5 customers with remaining sessions but no
  future booking, each with a WhatsApp rebook link

## Customers (`/customers`)

Directory table (up to 100, alphabetical): avatar, WhatsApp number, last
appointment date, or a "New" badge if they've never booked. "Add customer"
goes to the creation form.

### Add customer (`/customers/new`)

A form backed by a **server action**: requires only **name** and **phone**
(WhatsApp number); notes are optional. On success it redirects to the new
customer's profile. `POST /api/customers` does the same thing over JSON.

### Customer profile (`/customers/[id]`)

The richest page:

- Hero card with initials avatar, sessions-done counter, and a WhatsApp button
- Summary stats: packages, sessions planned, visits, customer since
- **Active packages** with progress bars and badges:
  - `Completed` when remaining = 0
  - amber `X left` when remaining ≤ 1
  - green otherwise
- **Next appointment** card (or an amber "No upcoming appointment" prompt to
  rebook via WhatsApp)
- **Treatment history** — chronological list of completed sessions with notes
- 404 via `notFound()` for unknown IDs

## Appointments (`/appointments`)

Upcoming schedule: future, non-cancelled appointments sorted ascending,
grouped by day. Each row shows time, customer, service, and a status badge
(colour-coded: pending/confirmed/completed/no-show/cancelled).

## Follow-ups (`/follow-ups`)

The retention engine. Lists every **package** where:

- sessions remain, and
- no future non-cancelled appointment exists.

Each card shows remaining-session progress dots and a
**"Rebook via WhatsApp"** button that opens `wa.me/<phone>` with a
pre-filled message (in Indonesian):

> Hi {name} 👋 Treatment kamu masih memiliki sesi yang tersisa. Yuk jadwalkan
> sesi berikutnya. Kapan kira-kira kamu tersedia? Terima kasih 🙏

A counter badge shows how many customers to contact.

## Record a package purchase (`/packages/new`)

How a customer "buys" a service — a package links them together:

- Pick the **customer** (pre-selected when arriving from a profile via
  `?customer=<id>`), the **service**, **total sessions**, and **price**.
- Purchase date defaults to today when left blank.
- On save, the customer's profile shows the new package with a progress bar
  (0 of N sessions done) and the purchase feeds the Follow-ups logic — the
  customer appears there once sessions remain and no future appointment exists.

Entry points: **Record purchase** on the Customers page header, or on any
customer profile next to "Active packages".

## Services (`/services`)

Catalogue grid of treatments with name, description, formatted price, and
active/inactive badge. Read-only for now.

### Custom WhatsApp message (per customer)

The profile also has a **WhatsApp message** card:

- Edit a saved **template** for the customer and save it with **Save message**
  (stored in `Customer.customMessage` via `PATCH /api/customers/[id]`).
- Templates support the `{name}` placeholder — resolved at send time.
- A **preview** shows the resolved message; the **Send via WhatsApp** composer
  below lets you tweak the text before opening WhatsApp, with the link
  updating live.
- The hero **WhatsApp** button always uses the saved template (or a default
  when none is set).

## Broadcast (`/broadcast`)

Promo broadcasting, manually driven:

- **Promo composer** — write once, personalize with `{name}`; a live preview
  shows the resolved message for the first three recipients.
- **Recipient list** — every customer with checkboxes (all pre-selected),
  plus All/None shortcuts.
- **Copy N WhatsApp links** — copies one personalized `wa.me` link per
  selected customer. Each link opens WhatsApp with that customer's message
  pre-filled; sending is still one tap per customer.

Sending stays manual by design — no WhatsApp Business API yet (see README).

## WhatsApp helpers

All in `lib/whatsapp.ts`:

- `normalizeIndonesianPhone(phone)` — `08xx…` → `628xx…`, passes through
  numbers already in international format.
- `createWhatsAppLink(phone, message)` — normalized `https://wa.me/<number>?text=...` link.
- `createFollowUpMessage(name)` — the rebooking template above.
- `resolveMessageTemplate(template, { name })` — resolves `{name}`.
- `buildCustomerMessage(customer)` — saved `customMessage` or default, resolved.
- `defaultCustomerMessage()` — fallback template.

> **Note:** `wa.me` expects international format. Indonesian numbers stored as
> `08xx…` are stripped to digits only and may need a `62` prefix to work
> reliably — worth normalising at input time.
