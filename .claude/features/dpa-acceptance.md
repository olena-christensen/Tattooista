# DPA acceptance at studio onboarding

## Status
IN PROGRESS — committed locally? **No.** All changes are uncommitted in the working tree on branch `privacy-policy` (as of 2026-06-12). DB schema applied locally via `prisma db push`; **not yet applied to production (Neon)**.

## Issue
N/A — no GitHub board card for this work. (Related GDPR cluster on the roadmap: #356/#358/#357/#361, but this DPA task was not tracked as an issue.)

## Goal
Record that each studio (the Controller) has accepted the GDPR Article 28 Data Processing Agreement when it signs up. On successful studio creation we stamp the acceptance timestamp and the DPA version onto the `Studio` row, gated by a required checkbox in the create-studio form.

## Scope
- **In:** required acceptance checkbox in `create-studio-form.tsx`; `dpaAccepted` field in the existing `createStudioSchema`; server-side re-validation + server-set `dpaAcceptedAt` / `dpaVersion` on the `Studio` record; a single `DPA_VERSION` / `DPA_PDF_PATH` constant; two new nullable `Studio` columns.
- **Out / not yet:** no re-acceptance flow when `DPA_VERSION` is bumped (existing studios keep their old version); no admin UI to view/export acceptance records; the signable PDF itself still needs cleanup (see TODO); production DB columns not yet pushed.

## MERN source of truth
Net-new — no original in `Client/`. Platform/SaaS-level concern with no equivalent in the old MERN app.

## Files
All **uncommitted**:
- `tattooista-next/prisma/schema.prisma` — `Studio` model gains `dpaAcceptedAt DateTime?` and `dpaVersion String?` (nullable, additive).
- `tattooista-next/src/lib/constants.ts` — **NEW.** `DPA_VERSION = "1.0"` and `DPA_PDF_PATH = "/legal/Tattooista-DPA-v1.0.pdf"`. Single source so the version is bumpable later; referenced by the form (link) and the server action (acceptance record).
- `tattooista-next/src/lib/validations/auth.ts` — `createStudioSchema` gains `dpaAccepted: z.boolean().refine((v) => v === true, …)` inside the object (before the password-match `.refine`). `CreateStudioInput` updates via inference.
- `tattooista-next/src/components/forms/create-studio-form.tsx` — adds `dpaAccepted: false` to defaults, a final `FormField` checkbox (label links the PDF, `target="_blank" rel="noopener noreferrer"`), and appends `dpaAccepted` to the submit `FormData`.
- `tattooista-next/src/lib/actions/auth.ts` — `createStudio` coerces the boolean from `FormData`, re-validates via `createStudioSchema.safeParse`, and passes `dpaAcceptedAt: new Date()` + `dpaVersion: DPA_VERSION` into `createStudioWithDefaults` inside the transaction.
- `tattooista-next/src/lib/studio.ts` — `StudioCreationInput` gains optional `dpaAcceptedAt?: Date` / `dpaVersion?: string`; `createStudioWithDefaults` writes them onto `studio.create` (`?? null`).
- `tattooista-next/public/legal/Tattooista-DPA-v1.0.pdf` — the signable PDF (pre-existing; served at `/legal/Tattooista-DPA-v1.0.pdf`). **Still contains editorial `[REVIEW]/[CONFIRM]/[NOTE]` notes — see TODO.**

## How it works
1. **Form** (`create-studio-form.tsx`): the checkbox is bound to `dpaAccepted` via react-hook-form. Because `createStudioSchema` requires `dpaAccepted === true` and the form uses `zodResolver`, an unchecked box fails client validation (message *"You must accept the Data Processing Agreement"*) and `onSubmit` never fires. On submit, `dpaAccepted` is appended to `FormData` as `"true"`/`"false"`.
2. **Server action** (`actions/auth.ts`, `createStudio`): reads `formData.get("dpaAccepted") === "true"`, then runs the **same** `createStudioSchema.safeParse` — so a forged/unchecked request is rejected before any DB write. The acceptance timestamp (`new Date()`) and version (`DPA_VERSION`) are computed **server-side only** and never read from the client.
3. **Persistence** (`studio.ts`, `createStudioWithDefaults`): inside the existing creation transaction, `studio.create` writes `dpaAcceptedAt` / `dpaVersion` alongside the rest of the studio defaults.

## Multi-tenant notes
The two fields live on the `Studio` row itself (the tenant root), written in the same atomic transaction that creates the User + Studio + Membership + defaults. No cross-tenant access and no extra filtering needed — the acceptance record *is* part of the tenant's own root record.

## Decisions & trade-offs
- **`z.boolean().refine((v) => v === true)` instead of `z.literal(true)`.** `z.literal(true)` infers the TS type as `true`, which conflicts with the `dpaAccepted: false` default in react-hook-form's `defaultValues` (a `DeepPartial` that won't accept `false`) → `tsc` error. The boolean+refine form types cleanly with the `false` default while still requiring `true` to pass.
- **Version/timestamp set server-side, never client-supplied.** The only thing the client controls is the boolean, which is re-validated server-side. Prevents a tampered request from recording a false acceptance or a wrong version.
- **Single `DPA_VERSION` / `DPA_PDF_PATH` constant** so a future DPA revision is a one-line bump that propagates to the form link and the stored version.
- **`prisma db push`, not `migrate dev`.** This project has no `prisma/migrations/` baseline (it's managed with `db push`, per CLAUDE.md). `migrate dev` saw the whole schema as drift and wanted to **reset the database** — aborted before any reset. `db push` applied the two nullable columns non-destructively.

## Verification
- `tsc --noEmit` clean (only the pre-existing `placeholder.test.ts` test-runner-types noise).
- `db push` applied; `\d "Studio"` confirms `dpaAcceptedAt timestamp(3)` + `dpaVersion text`; existing 2 studios intact (no reset).
- Client + server blocking reasoned through (zodResolver client-side; `safeParse` server-side) — **not exercised in a browser this session.**

## TODO / follow-ups
- **Clean the signable PDF:** `Tattooista-DPA-v1.0.pdf` still has internal `[REVIEW]` (p.2), `[CONFIRM]` (p.4), `[NOTE]` (p.5), `[CONFIRM/EXPAND]` (p.6) editor notes baked into the customer-facing document. No source file exists in the repo — must be re-exported from the original (Google Doc/Word/etc.) with those removed. The p.2 SCC/Ukraine-adequacy transfer point also genuinely warrants a lawyer's review.
- **Production:** run `prisma db push` against Neon to add the columns before this ships.
- **Re-acceptance flow:** when `DPA_VERSION` bumps, existing studios keep the old version — there's no prompt to re-accept. Decide if/when that's needed.
- **Admin visibility:** no UI to view/export which studios accepted which DPA version and when.
- Manually verify the onboarding flow in a browser (checkbox blocks submit; record written on success).
