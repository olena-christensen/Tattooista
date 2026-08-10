# Local dev on a Neon branch (Docker Postgres retired)

## Status
IN PROGRESS — working, uncommitted. Doc changes sit in the working tree on branch
`email-fix`; the `DATABASE_URL` switch lives in `tattooista-next/.env`, which is
gitignored and therefore machine-local (every other dev/machine must repeat step 3 below).

## Issue
None — no board card. `gh issue list --search "neon OR docker OR database" --state all`
returned nothing on 2026-08-11. Open one if this should be tracked.

## Goal
Run local development against a Neon branch copied from production instead of a local
Docker Postgres container, so there is no database process to start, keep alive, or
re-seed, and local data matches what production actually looks like.

## Scope
**In:** pointing `DATABASE_URL` at a Neon dev branch; verifying app + Prisma CLI both
work against it; removing Docker from the project docs.

**Out:** anonymising the copied production data; any automated way to refresh the branch;
cleaning the stale `docker …` entries out of `.claude/settings.local.json`; changing how
production connects (untouched).

## MERN source of truth
N/A — infrastructure, no UI. Nothing in `Client/` corresponds to this.

## Files

Zero application code changed. The switch is one environment variable.

- `tattooista-next/.env` — `DATABASE_URL` repointed from
  `postgresql://postgres:postgres@localhost:5432/tattooista` to the Neon dev branch.
  Changed by the owner (gitignored, never committed, never edited by the agent).
- `CLAUDE.md` — "Local Development" rewritten: startup is now just `npm run dev`; new
  "The dev database is a Neon branch" section covering the read-only sync check, the
  prod-data warning, and how to refresh. **Uncommitted.**
- `.claude/skills/bug/SKILL.md` — step 2 of START no longer diagnoses `P1001` as a
  stopped container. **Uncommitted.**
- `.claude/bugs/TEMPLATE.md` — Environment field now offers `LOCAL (Neon dev branch)`.
  **Uncommitted.**

## How it works

One variable feeds both consumers, which is why no code needed to change:

- **App** — `src/lib/prisma.ts:10` reads `process.env.DATABASE_URL` and hands it straight
  to a `pg` `Pool` (`:15`), wrapped by `PrismaPg` (`:16`). The connection string is opaque
  to it, so a Neon host works exactly as localhost did.
- **Prisma CLI** — `prisma.config.ts` sets `datasource.url` from the same
  `process.env["DATABASE_URL"]`, loaded via `import "dotenv/config"`. Note
  `prisma/schema.prisma:5-7` has a `datasource db` block with **no `url`** — the URL comes
  only from `prisma.config.ts`. Adding a `url` back to the schema would shadow this.

Connection in use: `ep-plain-base-agcqbypf-pooler.c-2.eu-central-1.aws.neon.tech`,
database `neondb`, `?sslmode=require&channel_binding=require`, PostgreSQL 17.10.

## Multi-tenant notes
N/A at the infrastructure level. Worth knowing for tenant work: the branch carries both
real studios (`demo`, `tatts`), so cross-studio isolation bugs are now reproducible
locally against real data instead of thin seed data — previously the local DB often held
only the seeded demo studio.

## Decisions & trade-offs

- **Pooled endpoint, not direct.** The `-pooler` (PgBouncer) host is in use. The original
  recommendation was the direct/unpooled host, on the theory that Prisma schema commands
  are happier off PgBouncer; the pooled host was used instead and verified to work for
  both the app and `prisma migrate diff`. If a future schema command fails oddly (advisory
  locks, prepared statements, DDL), retry against the same host with `-pooler` removed
  before assuming the schema is at fault.
- **Verify with `migrate diff`, not `db push`.** CLAUDE.md previously prescribed
  `npx prisma db push` as the "is the DB alive and in sync" check. `db push` *writes*, and
  the dev database is now a copy of production, so the check was replaced with the
  read-only `npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma`.
- **Prisma 7 renamed the diff flags.** `--from-schema-datasource` / `--to-schema-datamodel`
  no longer exist; it is now `--from-config-datasource` / `--to-schema`. The old form fails
  with a usage dump, which reads like a connection error but is not.
- **Copy-on-write, so branch creation is instant and cheap** regardless of database size —
  refreshing means cutting a new branch, not waiting on a dump/restore.
- **Branch creation stays with the owner.** CLAUDE.md bars the agent from external
  accounts, so the Neon console steps are always handed over, never performed.

## Verification

All run against the Neon branch on 2026-08-11:

- **Connectivity** — direct `pg` query returned PostgreSQL 17.10 and 19 public tables.
- **Real data present** — `Studio` 2 (`demo`, `tatts`), `User` 3, `Booking` 37,
  `TattooStyle` 14.
- **Schema in sync** — `npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma`
  → "No difference detected." No drift, and nothing written to the fresh copy.
- **App boots and serves** — `npm run dev`; `/demo`, `/demo/portfolio`, `/demo/reviews`,
  `/demo/contacts`, `/tatts` all HTTP 200.
- **Data reaches the page** — the `TattooStyle.value` rows stored for `tatts`
  (`FineLine`, `BlackWork`, `NeoTraditional`, `Realistic`) each appear in the rendered
  HTML, proving the render path reads Neon rather than a cache or fixture.
- **Test suite** — `npm test` → 7 files, 39 tests passed (unaffected; the suite mocks
  Prisma and never touches a real database).

Not verified: admin/authenticated routes, image uploads (Vercel Blob), and any write path
against the branch — every check above was deliberately read-only.

## TODO / follow-ups

- `.claude/settings.local.json` still holds `docker start` / `docker exec tattooista-postgres`
  / `docker ps` permission entries and two allow-rules pinned to the old localhost
  `DATABASE_URL`. Harmless, now dead.
- `.claude/bugs/archived/auth-silent-email-and-unhandled-errors.md` references Docker
  Postgres. Left as-is deliberately — it was accurate when written.
- No refresh process. The branch is a point-in-time copy; production will drift from it.
  Nothing tracks when it was cut or triggers a re-cut.
- The branch holds real customer rows (names, emails, bookings) on a local machine.
  Raised with the owner and not actioned; recorded here as fact, not as a recommendation.
- Untested from a second machine / fresh clone: `.env` is gitignored, so the Neon URL is
  not distributed. `.env.example:4` still shows a localhost placeholder
  (`postgresql://user:password@localhost:5432/tattooista`), which now points a new setup
  at a database that no longer exists.
