# Refund Policy page

## Status
BUILT (uncommitted, branch `privacy-policy`) as of 2026-06-07. No GitHub issue (built directly); slug `refund-policy`.

## Goal
A static `/refund` page holding the Tattooista Refund Policy, built 1:1 the same way as `/privacy`, `/terms`, `/cookie-policy` — consistent shell, monochrome theme, no Termly cruft. Self-hosted (Termly being cancelled).

## Scope
- **In:** static Server Component at `(public)/refund/page.tsx`; Termly "Return Policy" export re-authored as JSX and **adapted from physical goods to a digital SaaS subscription**.
- **Out:** NOT a separate global-footer item (intentional). Discoverable via **Terms §6 Subscriptions → Refunds**, which links to `https://tattooista.app/refund`; Terms itself is in the footer, so `/refund` is reachable. The hidden Termly `return123` DSAR anchor is removed.

## Files
- `tattooista-next/src/app/(public)/refund/page.tsx` — **NEW.** Static Server Component, exports `metadata` (`title: "Refund Policy"`). Same shell + className constants as the other legal pages (`headingClass`, `bodyClass`, `linkClass`). Renders `<PlatformHeader />` + `<Container max-w-[860px]>` + `<PlatformFooter />` itself (the `(public)/layout.tsx` only wraps `<main>`).
- **No footer edit.** `platform-footer.tsx` was deliberately left unchanged — verified it contains no "refund" reference. `/refund` is reached via Terms, not a footer item.
- `tattooista-next/src/app/(public)/terms/page.tsx` — **EDIT.** Added a `Refunds` `<h3>` sub-section under §6 Subscriptions (after `Fee Changes`) linking to `https://tattooista.app/refund` (external-URL form, matching how §15 links the Privacy Policy). This is how users discover the refund page.

## How it works / key decisions
- **Pattern = hand-authored JSX, NOT injected HTML** (same as the other legal pages). All Termly cruft stripped: `<style>` blocks, `data-custom-class`, `<bdt>`, `MsoNormal`, and the `return123` hidden DSAR anchor.
- **Physical-goods → digital-SaaS rewrite (per the task brief):** deleted all shipping/returns language — "postmarked", "new and unused condition", "original tags and labels", "original packaging", "mail your return", "Attn: Returns", the RMA number, and the blank `__________` mailing-address block. The source's separate **RETURNS** and **RETURN PROCESS** headings (both purely physical) were dropped; their substance was folded into a single **Refunds** section describing the email-based flow.
- **Reworded flow:** request a refund by emailing `billing@nothingweird.agency` within fourteen (14) days of purchase; processed within fourteen (14) days of the request; refunds may take 1–2 billing cycles to appear; we notify you by email when processed.
- **Sections kept:** Refunds, Exceptions (reworded to "defective or unsatisfactory service" — dropped "or exchange" since there are no exchanges for a subscription), Questions/contact.
- **Title:** page `<h1>` and `metadata` are "Refund Policy" (the Termly body was headed "RETURN POLICY" — renamed per the brief).
- **Contact block** (`<address>`, matching privacy/terms style): {COMPANY} + `billing@nothingweird.agency` + phone (+380)776591244. (Note: refund uses the `billing@` address; privacy uses `privacy@`, terms `legal@`, cookie-policy `founder@` — each page keeps the address from its own export.)

## Multi-tenant notes
Platform-level, **not** tenant-scoped. Under `(public)/`, no `studioId`, no DB, no tenant resolution.

## Verification
- `npx tsc --noEmit` — clean for the new file (only the pre-existing `tests/lib/placeholder.test.ts` vitest-globals errors remain, unrelated).
- `eslint` — clean.
- Footer check: `grep -c refund platform-footer.tsx` → 0 (confirmed not linked).
- Live fetch (dev server running): `GET /refund` → **200**, `<title>Refund Policy | Tattooista</title>`, **0** termly/`return123`/`<bdt`/`data-custom-class`/`MsoNormal` refs, **0** real physical-goods terms (an `RMA` substring hit was just inside "information"), `billing@nothingweird.agency` present.

## TODO / follow-ups
- None for this page. If a footer/legal-nav link is ever wanted, add `<Link href="/refund">` to `platform-footer.tsx` — intentionally omitted now.
- Commit when ready (commits/pushes are the user's responsibility per CLAUDE.md).
