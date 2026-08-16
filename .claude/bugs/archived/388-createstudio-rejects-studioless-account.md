# Signup rejects an existing account that owns no studio, so it can never create one

> **SUPERSEDED 2026-08-16 — this fix was removed.** The premise was wrong: it treated an
> account with no studio as a legitimate user needing a way in. The owner's model is that
> **no studio = no account = cannot be logged in**, so that state must not exist at all.
> `authorize()` now refuses any account without a studio, the orphan row was cleaned up,
> and everything this doc describes (`createStudioForExistingUser`, the signed-in
> create-studio form, `?create=studio`, the `studioSlug` token refresh) was deleted.
> Kept as a record of the reasoning error, not as a description of the code.


## Status
FIXED (2026-08-15) — not yet committed.

## Issue
https://github.com/olena-christensen/Tattooista/issues/388

## Branch
email-fix

## Environment
BOTH — environment-independent code path. Reported on VERCEL (tattooista.app) with `olenakunina@gmail.com`.

## Area
auth

## Bug Summary

**Steps to reproduce:**
1. Use an account that exists and is verified but has no `StudioMembership` (`olenakunina@gmail.com`).
2. Landing page → "Create Your Studio" → enter that email → submit.

**Expected:** the account gets a studio.

**Actual:** rejected with *"This email is already associated with a studio on our platform.
Please use a different email or sign in to your existing studio."* Both suggestions are dead
ends — the account owns nothing, and signing in leads nowhere (see the
`login-no-studio-silent-reload` fix).

**Cause:** `createStudio()` (`actions/auth.ts:352-357`) checks only whether a `User` row
exists for the email. It never checks whether that user actually **owns** a studio, so
"user exists" is treated as "user has a studio".

**Affected:** every account with no OWNER membership. Platform-level, not tenant-scoped.

## Tasks

### To Do

### In Progress

### Done
- [x] Let a signed-in user with no studio create one (identity from the session, not the form)
- [x] Refresh `studioSlug` in the JWT after creation, or admin stays broken
- [x] Give the signed-out "email already exists" case a message that points somewhere real
- [x] Route the studio-less login straight to the create-studio form
- [x] Regression tests
- [x] Run `npm test`

## Discovered

- **The session carries `studioSlug`, and it is written only at sign-in.** `auth.ts:112-119`
  sets it inside `if (user)`; the `trigger === "update"` branch (`:122-126`) refreshes only
  `displayName` and `avatar`. So a user who creates a studio mid-session keeps
  `studioSlug: null` in their JWT.
- **That stale null breaks the whole admin area**, not just cosmetics: `getSessionStudio()`
  (`tenant.ts:74`) returns null when `session.user.studioSlug` is falsy, so
  `requireSessionStudio()` throws "This action requires a studio context" for every admin
  server action. Any fix that creates a studio for an already-signed-in user **must** also
  refresh the token, or the user is locked out until they sign out and back in.
- `(public)/page.tsx:8-10` redirects anyone whose session has a `studioSlug` to their studio.
  So the landing page is only ever seen by signed-out users and by studio-less accounts —
  exactly the population this fix targets. No extra guard needed there.
- `SessionProvider` wraps the entire app from the root layout (`layout.tsx` → `Providers`
  → `providers.tsx:31`), so `useSession().update()` is usable on public routes, not just admin.
- Attaching a studio to an email typed into a public form would be account takeover. The
  signed-in path is safe *because* identity comes from the session and the submitted email
  is ignored entirely.

## Actual Fix Notes

- **New action `createStudioForExistingUser()`** rather than branching inside
  `createStudio()`. It reads the user id from `auth()` and **never** looks at an email or
  password in the form — that is the entire security argument, and keeping it as its own
  entry point makes it impossible for the signed-out path to fall into it by accident. The
  existing `createStudio()` flow is untouched apart from its message.
- **No verification email on this path.** `authorize()` refuses unverified accounts, so
  holding a session already proves the address is verified. Sending one would be noise.
- **`auth.ts` jwt callback**: the `trigger === "update"` branch now also carries
  `studioSlug`. Without this the fix is worse than the bug — the studio gets created and
  the user is locked out of it, because `getSessionStudio()` reads the stale `null`.
  The client calls `update({ studioSlug })` before navigating.
- **`createStudio()` message changed** from "This email is already associated with a studio
  on our platform" to "This email already has an account. Please sign in, then create your
  studio." The old wording asserted something usually false and offered two dead ends.
- **Login now routes to the form instead of explaining it.** The previous fix
  (`login-no-studio-silent-reload`) showed a message telling the user to click "Create one".
  That would have handed them the *signed-out* form, which rejects an email that already has
  an account — the very wall being fixed. `owner-login-form.tsx` now sends them to
  `/?create=studio`, and the reload is what lets the server see their session at all.
- **`CreateStudioSignedInForm` is a separate component**, not a prop-driven variant of
  `CreateStudioForm`. A conditional resolver would have meant a union-typed `useForm`, and
  the existing signed-out form is the tested, load-bearing path — not worth destabilising.
  Markup and classes are copied from it verbatim; no new styling was invented.

## Files Modified
- `tattooista-next/src/lib/validations/auth.ts` — `createStudioForExistingUserSchema`
- `tattooista-next/src/lib/actions/auth.ts` — new action; reworded `createStudio()` rejection
- `tattooista-next/src/lib/auth.ts` — jwt `update` trigger carries `studioSlug`
- `tattooista-next/src/components/forms/create-studio-signed-in-form.tsx` — new
- `tattooista-next/src/components/forms/owner-login-form.tsx` — route to `/?create=studio`
- `tattooista-next/src/components/platform-landing.tsx` — `signedInEmail` / `openCreateStudio`
- `tattooista-next/src/app/(public)/page.tsx` — pass session email and `?create=studio`
- `tattooista-next/tests/lib/auth-actions.test.ts` — 6 tests

## Regression Test

`tattooista-next/tests/lib/auth-actions.test.ts` — 6 tests on `createStudioForExistingUser`:
refuses with no session; creates for a studio-less account; **takes the owner from the
session while a `victim@example.com` is present in the form**; refuses when the account
already owns a studio; refuses on a taken slug; refuses without DPA acceptance.

`cd tattooista-next && npm test` → **7 files, 48 tests passed** (was 42).

Also clean: `npx tsc --noEmit` and `npm run lint` report nothing in the touched files.
(Both still surface pre-existing failures elsewhere — test-runner globals in
`tests/lib/placeholder.test.ts`, 5 `no-explicit-any` in `src/lib/tenant-prisma.ts`.)

**Not verified end-to-end.** No browser run: it needs the account password. Specifically
unproven is the `update({ studioSlug })` → navigate → admin-works sequence, which is the
riskiest part. Worth walking through manually before this ships.

## Takeaway
`session.user.studioSlug` is written into the JWT only at sign-in, and `getSessionStudio()`
treats a null slug as "no studio" — so anything that gives a signed-in user a studio must
also push the slug through the jwt `update` trigger, or it locks them out of the studio it
just created.
