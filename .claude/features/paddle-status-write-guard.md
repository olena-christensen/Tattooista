# Paddle status-write guard

## Status
DONE on the dev branch. Schema applied 2026-08-16 (`db push`); `migrate diff` reports no
difference; both columns nullable, 5 studios intact, 0 on PRO. Ticked in `docs/go-live.md`.
**Production still needs the same two columns.** Needs testing.

## Issue
None. Tracked in `tattooista-next/docs/go-live.md` → "Blocking — before taking a real
payment": *"When saving a subscription status, refuse to replace a final status with an
earlier one that arrives late."* The board holds single bugs only.

## Goal
Stop a late-arriving webhook from undoing a later one.

## The defect this fixes

Paddle retries webhooks, so a retry of an *earlier* event can land after a later one.
Concretely, before this change:

1. Owner cancels. `subscription.canceled` arrives → `plan: FREE`, `paddleSubscriptionId: null`.
2. A `subscription.updated` carrying `status: "active"`, generated seconds *earlier*, is
   retried and lands second.
3. `findStudio()` still matches it: `paddleSubscriptionId` is now null, so the lookup falls
   through to `customer_id`.
4. The handler saw `active` and **re-granted PRO**. The cancellation was silently undone.

Nothing compared event times. `occurred_at` was in the event interface and never read. The
`canceled` paths had id guards; the `active` path had none.

## Files
- `prisma/schema.prisma` — `Studio.paddleEventAt DateTime?`, `Studio.paddleStatus String?`.
- `src/lib/paddle-subscription.ts` — **new.** `decideSubscriptionWrite(studio, event)`.
- `src/app/api/paddle/webhook/route.ts` — keeps signature check, parsing, lookup and the
  write; the branching moved out.
- `tests/lib/paddle-subscription.test.ts` — **new**, 13 tests.

## How it works

`decideSubscriptionWrite()` returns either `{ apply: false, reason }` or
`{ apply: true, data }`. An ignored event is still acknowledged with 200 — Paddle must not
retry something refused on purpose — and logged with its reason.

- `paddleEventAt` is the `occurred_at` of the last event **acted on**. Any event strictly
  older is ignored.
- `paddleStatus` is the status that event carried, so a misbehaving subscription is readable
  without inferring it from `plan`.
- Both advance on every applied event, including `past_due`, which changes no plan.

## Decisions & trade-offs

- **Only strictly older events are ignored.** A duplicate delivery carries the *same*
  `occurred_at`; re-writing identical values changes nothing, so equality passes.
- **An unparsable `occurred_at` is refused, not applied.** An event that cannot be placed in
  time cannot be ordered, and applying it risks undoing a later one. Logged loudly.
- **The logic lives in `src/lib/`, not in the route.** The route imports `next/server`, which
  the vitest node runner cannot load — the same reason `tests/lib/auth-actions.test.ts` mocks
  `@/lib/auth` wholesale. Extracting it is what makes the ordering rules testable at all.
- **The guard covers every `subscription.*` event**, not only plan-changing ones — otherwise
  a non-plan event would advance nothing and leave ordering half-enforced.
- **Existing rows have `paddleEventAt = null`**, so the first event after deploy always
  applies. No backfill.

## Verification

- `npx vitest run` → 9 files, 61 tests pass (was 8/48). 13 are new, including the exact
  cancel-then-stale-active sequence above.
- `npx tsc --noEmit` clean; `npx eslint` clean on both touched source files.
- **Not run against a real webhook.** Needs testing.

## Before this deploys

Production needs the same two columns, or every subscription webhook fails on the write.
Both are nullable additions, so nothing existing is destroyed and no backfill is needed —
`paddleEventAt = null` means "nothing applied yet", and the first event after deploy applies.

## TODO / follow-ups
- The other two webhook hardening tasks in go-live are untouched: the daily check for
  payments stuck pending, and closing abandoned checkouts so that check stops asking.
