# Terms and Conditions page

## Status
BUILT (uncommitted, branch `privacy-policy`) as of 2026-06-07. No GitHub issue (built directly), so the slug is `terms-and-conditions`.

## Goal
A static `/terms` page holding the Tattooista Terms and Conditions ("Legal Terms"), built 1:1 the same way as `/privacy` and `/cookie-policy` — consistent shell, monochrome theme, no Termly cruft. Self-hosted (Termly being cancelled).

## Scope
- **In:** static Server Component at `(public)/terms/page.tsx`; full 29-section Termly Terms export re-authored as semantic JSX; in-page TOC anchors; footer "Terms" link wired to `/terms`.
- **Out:** no Termly script, no dynamic data. The hidden Termly `terms123` DSAR anchor is removed.

## Files
- `tattooista-next/src/app/(public)/terms/page.tsx` — **NEW.** Static Server Component, exports `metadata` (`title: "Terms and Conditions"`). Identical shell + className constants as `privacy/page.tsx` (`headingClass`, `subheadingClass`, `bodyClass`, `linkClass`, `listClass`, `listItemClass`, `bold`). Renders `<PlatformHeader />` + `<Container max-w-[860px]>` + `<PlatformFooter />` itself (the `(public)/layout.tsx` only wraps `<main>` — no shared header/footer there).
- `tattooista-next/src/components/shared/platform-footer.tsx:23` — **EDIT.** Footer "Terms" changed from `<a href="#">` to `<Link href="/terms">`, matching the Privacy (line 22) and Cookie Policy (line 24) links.

## How it works / key decisions
- **Pattern = hand-authored JSX, NOT injected HTML** (same as privacy/cookie-policy). All Termly cruft stripped: both injected `<style>` blocks, every `data-custom-class`, `<bdt>`, `MsoNormal`/Word-export inline styles, the `terms123` hidden DSAR anchor.
- **Monochrome links.** Termly blue (`#3030F1` / `rgb(0,58,250)`) → `linkClass` = `text-foreground underline underline-offset-4`.
- **TOC + anchors.** 29 numbered sections each carry the Termly section id (`#services`, `#ip`, … `#contact`); TOC links to them. Headings have `scroll-mt-28` so the fixed header doesn't clip the jump target.
- **Cross-references kept faithful:** §15 Privacy Policy links to `https://tattooista.app/privacy` (full external URL with `target="_blank"`, matching how privacy renders tattooista.app links). DSAR/data requests are not part of Terms; §29 Contact lists the Kyiv postal address + `legal@nothingweird.agency` + phone.
- **Faithful content:** company = "{COMPANY}" dba Tattooista; SaaS description (free ad-supported tier + paid PRO); payment methods Visa/Mastercard/Amex/PayPal; payments in Euros; governing law + arbitration seat = Ukraine/Kyiv; servers US + Germany; "Last updated June 07, 2026". All-caps disclaimer/liability text preserved as-is. No typos needed correcting in this export.
- Contact email here is `legal@nothingweird.agency` (note: privacy uses `privacy@nothingweird.agency`; cookie-policy uses `founder@nothingweird.agency` — each page keeps the address from its own Termly export).

## Multi-tenant notes
Platform-level, **not** tenant-scoped. Lives under `(public)/`, no `studioId`, no DB, no tenant resolution.

## Verification
- `npx tsc --noEmit` — clean for the new/edited files (only the pre-existing `tests/lib/placeholder.test.ts` vitest-globals errors remain, unrelated).
- `eslint` on both files — clean.
- Live fetch (dev server running): `GET /terms` → **200**, `<title>Terms and Conditions | Tattooista</title>`, **0** termly/`terms123`/`<bdt`/`data-custom-class`/`MsoNormal` references, 31 `<h2>` (29 sections + "Agreement to Our Legal Terms" + "Table of Contents"), footer `href="/terms"` present.

## TODO / follow-ups
- Footer "Contact" link is still `href="#"` (out of scope here).
- Commit alongside the footer edit when the user is ready (commits/pushes are the user's responsibility per CLAUDE.md).
