# Login succeeds but silently reloads the landing page when the account owns no studio

## Status
FIXED (2026-08-11) — not yet committed.

## Issue
None — reported directly by the owner on 2026-08-11 as "login not working on prod, no console errors, no network, nothing happens". No GitHub issue (CLAUDE.md forbids touching external accounts); open one if this should be a board card.

## Branch
email-fix

## Environment
BOTH — the code path is environment-independent. Observed on VERCEL (tattooista.app) with the account `olenakunina@gmail.com`.

## Area
auth

## Bug Summary

**Steps to reproduce:**
1. Use an account that is activated, has a password, and has **no** `StudioMembership` with role `OWNER` (e.g. `olenakunina@gmail.com`).
2. Open the landing page and click Sign in (the login form is a dialog in `platform-landing.tsx:354`, not the `/login` route).
3. Enter the correct email and password, submit.

**Expected:** either land somewhere useful, or be told why you can't.

**Actual:** the page reloads back to the landing page. No error, no message, no visible
network activity, no redirect anywhere. Indistinguishable from the login silently failing
— and because it is a **full page reload**, it also wipes the DevTools console and
network tab, which is why it looked like "0 happening".

**Cause:** the login *succeeds*. `owner-login-form.tsx:44` then calls `getMyStudioSlug()`,
which queries for a `StudioMembership` with `role: "OWNER"` (`actions/auth.ts:131-135`).
For an account with no studio it returns `null`, and `:48` runs
`window.location.href = "/"` — navigating to the page the user is already on.

**Affected:** every account with no OWNER membership, on both the landing-page dialog and
the `/login` route. Platform-level, not tenant-scoped.

## Tasks

### To Do

### In Progress

### Done
- [x] Replace the silent `window.location.href = "/"` with a message explaining the state
- [x] Regression test
- [x] Run `npm test`

## Discovered

- The login UI users actually reach is the dialog in `src/components/platform-landing.tsx:354`
  (`dialogMode === "login"`), **not** `src/app/(auth)/login/page.tsx`. Both render the same
  `OwnerLoginForm`, so a fix in the form covers both, but when reproducing "login is broken"
  reports, look at the landing dialog first — the `/login` route is the less-travelled path.
- A `window.location.href` assignment pointing at the current page is invisible as a bug
  report: the reload discards console and network history, so the user reports "nothing
  happened, no errors" for what is really a completed request plus a navigation.
- `getMyStudioSlug()` (`actions/auth.ts:131-135`) filters on `role: "OWNER"` specifically,
  so a STAFF-only member would hit the identical dead end. Not currently reachable — `STAFF`
  appears nowhere in `src/` outside the type definitions and there are zero STAFF rows — but
  it becomes a live bug the moment staff accounts ship.
- Diagnosis was done against the Neon dev branch (a point-in-time copy of prod), which
  showed `olenakunina@gmail.com` as `isActivated: true`, password set, and `MEMBERSHIPS: []`.

## Actual Fix Notes

- `owner-login-form.tsx`: the `else { window.location.href = "/" }` branch is gone. A null
  slug now calls `setServerError(...)` and returns, so the user stays on the form and is
  told they are signed in but have no studio, pointing at the "Create one" control. That
  control exists directly below the form in **both** hosts — a `<button onClick={openRegister}>`
  in the landing dialog (`platform-landing.tsx:356-362`) and a `<Link href="/">` on the
  `/login` route (`login/page.tsx:25-29`) — so the wording is accurate in either context.
- Reused the existing `text-destructive text-sm text-center` error paragraph rather than
  adding a new message style. Per the styling skill there is no MERN original for this
  state, and reusing the existing slot avoids inventing one. It renders red, which is
  arguably strong for what is a dead-end rather than a failure — worth revisiting if a
  neutral notice style is ever introduced.
- Left `getMyStudioSlug()` itself unchanged. Its `role: "OWNER"` filter is the reason the
  slug is null, but changing it would silently grant STAFF users an admin redirect — a
  separate decision, not a bug fix.

## Files Modified
- `tattooista-next/src/components/forms/owner-login-form.tsx`
- `tattooista-next/tests/lib/auth-actions.test.ts`

## Regression Test

`tattooista-next/tests/lib/auth-actions.test.ts` — 3 tests pinning the `getMyStudioSlug()`
contract the fix branches on: null when the user owns no studio, the slug when they do, and
null (without a DB query) when there is no session.

`cd tattooista-next && npm test` → **7 files, 42 tests passed** (was 39).

**Honest limitation:** these tests pin the *contract*, they do not catch this regression.
The changed behaviour lives in a React component, and the repo has no component-test
tooling — no `@testing-library/react`, no jsdom, and `vitest.config` sets
`environment: "node"`. Re-introducing `window.location.href = "/"` in the form would keep
all 42 green. Covering it properly means adding those dev dependencies, which was out of
scope here.

Also verified: `npx tsc --noEmit` and `npm run lint` report nothing in the touched files.
(Both surface pre-existing failures elsewhere — test-runner globals in `tests/lib/placeholder.test.ts`,
and 5 `no-explicit-any` errors in `src/lib/tenant-prisma.ts`. Neither is related to this fix.)

Not verified end-to-end: reproducing the actual login in a browser needs the account
password, which the agent does not have. The owner should confirm on prod after deploy.

## Takeaway
A `window.location.href` that targets the page the user is already on is an invisible
failure mode — the reload wipes the console and network log, so a completed request plus a
navigation gets reported as "nothing happens, no errors"; never navigate as the way to
handle a dead-end state, show a message.
