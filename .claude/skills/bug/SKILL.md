---
name: bug
description: Use when fixing a bug, regression, or unexpected behavior in the Tattooista project. Drives a documented bug lifecycle (create → fix → finalize → archive → INDEX) with project-specific gates (tenant isolation, local-vs-prod reproduction, image-utils, regression tests) before handing off to systematic debugging.
metadata:
  skillType: rigid
---

# Tattooista Bug Fixing

A **rigid** lifecycle skill. It does NOT replace the debugging method — it gates on
Tattooista-specific gotchas, keeps a documented trail, then hands off to
`superpowers:systematic-debugging` for root-cause work.

Every fixed bug leaves a trail, mirroring the feature docs:
- **Working state** (in progress, gitignored): `.claude-local/bugs/active/{slug}/bug.md`
- **Archived** (fixed, committed): `.claude/bugs/archived/{slug}.md`
- **Index** (append-only regression log): `.claude/bugs/INDEX.md`

`{slug}` is `<issue#>-<kebab-name>` from the GitHub issue (the board card) —
e.g. `42-portfolio-leaks-across-studios`. No issue yet? Use a plain kebab name
and add the issue link to the doc's `## Issue` once it exists. See
`.claude/github-board.md`.

Create a TodoWrite item per phase and work them in order.

## Phase detection (on entry)

1. Glob `.claude-local/bugs/active/*{arg-or-keyword}*/bug.md`.
   - **Found** → read it; resume from `## Status` + task state (To Do/In Progress → FIX; all Done → FINALIZE).
   - **Not found** → new bug → START.
2. Output one line, then work: **Bug: {slug} — Phase: {START|FIX|FINALIZE}**.

---

## START — reproduce, scope, create bug.md

- [ ] **1. Ask before acting.** Per CLAUDE.md: describe what you intend to do →
      wait for approval → then act. Never touch external accounts (Vercel, GitHub,
      npm, DB) — explain what the user must do instead.

- [ ] **2. Reproduce first; identify the environment.** Is the bug on **local**
      (Docker Postgres) or **Vercel** (Neon prod)? Reproduce before theorizing.
      - Local Prisma `P1001: Can't reach database server` → Docker DB is down →
        `docker start tattooista-postgres`.
      - Local Postgres is NOT prod Neon. Confirm the data assumption holds in the
        environment where the bug actually occurs.

- [ ] **3. Read the issue, scope tasks, then create bug.md.** If an issue
      number/URL was given, read it (`gh issue view <#>`) — repro/expected/actual
      and Area usually come straight from the Bug template. Read
      `.claude/bugs/TEMPLATE.md`, create `.claude-local/bugs/active/{slug}/bug.md`,
      and fill: title, `## Status: IN PROGRESS`, `## Issue` (the issue URL),
      `## Branch` (current), `## Environment`, `## Area`,
      `## Bug Summary` (repro/expected/actual/affected), `## Tasks → To Do`.

## FIX — one task at a time (assess → approve → implement → complete)

- [ ] **4. Suspect tenant isolation FIRST.** The most common bug class here is
      multi-tenant `studioId` scoping. Ask: is data **leaking across studios**, or
      **failing to scope to one**? Check (all in `tattooista-next/src/lib/tenant.ts`):
      - `getTenantContext()` — reads the `x-studio-id` header. NOTE: `proxy.ts` does
        NOT set this header, so it is usually empty.
      - `getSessionStudio()` / `requireSessionStudio()` — the real path for server
        actions: header first, then the logged-in user's `studioSlug` from session.
        Most admin/dashboard queries resolve tenant here — check this first for leaks.
      - the query itself — does it filter by `studioId`?

- [ ] **5. Image rendering bug?** Before touching components, check the three-format
      URL logic in `tattooista-next/src/lib/image-utils.ts` (external URL vs relative
      path vs filename-only).

- [ ] **6. Hand off to the method.** Invoke `superpowers:systematic-debugging` and
      follow it to the root cause. Do not patch symptoms.

- [ ] **7. Record as you go.** Append patterns to `## Discovered` and per-task notes
      to `## Actual Fix Notes` per `discovery-rules.md`. Move tasks To Do → In Progress
      → Done. Append changed paths to `## Files Modified`. Do NOT commit (CLAUDE.md).

## FINALIZE — test, archive, index

- [ ] **8. Regression test.** If the bug lives in `lib/` (tenant, slug, studio,
      placeholder, etc.), add or extend a `vitest` test in
      `tattooista-next/tests/lib/` so it cannot regress. Run
      `cd tattooista-next && npm test` and record the result in `## Regression Test`.

- [ ] **9. Write the takeaway** (one sentence, per `discovery-rules.md`) into the
      bug.md `## Takeaway`. Then **archive**: move
      `.claude-local/bugs/active/{slug}/bug.md` → `.claude/bugs/archived/{slug}.md`
      and remove the now-empty active dir.

- [ ] **10. Append to INDEX.** Insert a row at the top of the table in
      `.claude/bugs/INDEX.md`:
      `| {#issue or "—"} | {YYYY-MM-DD} | {area} | {title} | {comma-separated files} | {short sha or "pending"} | {takeaway} |`
      (use `pending` for the commit until the user commits). Suggest `Closes #<issue>`
      in the commit/PR so the board card auto-moves to Done.

- [ ] **11. Think before pushing.** Before any `git push`, verify:
      1. Will this work on Vercel (not just localhost)?
      2. Are all required env vars set on Vercel?
      3. Does the production DB have the right schema/data?
      4. Do file paths resolve correctly (no local-only files)?
      5. Does the hostname/URL pattern work on `vercel.app`?
      Per CLAUDE.md the skill never commits or pushes — hand the user a proposed
      commit message + the commands to run themselves.

## Regression warning (during FIX)

For files you're about to change, grep `.claude/bugs/INDEX.md` for the area/file. If a
prior fix touched them, surface its `Takeaway` before changing — your fix may interact
with or undo it. Inform-only; the user decides relevance.

## Close without fixing

If it turns out not to be a bug: revert any exploratory changes, `rm -rf` the active
`.claude-local/bugs/active/{slug}/` dir, and do NOT add a row to INDEX (only real fixes
become project knowledge). Suggest the user close the GitHub issue with the reason.
