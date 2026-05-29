---
name: tattooista-feature-building
description: Use when building a new feature, page, component, or model in the Tattooista project. Enforces project-specific gates (MERN source-of-truth, no hallucinated data, multi-tenant by default) before handing off to feature development.
metadata:
  skillType: rigid
---

# Tattooista Feature Building

This is a **rigid** guardrail skill. It does NOT replace the feature-development
method — it gates on Tattooista-specific rules, then hands off to
`feature-dev:feature-dev` for the build and `tattooista-styling` for all UI work.

Create a TodoWrite item for each step and complete them in order.

## Checklist

- [ ] **1. Ask / brainstorm before acting.** Per CLAUDE.md: describe → wait for
      approval → then act. For anything non-trivial, use `superpowers:brainstorming`
      first. Never touch external accounts (Vercel, GitHub, npm, DB) — explain
      what the user must do instead.

- [ ] **2. Is this a MERN migration?** If a matching component exists in
      `Client/src/`, the original is the **source of truth**. Before writing
      anything: invoke `tattooista-styling`, then read the original component AND
      its SCSS. Reproduce structure and styling exactly — do not "improve" or
      "simplify". If no original exists, say so explicitly and ask how to proceed.

- [ ] **3. Never hallucinate data.** Pull real content (style names, FAQ text,
      descriptions, seed data) from `tattooista-next/scripts/data/` or
      `Client/src/data/`. If it is not there, ask — do not invent it.

- [ ] **4. Multi-tenant by default.** Every data model has a `studioId`. Any new
      model gets a `studioId`. Tenant-scoped queries must resolve the current
      studio and filter by `studioId` (see `tattooista-next/src/lib/tenant.ts`):
      - Server actions: use `requireSessionStudio()` (header first, then the
        logged-in user's session `studioSlug`).
      - Subdomain/header contexts: `getTenantContext()` / `requireTenantContext()`.
      A new tenant-scoped query gets a `vitest` test in
      `tattooista-next/tests/lib/`.

- [ ] **5. Hand off to the method.** Invoke `feature-dev:feature-dev` for the
      build process. Use `tattooista-styling` for ALL UI/styling work.

- [ ] **6. Think before pushing.** Before any `git push`, verify:
      1. Will this work on Vercel (not just localhost)?
      2. Are all required env vars set on Vercel?
      3. Does the production DB have the right schema/data?
      4. Do file paths resolve correctly (no local-only files)?
      5. Does the hostname/URL pattern work on `vercel.app`?
