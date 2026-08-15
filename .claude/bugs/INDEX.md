# Bug History Index

> Append-only log of every bug fixed via the `bug` skill. One row per fix. Newest at the top.
> Used by the FIX phase to surface regression warnings when a prior fix touched the same files/area.
> Only **fixed** bugs land here — bugs closed as "not a bug" do not.

| Issue | Date | Area | Title | Files | Commit | Takeaway |
|---|---|---|---|---|---|---|
| — | 2026-08-11 | auth | Login succeeds but silently reloads the landing page when the account owns no studio | tattooista-next/src/components/forms/owner-login-form.tsx, tattooista-next/tests/lib/auth-actions.test.ts | pending | A `window.location.href` that targets the page the user is already on is an invisible failure mode — the reload wipes the console and network log, so a completed request plus a navigation gets reported as "nothing happens, no errors"; never navigate as the way to handle a dead-end state, show a message. |
| — | 2026-08-10 | auth | Auth actions swallow email failures and turn infra errors into raw 500s | tattooista-next/src/lib/actions/auth.ts, tattooista-next/tests/lib/auth-actions.test.ts | pending | Every `send*Email` helper in `src/lib/email.ts` catches internally and reports failure via its **return value**, never a throw — `await send…()` without checking `if ("error" in result)` silently tells the user an email was sent when it was not. |
