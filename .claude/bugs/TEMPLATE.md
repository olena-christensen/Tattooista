# {bug title}

## Status
IN PROGRESS

## Issue
{GitHub issue URL — the board card, e.g. https://github.com/olena-christensen/Tattooista/issues/42}

## Branch
{git branch}

## Environment
{LOCAL (Docker Postgres) | VERCEL (Neon prod) | BOTH — where the bug actually reproduces. Matters: local Postgres ≠ prod Neon.}

## Area
{free-form tag — e.g. tenant-isolation, image-rendering, auth, admin-dashboard, portfolio, seed. Used for behavioral grouping in INDEX.md.}

## Bug Summary
**Steps to reproduce:**
{exact steps}

**Expected:**
{what should happen}

**Actual:**
{what happens instead}

**Affected:** {URLs, components, studios, viewports}

## Tasks

### To Do
- [ ] {task 1}

### In Progress

### Done

## Discovered
{patterns, file paths, gotchas accumulated across tasks (see discovery-rules.md). Survives session breaks — primary cross-task context. Tenant-isolation findings, env differences, image-utils quirks go here.}

## Actual Fix Notes
{per-task: what changed, why, deviations from plan.}

## Files Modified
{list of changed file paths.}

## Regression Test
{the vitest test added/extended in tattooista-next/tests/lib/ (or "N/A — not a lib bug"). The command that proves it: `cd tattooista-next && npm test`.}

## Takeaway
{one-sentence reusable lesson — written at FINALIZE. Surfaced as a regression warning when someone later edits these files.}
