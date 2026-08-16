# Handoff

> Current state at the end of the last session. **Read this before answering anything
> about where the project is.** Re-verify anything time-sensitive (branch, tree, issue
> state) with a command before repeating it — this file goes stale.
>
> Rules for editing this file: record only what was **decided** or **verified**. Never
> write a proposal as though it were agreed. If the assistant suggested something and the
> owner did not answer, it belongs under OPEN with "not agreed".

**Last updated:** 2026-08-16

---

## State (verified 2026-08-16)

Branch `email-fix`, 8 commits ahead of `main`.

```
c444cb3 Delete the old signup path left behind by the studio-creation flow
425092b Add studio link to dashboard and let owners reach the platform page
5a40787 Sign the user in from the verification link so signup needs one form
1cde1d5 Enforce no studio = no account; drop the signed-in signup path
01e432d Separate studio customers from platform users across auth and reviews
e4650ed Show a message when login succeeds but the account has no studio  ← superseded by 1cde1d5
09b255c Switch local dev to a Neon branch, retire Docker Postgres
0d22fdd fucking changes
```

## DECIDED by the owner — do not re-litigate

**Platform users = studio owners. Studio customers = `Client`. Two different objects that
never mix.** Sharing an email field does not make them the same thing.

- **No studio = no account = cannot log in.** `authorize()` refuses any `User` with no
  `StudioMembership`. A studio-less row is leftover data, not a person to accommodate.
  **Do not write code to support that state.**
- Customers have no login, ever. Platform code never reads `Client` / `Contact`.
- Reviews are left by customers, gated on the studio already holding their email on file.
- Signup collects credentials **once**. No login form before or after verification.

## What shipped in those commits

- Reviews attach to `Client`, not `User` (#389). Schema applied to the **Neon dev branch
  only** — production untouched.
- The verification link verifies *and* signs the user in, via a second credentials
  provider `email-verification` that takes the token instead of a password.
- `/` no longer redirects signed-in owners to their studio; the header shows "My Studio".
- Orphan row `olenakunina@gmail.com` deleted from the dev branch.

## Cleanup: the old signup path is deleted (c444cb3)

The owner's call: this was cleanup of a half-finished job (new route added, old one left
behind), not a feature decision. The live signup is `CreateStudioForm`
(`platform-landing.tsx:365`); everything below was unreachable but still compiling, and
`register()` still minted studio-less `User` rows that `authorize()` refuses.

Deleted:

- `src/components/forms/register-form.tsx`, `src/components/forms/login-form.tsx`
- `src/app/(auth)/register/page.tsx` — the whole route, not just the redirect stub, so
  `/register` no longer resolves
- `register()` in `src/lib/actions/auth.ts`
- `registerSchema` + `RegisterInput` (`src/lib/validations/auth.ts`)
- `LoginFormValues` + `RegisterFormValues` (`src/types/index.ts`)
- the two `export *` lines in `src/components/forms/index.ts`
- `"register"` from `PLATFORM_ROUTES` and from the `isAuthRoute` check in `src/proxy.ts`

Kept: the `bcrypt` / `crypto` / `sendVerificationEmail` imports in `auth.ts` — still used by
`resetPassword`, `resendVerificationEmail`, `createStudio`. `OwnerLoginForm` is the only
login form left.

Verified: grep for every removed symbol returns only `OwnerLoginForm`. `npx tsc --noEmit`
is clean across `src/` — its only 3 errors are `describe`/`it`/`expect` in
`tests/lib/placeholder.test.ts` (vitest globals missing from tsconfig), pre-existing and
unrelated. Needs testing.

## Cleanup: `verifyEmail()` deleted

Same pattern, found by auditing the rest of the session. `5a40787` added
`verifyEmailAndSignIn()` and left the old `verifyEmail()` behind; its last reference in the
repo was its own test. It operated on `prisma.user` only — **it never verified customers.**
Clients' emails are not verified at all: `createReview()` matches against a `Contact` the
studio already holds (`src/lib/actions/reviews.ts:106-114`), no token, no email. The
giveaway was its return message, *"You can now log in"* — the second login form 5a40787
existed to remove.

Deleted the function (`src/lib/actions/auth.ts`) and its `describe` block + import in
`tests/lib/auth-actions.test.ts`. No reference remains. 8 files / 48 tests pass;
`tsc --noEmit` clean apart from the pre-existing `placeholder.test.ts` globals.
Needs testing.

## Still half-done from that session — audited 2026-08-16, nothing agreed

Found by reading the whole session diff. Reported to the owner; **no decision taken on any
of these.**

1. **The sign-in-from-link path has no tests.** The `email-verification` provider
   (`src/lib/auth.ts:131-181`) does token expiry, single-use consumption and the no-studio
   refusal, and nothing in `tests/` touches it or `verifyEmailAndSignIn`. The same commit
   that added it (`1cde1d5`) also gutted `auth-actions.test.ts` — the 389 doc records 55
   tests at the time it was written; the suite is 48 now. Coverage fell while
   security-relevant code went in.
2. **`prisma.user.update({ where: { email } })` at `src/lib/auth.ts:152`** throws a raw
   Prisma `P2025` if the token outlives its user row — that surfaces as a crash, not as the
   "Verification Failed" card.
3. **An expired link dead-ends.** `verify-email-content.tsx:41-60` offers only "Go to
   Tattooista". `resendVerificationEmail()` exists with **0 callers** and has never had one
   (it predates this session) — that card is the obvious place for it.
4. **`.claude/features/389-reviews-belong-to-clients.md` is stale** — Status still says
   "code complete, uncommitted"; Verification still claims 55 tests.

Not from this session, noted so it isn't chased: 9 of the 10 review actions have no caller.
The 389 doc lists "any admin UI for moderating reviews" as explicitly out of scope, and
`src/app/[slug]/admin/reviews` has never existed in the history.

## Verified facts (not decisions)

- The reviews migration **drops `Review.userId`**. It was safe on the dev branch because
  that table was empty. There is no `User`→`Client` mapping, so on any database where the
  table is not empty, those rows cannot be carried over.

## OPEN — nothing agreed, ask before acting

- **#387** (open) — the assistant proposed closing it; **the owner did not agree**. Its
  three parts have different fates: "nobody can review" was addressed by #389; "build
  customer signup" contradicts the decided model; the dead-code part is now done (above).
- **#389** (open) — its work shipped in the commits above, but the issue is still open.
  What the issue should say is the owner's call.

## Working agreements

- **Never** commit, push, merge, or open PRs. Filing/closing issues is fine.
- **Git state, deployment, merging and testing are the owner's business.** Do not track
  them, list them as next steps, report their status, or mention them **at all** — no
  "not committed", no "staged/unstaged", no "left for you to commit", no branch
  cleanliness. Not committing is a rule for acting, not a thing to announce; announcing
  compliance with it is flood. Untested work is "needs testing" and nothing more.
- **Ask before every change**, DB writes included — the dev branch is no exception.
- **Verify state before stating it.** Run the command first; a wrong opening line makes the
  owner stop reading the whole message.
- **Never present a proposal as a decision.**
- Do not re-raise anything the owner has said is done or dropped.
- Local dev runs on the **Neon dev branch**, not Docker. A stale session cookie pointing at
  a studio absent from that database causes a mystery redirect — sign out.
