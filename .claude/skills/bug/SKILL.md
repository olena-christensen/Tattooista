---
name: bug
description: Use when fixing a bug, regression, or unexpected behavior in the Tattooista project. Enforces project-specific gates (tenant isolation, DB/env reproduction, regression tests) before handing off to systematic debugging.
metadata:
  skillType: rigid
---

# Tattooista Bug Fixing

This is a **rigid** guardrail skill. It does NOT replace the debugging method —
it gates on Tattooista-specific gotchas, then hands off to
`superpowers:systematic-debugging` for root-cause work.

Create a TodoWrite item for each step and complete them in order.

## Checklist

- [ ] **1. Ask before acting.** Per CLAUDE.md: describe what you intend to do →
      wait for approval → then act. No exceptions. Never touch external accounts
      (Vercel, GitHub, npm, DB) — explain what the user must do instead.

- [ ] **2. Reproduce first.** Identify the environment: is the bug on **local**
      or on **Vercel** (production)? Reproduce it before theorizing.
      - If local Prisma queries fail with `P1001: Can't reach database server`,
        the Docker DB is down → `docker start tattooista-postgres`.
      - Local Postgres is NOT prod Neon. Confirm the data assumption holds in the
        environment where the bug actually occurs.

- [ ] **3. Suspect tenant isolation FIRST.** The most common bug class here is
      multi-tenant `studioId` scoping. Ask: is data **leaking across studios**,
      or **failing to scope to one studio**? Check (all in
      `tattooista-next/src/lib/tenant.ts`):
      - `getTenantContext()` — reads the `x-studio-id` header. NOTE: the current
        `proxy.ts` does NOT set this header, so it is usually empty.
      - `getSessionStudio()` / `requireSessionStudio()` — the real path for
        server actions: tries the header, then falls back to the logged-in
        user's `studioSlug` from the session. Most admin queries resolve tenant
        here, so check this first for admin/dashboard leaks.
      - the query itself — does it filter by `studioId`?

- [ ] **4. Image rendering bug?** Before touching components, check the
      three-format URL logic in `tattooista-next/src/lib/image-utils.ts`
      (external URL vs relative path vs filename-only).

- [ ] **5. Hand off to the method.** Invoke `superpowers:systematic-debugging`
      and follow it to find the root cause. Do not patch symptoms.

- [ ] **6. Regression test.** If the bug lives in `lib/` (tenant, slug, studio,
      placeholder, etc.), add or extend a `vitest` test in
      `tattooista-next/tests/lib/` so it cannot regress. Run
      `cd tattooista-next && npm test`.

- [ ] **7. Think before pushing.** Before any `git push`, verify:
      1. Will this work on Vercel (not just localhost)?
      2. Are all required env vars set on Vercel?
      3. Does the production DB have the right schema/data?
      4. Do file paths resolve correctly (no local-only files)?
      5. Does the hostname/URL pattern work on `vercel.app`?
