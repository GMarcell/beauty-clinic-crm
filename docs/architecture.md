# Architecture

How the codebase is organised and the conventions it follows.

## Stack

| Layer      | Technology                                             |
| ---------- | ------------------------------------------------------ |
| Framework  | Next.js 16 (App Router, Turbopack)                     |
| UI         | React 19, Server Components, Tailwind CSS 4            |
| Language   | TypeScript (strict)                                    |
| Database   | PostgreSQL via Prisma 7                                |
| Prisma setup | `prisma-client` generator + `@prisma/adapter-pg` driver adapter |
| Fonts      | Plus Jakarta Sans (body), Fraunces (display)           |

## Directory layout

```
.
├── app/
│   ├── layout.tsx                  # Root layout: fonts + metadata
│   ├── page.tsx                    # Redirects to /dashboard
│   ├── globals.css                 # Tailwind entry + design tokens (brand, mist palettes)
│   ├── generated/prisma/           # ⚠️ Generated Prisma client — do not edit
│   ├── api/
│   │   ├── customers/route.ts      # GET, POST
│   │   ├── appointments/route.ts   # GET
│   │   └── follow-ups/route.ts     # GET
│   └── (dashboard)/                # Route group with shared shell
│       ├── layout.tsx              # Wraps children in <DashboardShell>
│       ├── dashboard/page.tsx      # Overview + stats
│       ├── customers/page.tsx      # Directory table
│       ├── customers/new/page.tsx  # Add-customer form (server action)
│       ├── customers/[id]/page.tsx # Profile, packages, history
│       ├── appointments/page.tsx   # Upcoming schedule grouped by day
│       ├── follow-ups/page.tsx     # Retention queue + WhatsApp links
│       └── services/page.tsx       # Service catalogue
├── components/
│   ├── dashboard-shell.tsx         # App shell (sidebar + content area)
│   ├── sidebar.tsx                 # Client component, active-link highlighting
│   ├── ui.tsx                      # Shared primitives (Card, Badge, Avatar, PageHeader…)
│   └── icons.tsx                   # Inline SVG icon set
├── lib/
│   ├── prisma.ts                   # Prisma client singleton (globalThis cache in dev)
│   └── whatsapp.ts                 # wa.me link + follow-up message helpers
├── prisma/
│   ├── schema.prisma               # Data model
│   ├── migrations/                 # SQL migrations
│   └── seed.ts                     # Demo data seeder
└── docs/                           # This documentation
```

## Rendering model

Everything is rendered as a **React Server Component** by default. Pages query
PostgreSQL directly through the Prisma singleton — there is no client-side data
fetching layer for reads. The only mutations so far:

- `POST /api/customers` — JSON API route
- The **Add customer** form uses a **server action** (`createCustomer` in
  `app/(dashboard)/customers/new/page.tsx`) that creates the customer and
  redirects to their profile.

`components/sidebar.tsx` is the only `"use client"` component (needs
`usePathname` for active-link highlighting).

## Data access pattern

```ts
import { prisma } from "@/lib/prisma";
```

`lib/prisma.ts` instantiates `PrismaClient` with the `PrismaPg` driver adapter
and caches it on `globalThis` outside production, so Next.js hot reloads don't
exhaust database connections. Always import the shared `prisma` instance —
never construct a new client in a page or route.

## Conventions

- **Path alias** `@/*` → project root (e.g. `@/lib/prisma`, `@/components/ui`).
- **Server-first**: keep pages async server components; push interactivity into
  small client components only when needed.
- **Styling**: Tailwind utility classes; design tokens are defined in
  `app/globals.css` (`brand-*` for the primary palette, `mist-*` for neutrals).
  Reusable visuals live in `components/ui.tsx` (e.g. `Card`, `Badge`, `Avatar`,
  `PageHeader`, `EmptyState`, `SectionHeader`, `cn` helper).
- **Clinic scoping**: the schema supports multiple clinics; the MVP resolves the
  "current clinic" with `prisma.clinic.findFirst()` when creating records.
- **No auth yet**: there is no login/session handling — every visitor sees the
  full dashboard (see README's "Deliberately not included yet").
