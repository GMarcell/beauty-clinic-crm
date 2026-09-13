# Beauty Clinic CRM MVP

MVP for managing beauty-clinic customers, treatment packages, appointments and WhatsApp follow-ups.

## Stack

- Next.js 16.3.4
- React 19
- TypeScript
- Prisma 8
- PostgreSQL
- Tailwind CSS
- App Router + Turbopack

Next.js 16.3.4 is the current latest release listed in the official Next.js docs as of September 10, 2026.

## Requirements

- Node.js 24+
- pnpm 10+
- PostgreSQL

## Setup

```bash
pnpm install
cp .env.example .env
```

Set `DATABASE_URL` in `.env`.

Then:

```bash
pnpm db:generate
pnpm db:migrate --name init
pnpm db:seed
pnpm dev
```

Open http://localhost:3000

Full documentation lives in [`docs/`](./docs):

| Doc                                              | Contents                                    |
| ------------------------------------------------ | ------------------------------------------- |
| [Getting started](./docs/getting-started.md)     | Setup, env vars, scripts, seeding           |
| [Architecture](./docs/architecture.md)           | Stack, project layout, conventions          |
| [Data model](./docs/data-model.md)               | Schema, ERD, business rules                 |
| [Features](./docs/features.md)                   | Page-by-page guide, WhatsApp flow           |
| [API reference](./docs/api.md)                   | REST endpoints                              |

## Demo data

The seed creates:

- Beauty Clinic Demo
- Demo Operator
- 3 services
- 2 customers
- sample packages
- sample treatment sessions
- sample appointments

## Current MVP

- Dashboard
- Customer database
- Customer detail
- Treatment packages
- Treatment history
- Appointments
- Follow-up detection
- WhatsApp deep links
- Per-customer custom messages
- Promo broadcast (personalized, manually sent)
- Services

See [Features](./docs/features.md) for details on each.

## Deliberately not included yet

- WhatsApp Business API
- automated WhatsApp sending
- doctor portal
- diet/weight-loss recommendation system
- payments
- inventory
- accounting
- multi-branch
