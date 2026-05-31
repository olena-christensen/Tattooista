# Rules

## MANDATORY: Ask before acting

NEVER run commands, install packages, create/modify files, or take ANY action without asking permission first.
Always: describe what you want to do → wait for approval → then act.
No exceptions.

## FORBIDDEN: External accounts

NEVER touch, modify, create, or delete anything on external accounts (Vercel, GitHub, npm, databases, any third-party service).
No creating databases, no adding integrations, no installing marketplace products, no modifying account settings.
If the user needs something done on an external account, explain what they need to do and where to find it. Let them do it themselves.

## Migration: Always reproduce from original first

When migrating components/features from the old MERN app (Client/Server directories) to tattooista-next:
1. Read the original component code FIRST
2. Read the original SCSS/styles FIRST
3. Reproduce the exact same logic, structure, and styling
4. Do NOT "improve", "simplify", or "reinvent" — copy the approach from the original
5. Only adapt what is necessary for the React/Next.js/Tailwind differences

## NEVER hallucinate data

NEVER invent seed data, style names, descriptions, FAQ content, or any other content.
Always read the actual data from:
- `tattooista-next/scripts/data/` — MongoDB JSON exports (tattoostyles.json, etc.)
- `Client/src/data/` — JS data files (FaqData.js, etc.)
If data exists there, copy it exactly.

## Think before pushing

Before every `git push`, mentally verify:
1. Will this work on Vercel (not just localhost)?
2. Are all required env vars set on Vercel?
3. Does the production DB have the right schema/data?
4. Do file paths resolve correctly (no local-only files)?
5. Does the hostname/URL pattern work on vercel.app?

## Building a feature

When building a new feature, page, component, or model:

1. **Brainstorm/plan first**, then build via the `feature-dev:feature-dev` skill. Use the `tattooista-styling` skill for ALL UI/styling work. (There is intentionally no custom "feature" skill — these conventions live here in CLAUDE.md.)
2. **Multi-tenant by default** — see Architecture below. Any new model gets a `studioId`; any tenant-scoped query resolves the current studio and filters by it, and gets a `vitest` test in `tattooista-next/tests/lib/`.
3. **Every feature gets a doc** in `.claude/features/<slug>.md` (template: `.claude/features/_TEMPLATE.md`). Create it while building and keep it current — the feature is not done until the doc exists. A feature without a doc leaves no trail.

## Fixing a bug

Use the `bug` skill — it drives a documented lifecycle: working state in `.claude-local/bugs/active/<slug>/bug.md` (gitignored), then on fix it's **archived** to `.claude/bugs/archived/<slug>.md` and a row is appended to `.claude/bugs/INDEX.md` (the append-only regression-warning log). Before changing files, check INDEX.md for prior fixes in the same area. No ticket system — slugs are plain descriptive names.

## Read the feature/bug doc first; cite a source

- **READ THE DOC FIRST.** Before answering anything about a feature under active development, read its `.claude/features/<slug>.md` doc; for anything about a past bug, read `.claude/bugs/INDEX.md` (and the archived bug doc it points to). Read the relevant source in full too, THEN answer. Decisions, file locations, and prior context are already written down — don't re-derive or ask what the doc answers.
- **CITE A SOURCE FOR EVERY PROJECT CLAIM, OR SAY "I DON'T KNOW."** Any statement about how this project/feature works must be backed by a specific file, line, or quote. If you can't point to one, say you don't know and go read. Never answer from conversation momentum or assumption.

---

# Tech Stack

## Next.js App (`tattooista-next/`)

- **Framework**: Next.js 16.1.6 (App Router, Turbopack)
- **Language**: TypeScript
- **ORM**: Prisma 7 with `@prisma/adapter-pg` (raw `pg` Pool)
- **Auth**: NextAuth v5 beta (`next-auth@5.0.0-beta.30`)
- **Styling**: Tailwind CSS with CSS variables, dark theme
- **UI**: Custom components (no shadcn/ui currently)
- **Fonts**: Custom setup in layout

## Original MERN App (reference only)

- `Client/` — React + Redux + SCSS (the source of truth for migration)
- `Server/` — Express + MongoDB (not used in new app)
- Original data exports in `tattooista-next/scripts/data/`

---

# Architecture

## Multi-Tenant (Studio-based)

Every data model has a `studioId` field. Tenant resolution flow:

1. **`proxy.ts`** (runs on every request, Node.js runtime):
   - Extracts studio slug from subdomain OR `?studio=slug` query param
   - Skips `.vercel.app` and `.vercel.sh` domains for subdomain extraction
   - Queries DB for studio → sets `x-studio-id` header
   - Also handles auth route protection (admin routes require login)

2. **`getTenantContext()`** (`src/lib/tenant.ts`):
   - Reads `x-studio-id` header set by proxy
   - Returns the Studio object for use in Server Components
   - If no header → returns null → landing page renders

## Key Files

```
tattooista-next/
├── src/
│   ├── proxy.ts                    # Request interceptor (auth + tenant resolution)
│   ├── app/
│   │   ├── (public)/page.tsx       # Home page (studio landing)
│   │   ├── (public)/portfolio/     # Portfolio page
│   │   ├── (public)/reviews/       # Reviews page
│   │   ├── (public)/contacts/      # Contacts page
│   │   ├── (auth)/                 # Login, register, reset-password, verify-email
│   │   └── admin/                  # Admin dashboard and management pages
│   ├── components/
│   │   ├── forms/                  # Form components
│   │   └── shared/                 # Shared UI components
│   └── lib/
│       ├── prisma.ts               # Prisma client singleton (pg Pool adapter)
│       ├── tenant.ts               # Tenant resolution helpers
│       ├── auth.ts                 # Full NextAuth config
│       ├── auth.config.ts          # Edge-compatible auth config (proxy only)
│       └── image-utils.ts          # URL helpers for wallpapers/avatars/gallery
├── prisma/
│   ├── schema.prisma               # Database schema
│   ├── seed.ts                     # Seed script (real data from MERN app)
│   └── migrate-to-multitenant.ts   # One-time migration script
├── public/
│   ├── images/                     # Static images (hero, backgrounds, avatar)
│   └── styles/mg_*/                # Style wallpapers (committed, from MERN app)
└── scripts/data/                   # MongoDB JSON exports (source of truth for seed)
```

## Image URL Conventions

URL helpers in `src/lib/image-utils.ts` handle three formats:
- **External URLs** (`https://...`) — returned as-is (e.g. from Uploadthing)
- **Relative paths** (contains `/`) — returned as `/{path}` (seed data, committed files)
- **Filenames only** — resolved as `/{type}/{entityId}/{filename}` (admin uploads)

---

# Local Development

## Starting the project

1. Start PostgreSQL: `docker start tattooista-postgres`
2. Verify DB: `cd tattooista-next && npx prisma db push` (should say "already in sync")
3. Start dev server: `cd tattooista-next && npm run dev`

The Docker container (`postgres:16-alpine`) stops on machine restart. Without it, all Prisma queries fail with `P1001: Can't reach database server`.

- DATABASE_URL: `postgresql://postgres:postgres@localhost:5432/tattooista`
- Config: `tattooista-next/.env`
- Schema: `tattooista-next/prisma/schema.prisma`

## Seeding

```bash
cd tattooista-next && npx tsx prisma/seed.ts
```

---

# Production (Vercel)

- **URL**: `tattooista-next.vercel.app` (use `?studio=demo` to see demo studio)
- **Database**: Neon PostgreSQL via Vercel Marketplace (auto-provisioned env vars)
- **Auth**: Requires `AUTH_SECRET` env var on Vercel
- **Proxy**: `proxy.ts` (NOT `middleware.ts`) — Next.js 16 convention, Node.js runtime
- **Git branch**: pushes to `main` auto-deploy to production

## Seeding production

```bash
cd tattooista-next
npx vercel env pull .env.production.local
DATABASE_URL=$(grep DATABASE_URL .env.production.local | head -1 | cut -d'"' -f2) npx tsx prisma/seed.ts
```

## Schema changes on production

```bash
DATABASE_URL=$(grep DATABASE_URL .env.production.local | head -1 | cut -d'"' -f2) npx prisma db push
```

## NEVER commit .env files

`.env.production.local`, `.env.local.bak`, and any file with credentials must NEVER be committed. The `.gitignore` covers `.env.*` and `*.bak`.
