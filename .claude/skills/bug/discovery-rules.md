# Discovery Writing Rules

> How `## Discovered`, `## Actual Fix Notes`, and `## Takeaway` are written in a bug.md.

## Why this matters

Archived bug.md files become the project's local knowledge base. When you later edit a file a prior bug touched, the FIX phase surfaces that bug as a regression warning. **The quality of the warning depends on the quality of the takeaway.** "Fixed tenant.ts" is useless in six months; an explanation of *why* the fix works saves the next session hours.

## `## Discovered` — one bullet per pattern

Format: `- {component/area}: {what happens and why — the insight, not just the location}`

**Bad** (just a breadcrumb):
```
- tenant.ts: changed the query
- portfolio: added a filter
```

**Good** (reusable, explains the why):
```
- requireSessionStudio() resolves tenant from the header FIRST, then falls back to the session's studioSlug. proxy.ts does NOT set x-studio-id, so admin queries almost always hit the session fallback — a missing studioId filter there leaks across studios even though the header path looks correct.
- image-utils: a filename-only value (no "/") resolves to /{type}/{entityId}/{filename}; a value containing "/" is treated as a committed relative path. Seed data uses relative paths, admin uploads use bare filenames — mixing them silently 404s.
```

**Rules:**
- Include the **why** — root cause, interaction, trade-off.
- Reference specific symbols/files but explain the relationship.
- Tenant-isolation, local-vs-prod (Postgres vs Neon), and image-utils gotchas are the highest-value entries here.
- Max ~20 bullets — collapse oldest if exceeded.

## `## Actual Fix Notes` — per task

What changed, why, any deviation from the planned approach.

**Bad:** `- Fixed the leak`
**Good:** `- Added studioId filter to the portfolio query in getStudioGallery(). Original plan assumed getTenantContext() resolved the studio, but the header is empty in admin context — switched to requireSessionStudio(). Confirmed against demo + a second seeded studio.`

## `## Takeaway` — single sentence, written at FINALIZE

Goes into INDEX.md as the regression-warning hint. Must be useful **out of context** — assume the future reader hasn't read the bug.

**Bad:** `Tenant scoping works now`
**Good:** `Admin/server-action queries resolve tenant via requireSessionStudio() (session fallback), NOT the x-studio-id header — always filter these by the resolved studioId or data leaks across studios.`

## When the user says "remember this"

If the user gives a correction or insight mid-fix, write it to `## Discovered` immediately (don't wait for completion), formatted per the rules above. This is project knowledge — it stays in the bug.md, not in personal memory.
