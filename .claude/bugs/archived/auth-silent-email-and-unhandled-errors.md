# Auth actions swallow email failures and turn infra errors into raw 500s

## Status
FIXED (2026-08-10) — not yet committed.

## Issue
None — found while diagnosing a password-reset 500 on 2026-08-10. No GitHub issue was created (CLAUDE.md forbids touching external accounts); open one if this should be a board card.

## Branch
privacy-policy

## Environment
BOTH — the code path is environment-independent. Observed LOCAL (Docker Postgres) while the DB was down; the same code produces the same failure on Vercel/Neon whenever SMTP or the DB is unavailable.

## Area
auth

## Bug Summary

Two distinct defects in `tattooista-next/src/lib/actions/auth.ts`, both found while diagnosing an unrelated 500. That original 500 was just Docker/Postgres being down — **not** a code bug, so it gets no INDEX row of its own.

### Defect 1 — email send failures were silently swallowed

**Steps to reproduce:**
1. Break SMTP (wrong `SMTP_PASS` in `.env`, or take the mail host offline).
2. Go to `/reset-password`, enter the address of an existing user, submit.

**Expected:** the user is told the email could not be sent, so they can retry.

**Actual:** the UI showed "If an account with that email exists, we've sent a password reset link." No email ever arrived. The user waits forever.

**Cause:** `sendPasswordResetEmail` / `sendVerificationEmail` catch their own errors and *return* `{ error }` (`src/lib/email.ts:71-74`, `115-118`). Every caller `await`ed them and discarded the return value — `register` (was line 65), `requestPasswordReset` (was 190), `resendVerificationEmail` (was 267), `createStudio` (was 361).

### Defect 2 — no error handling around DB calls

**Steps to reproduce:**
1. Stop Postgres (`docker stop tattooista-postgres`).
2. Go to `/reset-password`, enter any email, submit.

**Expected:** a readable error message.

**Actual:** `POST /reset-password 500`; the client's bare `catch` showed a generic "Something went wrong" toast. The real Prisma `P1001` appeared only in server logs.

**Cause:** `requestPasswordReset`, `verifyEmail`, and `resetPassword` had no `try`/`catch`, so any Prisma throw propagated out of the server action. `createStudio` already did this correctly; the others were never brought in line.

**Affected:** `/reset-password`, `/verify-email`, `/register`, studio signup. All studios (not tenant-scoped).

## Tasks

### Done
- [x] Handle the `{ error }` return of `sendPasswordResetEmail` in `requestPasswordReset`
- [x] Handle the `{ error }` return of `sendVerificationEmail` in `register`, `resendVerificationEmail`, `createStudio`
- [x] Wrap the DB work of `requestPasswordReset`, `resetPassword`, `verifyEmail`, `register`, `resendVerificationEmail` in try/catch
- [x] Regression test in `tests/lib/auth-actions.test.ts`
- [x] Verify the tests fail against pre-fix code

## Discovered

- `src/lib/email.ts`: every `send*Email` helper is **non-throwing by design** — it catches internally and signals failure through its return value (`{ success: true }` vs `{ error: string }`). `await send…()` therefore *always* looks like it worked. Any new caller must inspect the result; there is no exception to catch. This is why the failure was invisible for so long.
- The email helpers' return type is a union of object literals, so `result.error` does not narrow. Use `if ("error" in result)` — `result.error` is a TS error under strict mode.
- `getTransporter()` (`email.ts:6-27`) throws when `SMTP_HOST`/`SMTP_USER`/`SMTP_PASS` are unset, but it is called *inside* each helper's `try`, so even a total misconfiguration surfaces as a returned `{ error }`, never a throw. Missing SMTP config cannot 500 — if you see a 500 in an auth action, look at Prisma, not email.
- Email-enumeration masking was **deliberately removed** from `requestPasswordReset` (owner's call, 2026-08-10). It used to return an identical "if an account with that email exists…" message whether or not the user existed. This is a tattoo-studio booking app, not a domain where account existence is sensitive, and the vague message made a real "wrong email, nothing sent" indistinguishable from success. It now says plainly: no account → error, sent → "Password reset link sent." Do not reintroduce the hedge.
- `register`/`createStudio` must **not** fail hard on a bad send: the account/studio is already committed, and the email is unrepeatable from the signup form (the address is now taken). They return `success: true` with a message pointing at "Resend verification email" instead.
- Testing `actions/auth.ts` under vitest needs three mocks beyond `@/lib/prisma`: `@/lib/auth`, `next/cache`, and `next-auth` itself (it imports `AuthError` directly, and the real package pulls in `next/server`, which does not resolve in the node runner). Mock objects must be built in `vi.hoisted()` — `vi.mock` factories are hoisted above ordinary `const`s.

## Actual Fix Notes

- `requestPasswordReset`: wrapped the DB work in try/catch (logs the real error, returns a generic message). Now checks `sendPasswordResetEmail`'s result and, on failure, **deletes the token it just created** before returning an error — an undeliverable token should not sit in the table until it expires. Also dropped the enumeration-masking messages in favour of plain ones (see `## Discovered`); `src/app/(auth)/reset-password/reset-password-content.tsx` success text updated to match.
- `resetPassword`, `verifyEmail`: wrapped in try/catch. No behavior change on the happy or already-handled paths.
- `register`: DB work wrapped in try/catch; the email send moved *outside* the try so a send failure is not misreported as a registration failure. Returns `success: true` with a "use resend" message when the send fails.
- `resendVerificationEmail`: wrapped in try/catch, and reports send failure as a plain error — this action already discloses whether the account exists ("No user found with this email"), so there was no enumeration reason to hide it.
- `createStudio`: only the discarded email result was fixed; its existing transaction try/catch was already correct and was left alone.
- Followed the existing inline-try/catch convention (`createStudio`, line ~301) rather than introducing a shared helper — no such helper exists anywhere in `src/lib/actions/`.

## Files Modified
- `tattooista-next/src/lib/actions/auth.ts`
- `tattooista-next/tests/lib/auth-actions.test.ts` (new)

## Regression Test

`tattooista-next/tests/lib/auth-actions.test.ts` — 8 tests covering both defects: failed-send reporting for `requestPasswordReset` and `resendVerificationEmail`, token cleanup on failed send, `P1001` producing an `{ error }` result rather than a throw in all three actions, and an unknown address returning an error without creating a token.

`cd tattooista-next && npm test` → **7 files, 39 tests passed** (was 31).

Verified the tests are meaningful: with `src/lib/actions/auth.ts` reverted to HEAD, **6 of the 8 fail**. The 2 that pass assert behavior that was already correct.

## Takeaway
Every `send*Email` helper in `src/lib/email.ts` catches internally and reports failure via its **return value**, never a throw — `await send…()` without checking `if ("error" in result)` silently tells the user an email was sent when it was not.
