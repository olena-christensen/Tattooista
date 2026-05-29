# Tattooista Workflow Skills — Design

**Date:** 2026-05-29
**Status:** Approved

## Goal

Add structure to the Tattooista project by introducing two project-specific
skills — `tattooista-bug-fixing` and `tattooista-feature-building`. Both are
**guardrail** skills: short, rigid checklists that encode Tattooista-specific
gotchas and then hand off to the existing generic `superpowers` /
`feature-dev` skills for the actual process. They do NOT re-implement
debugging or feature-development methodology.

## Context

- The project had no project-level `.claude/skills/` directory; these are the
  first, establishing the structure. (The existing `tattooista-styling` skill
  lives in the user's global `~/.claude/skills/`.)
- Tests exist: `tattooista-next/tests/lib/` runs under `vitest`, including
  `tenant.test.ts` and `tenant-prisma.test.ts`. Tenant logic is a real
  regression-test target.
- The dominant bug class is multi-tenant `studioId` scoping leaks
  (cf. commit "bug with studio/admin showing all styles and galleries for all
  studios"). This is baked into the bug-fixing guardrails as the first suspect.

## Shared Shape & Conventions

- **Location:** repo-root `.claude/skills/<name>/SKILL.md` (covers the whole
  repo, including the MERN reference dirs `Client/` and `Server/`).
- **Frontmatter:** `name`, `description` (a "Use when…" trigger phrase),
  `metadata.skillType: rigid`.
- **Form:** short checklist + explicit handoff. Each skill lists the
  Tattooista-specific gates, then names the generic skill to invoke for the
  real method.
- **Naming:** `tattooista-bug-fixing`, `tattooista-feature-building`
  (preserves the `tattooista-` prefix).

## Skill 1 — `tattooista-bug-fixing`

Gated checklist:

1. **Ask before acting** (CLAUDE.md law): describe → wait → act.
2. **Reproduce first.** Identify the environment — local or Vercel. If local
   fails with `P1001`, the Docker DB is down → `docker start tattooista-postgres`.
   Local Postgres is not prod Neon, so confirm the data assumption.
3. **Suspect tenant isolation first.** Ask whether data is leaking across
   studios or failing to scope to one. Check `getTenantContext()`, the
   `x-studio-id` header set by `proxy.ts`, and whether the query filters by
   `studioId`.
4. **Image rendering bug?** Check the 3-format logic in `image-utils.ts`
   before touching components.
5. **Hand off** to `superpowers:systematic-debugging` for root-cause method.
6. **Regression test.** If the bug is in `lib/` (tenant, slug, studio,
   placeholder), add/extend a `vitest` test in `tests/lib/`.
7. **Before push,** run the 5-point "Think before pushing" check (Vercel,
   env vars, prod DB schema, file paths, hostname).

## Skill 2 — `tattooista-feature-building`

Gated checklist:

1. **Ask before acting / brainstorm first** for anything non-trivial.
2. **Is this a MERN migration?** If a matching component exists in
   `Client/src/`, the original is the source of truth — invoke
   `tattooista-styling` and read the original component + SCSS *before*
   writing anything.
3. **Never hallucinate data** — pull real content from `scripts/data/` or
   `Client/src/data/`.
4. **Multi-tenant by default** — any new model gets a `studioId`; any query
   scopes via `getTenantContext()`. A new tenant-scoped query gets a
   `tests/lib/` test.
5. **Never touch external accounts** (Vercel/GitHub/DB/npm) — explain what the
   user must do instead.
6. **Hand off** to `feature-dev:feature-dev` for the build process, and
   `tattooista-styling` for all UI work.
7. **Before push,** run the 5-point check.

## Out of Scope

- Migrating the existing global `tattooista-styling` skill into the repo.
- Any additional skills beyond these two.
- Changes to CLAUDE.md.
