# Getting Started

Set up and run the Beauty Clinic CRM locally.

## Prerequisites

| Tool       | Version |
| ---------- | ------- |
| Node.js    | 24+     |
| pnpm       | 10+     |
| PostgreSQL | 14+     |

## 1. Install dependencies

```bash
pnpm install
```

## 2. Configure environment

```bash
cp .env.example .env
```

Then set your database connection string in `.env`:

```ini
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
```

The default example points at a local PostgreSQL database named `beauty_clinic_crm`:

```ini
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/beauty_clinic_crm?schema=public"
```

`DATABASE_URL` is the only required environment variable.

## 3. Create the database schema

```bash
pnpm db:generate          # generate the Prisma client into app/generated/prisma
pnpm db:migrate --name init   # create/apply migrations
```

> If migrations have already been applied (e.g. the `init` migration exists in
> `prisma/migrations/`), just run `pnpm db:migrate` to apply pending ones.

## 4. Seed demo data

```bash
pnpm db:seed
```

The seed script wipes existing data and creates:

- Clinic **Glow Beauty Clinic** (Kemang, Jakarta Selatan)
- 2 users — `grand@glowbeauty.test` (OWNER), `sarah@glowbeauty.test` (OPERATOR)
- 5 services (Premium Facial, Acne Treatment, Chemical Peel, Laser Treatment, Weight Loss Program)
- 8 customers with Indonesian names and phone numbers
- 8 treatment packages in various completion states
- Treatment sessions and appointments — deliberately arranged so that some
  customers (Kevin, Clara, Samantha) show up on the **Follow-ups** page and
  others don't

## 5. Run the app

```bash
pnpm dev        # http://localhost:3000 (Turbopack)
```

Opening `/` redirects to `/dashboard`.

## Available scripts

| Script             | Command                | Description                              |
| ------------------ | ---------------------- | ---------------------------------------- |
| `pnpm dev`         | `next dev --turbopack` | Start the dev server                     |
| `pnpm build`       | `next build`           | Production build                         |
| `pnpm start`       | `next start`           | Run the production build                 |
| `pnpm lint`        | `eslint .`             | Lint the codebase                        |
| `pnpm db:generate` | `prisma generate`      | Regenerate the Prisma client             |
| `pnpm db:migrate`  | `prisma migrate dev`   | Create/apply migrations (add `--name X`) |
| `pnpm db:seed`     | `tsx prisma/seed.ts`   | Reset + seed demo data                   |
| `pnpm db:studio`   | `prisma studio`        | Browse data in the browser               |

## Troubleshooting

**`Environment variable not found: DATABASE_URL`**
→ `.env` is missing or empty. Repeat step 2.

**Prisma client types are stale / imports from `@/app/generated/prisma` fail**
→ run `pnpm db:generate` after every change to `prisma/schema.prisma`.

**Connection refused on port 5432**
→ PostgreSQL isn't running, or the host/port/credentials in `DATABASE_URL` are wrong.
