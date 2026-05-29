# Tattooista Workflow Skills Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two project-level guardrail skills — `tattooista-bug-fixing` and `tattooista-feature-building` — that encode Tattooista-specific gotchas and hand off to the generic superpowers/feature-dev skills.

**Architecture:** Each skill is a single rigid `SKILL.md` (frontmatter + short checklist + explicit handoff). They live in the repo at `.claude/skills/<name>/SKILL.md`, the first project-level skills in this repo. They re-implement no methodology — they gate on project rules then invoke `superpowers:systematic-debugging` / `feature-dev:feature-dev`.

**Tech Stack:** Markdown skill files (Claude Code skill format), validated by frontmatter inspection. No code, no build step.

---

## File Structure

- Create: `.claude/skills/tattooista-bug-fixing/SKILL.md` — bug-fixing guardrail checklist + handoff.
- Create: `.claude/skills/tattooista-feature-building/SKILL.md` — feature-building guardrail checklist + handoff.

Both paths are relative to repo root `/Users/morthalion/Projects/Tattooista`.

---

### Task 1: Create the `tattooista-bug-fixing` skill

**Files:**
- Create: `.claude/skills/tattooista-bug-fixing/SKILL.md`

- [ ] **Step 1: Create the directory**

Run: `mkdir -p /Users/morthalion/Projects/Tattooista/.claude/skills/tattooista-bug-fixing`
Expected: no output, exit 0.

- [ ] **Step 2: Write the skill file**

Create `.claude/skills/tattooista-bug-fixing/SKILL.md` with exactly this content:

```markdown
---
name: tattooista-bug-fixing
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
      or **failing to scope to one studio**? Check:
      - `getTenantContext()` (`src/lib/tenant.ts`) — is it called and used?
      - the `x-studio-id` header set by `proxy.ts` — is it present on the request?
      - the query itself — does it filter by `studioId`?

- [ ] **4. Image rendering bug?** Before touching components, check the
      three-format URL logic in `src/lib/image-utils.ts` (external URL vs
      relative path vs filename-only).

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
```

- [ ] **Step 3: Verify the file exists and frontmatter is well-formed**

Run: `head -7 /Users/morthalion/Projects/Tattooista/.claude/skills/tattooista-bug-fixing/SKILL.md`
Expected output (first 7 lines):
```
---
name: tattooista-bug-fixing
description: Use when fixing a bug, regression, or unexpected behavior in the Tattooista project. Enforces project-specific gates (tenant isolation, DB/env reproduction, regression tests) before handing off to systematic debugging.
metadata:
  skillType: rigid
---

```

- [ ] **Step 4: Commit**

```bash
cd /Users/morthalion/Projects/Tattooista
git add .claude/skills/tattooista-bug-fixing/SKILL.md
git commit -m "feat: add tattooista-bug-fixing guardrail skill"
```

---

### Task 2: Create the `tattooista-feature-building` skill

**Files:**
- Create: `.claude/skills/tattooista-feature-building/SKILL.md`

- [ ] **Step 1: Create the directory**

Run: `mkdir -p /Users/morthalion/Projects/Tattooista/.claude/skills/tattooista-feature-building`
Expected: no output, exit 0.

- [ ] **Step 2: Write the skill file**

Create `.claude/skills/tattooista-feature-building/SKILL.md` with exactly this content:

```markdown
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
      model gets a `studioId`; any new query scopes via `getTenantContext()`
      (`src/lib/tenant.ts`) and filters by `studioId`. A new tenant-scoped query
      gets a `vitest` test in `tattooista-next/tests/lib/`.

- [ ] **5. Hand off to the method.** Invoke `feature-dev:feature-dev` for the
      build process. Use `tattooista-styling` for ALL UI/styling work.

- [ ] **6. Think before pushing.** Before any `git push`, verify:
      1. Will this work on Vercel (not just localhost)?
      2. Are all required env vars set on Vercel?
      3. Does the production DB have the right schema/data?
      4. Do file paths resolve correctly (no local-only files)?
      5. Does the hostname/URL pattern work on `vercel.app`?
```

- [ ] **Step 3: Verify the file exists and frontmatter is well-formed**

Run: `head -7 /Users/morthalion/Projects/Tattooista/.claude/skills/tattooista-feature-building/SKILL.md`
Expected output (first 7 lines):
```
---
name: tattooista-feature-building
description: Use when building a new feature, page, component, or model in the Tattooista project. Enforces project-specific gates (MERN source-of-truth, no hallucinated data, multi-tenant by default) before handing off to feature development.
metadata:
  skillType: rigid
---

```

- [ ] **Step 4: Commit**

```bash
cd /Users/morthalion/Projects/Tattooista
git add .claude/skills/tattooista-feature-building/SKILL.md
git commit -m "feat: add tattooista-feature-building guardrail skill"
```

---

### Task 3: Verify both skills are discoverable

**Files:** none (verification only)

- [ ] **Step 1: Confirm both skill files exist**

Run: `ls /Users/morthalion/Projects/Tattooista/.claude/skills/*/SKILL.md`
Expected: lists both
```
.../.claude/skills/tattooista-bug-fixing/SKILL.md
.../.claude/skills/tattooista-feature-building/SKILL.md
```

- [ ] **Step 2: Confirm Claude Code lists the new skills**

In a new prompt, the user runs `/` or asks Claude to list available skills.
Expected: `tattooista-bug-fixing` and `tattooista-feature-building` both appear.
(Skills are loaded at session start, so a fresh session may be required for them
to show up.)

---

## Self-Review

**1. Spec coverage:**
- Shared shape & conventions (location `.claude/skills/<name>/SKILL.md`, frontmatter with `skillType: rigid`, checklist + handoff, `tattooista-` naming) → Tasks 1 & 2 file content. ✓
- Bug-fixing 7-point checklist → Task 1 Step 2 (ask, reproduce/DB/env, tenant-first, image-utils, handoff to systematic-debugging, regression test, push check). ✓
- Feature-building 7-point checklist → Task 2 Step 2 (ask/brainstorm, MERN source-of-truth + tattooista-styling, no hallucinated data, multi-tenant + test, external accounts, handoff to feature-dev, push check). ✓
- Out of scope (no styling-skill migration, no extra skills, no CLAUDE.md changes) → respected; nothing added. ✓

**2. Placeholder scan:** No TBD/TODO/"handle edge cases" — every file's full content is embedded verbatim. ✓

**3. Type consistency:** Skill names (`tattooista-bug-fixing`, `tattooista-feature-building`), referenced files (`src/lib/tenant.ts`, `src/lib/image-utils.ts`, `proxy.ts`, `tattooista-next/tests/lib/`), and handoff skill names (`superpowers:systematic-debugging`, `feature-dev:feature-dev`, `tattooista-styling`, `superpowers:brainstorming`) are used consistently across tasks. ✓
