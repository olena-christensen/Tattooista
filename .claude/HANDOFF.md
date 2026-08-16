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

Branch `email-fix`, **7** commits ahead of `main`, with **uncommitted work in the tree**.

```
425092b Add studio link to dashboard and let owners reach the platform page
5a40787 Sign the user in from the verification link so signup needs one form
1cde1d5 Enforce no studio = no account; drop the signed-in signup path
01e432d Separate studio customers from platform users across auth and reviews
e4650ed Show a message when login succeeds but the account has no studio  ← superseded by 1cde1d5
09b255c Switch local dev to a Neon branch, retire Docker Postgres
0d22fdd fucking changes
```

Uncommitted, awaiting the owner:

- The old-signup-path deletion (see below).
- `CLAUDE.md` — adds the "FIRST: Read the handoff" rule.
- `.claude/HANDOFF.md` — this file, still untracked.

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

## Uncommitted: the old signup path is deleted

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
- **Deployment, merging and testing are the owner's business.** Do not track them, list
  them as next steps, report their status, or mention them at all. Untested work is
  described as "needs testing" and nothing more.
- **Ask before every change**, DB writes included — the dev branch is no exception.
- **Verify state before stating it.** Run the command first; a wrong opening line makes the
  owner stop reading the whole message.
- **Never present a proposal as a decision.**
- Do not re-raise anything the owner has said is done or dropped.
- Local dev runs on the **Neon dev branch**, not Docker. A stale session cookie pointing at
  a studio absent from that database causes a mystery redirect — sign out.
