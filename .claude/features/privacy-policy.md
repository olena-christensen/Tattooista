# Privacy Policy page

## Status
BUILT (uncommitted, branch `privacy-policy`) as of 2026-06-07. No GitHub issue (built directly), so the slug is `privacy-policy` rather than `<issue#>-name`.

## Goal
A static `/privacy` page holding the Tattooista Privacy Notice, built the SAME way as `/cookie-policy` — consistent shell, monochrome theme, no Termly cruft. Self-hosted because Termly is being cancelled.

## Scope
- **In:** static Server Component at `(public)/privacy/page.tsx`; full 17-section Termly export re-authored as semantic JSX; in-page TOC anchors; US-state category table; footer "Privacy" link wired to `/privacy`.
- **Out:** no Termly script, no consent integration, no dynamic data. DSAR/data-subject requests route to `tattooista.app/contact` (already in the doc body), NOT to Termly.

## MERN source of truth
Net-new — platform-level, no equivalent in `Client/`. Content source was a pasted Termly HTML export (provided in-conversation, not committed anywhere).

## Files
- `tattooista-next/src/app/(public)/privacy/page.tsx` — **NEW.** Static Server Component, exports `metadata`. Renders `<PlatformHeader />` + `<Container max-w-[860px]>` + `<PlatformFooter />`, mirroring `cookie-policy/page.tsx` exactly (same className constants: `headingClass`, `subheadingClass`, `bodyClass`, `linkClass`, `listClass`, `listItemClass`).
- `tattooista-next/src/components/shared/platform-footer.tsx:22` — **EDIT.** Footer "Privacy" changed from `<a href="#">` to `<Link href="/privacy">`, matching the existing Cookie Policy link on line 24.

## How it works / key decisions
- **Pattern = hand-authored JSX, NOT injected HTML.** The cookie-policy page does not use `dangerouslySetInnerHTML`, `.html` import, or MDX — it retypes Termly's prose as clean React. The privacy page does the same. ALL Termly cruft stripped: the two injected `<style>` blocks, every `data-custom-class`, every `<bdt>` tag.
- **DSAR anchor removed.** Termly's hidden `<a class="privacy123" href="https://app.termly.io/dsar/...">` was dropped entirely (cancelling Termly). DSAR routing points to `https://tattooista.app/contact`.
- **Monochrome links.** Termly's `#3030F1` / `rgb(0,58,250)` blue links become `linkClass` = `text-foreground underline underline-offset-4` (readable on the dark bg). Matches cookie-policy.
- **TOC + anchors.** TOC items link to in-page ids (`#infocollect`, `#infouse`, … `#request`, plus summary anchors `#personalinfo`, `#sensitiveinfo`, `#withdrawconsent`, `#toc`). Headings carry `scroll-mt-28` so the fixed header doesn't cover the target on jump.
- **US-state category table** rendered as a real `<table>` with `border-border`, wrapped in `overflow-x-auto` for mobile.
- **Two source typos/dupes corrected** (not hallucinated content, just fixes): Termly's "Facebbok" → "Facebook"; the duplicated "by visiting …/contact" phrase in the "How to Exercise Your Rights" paragraph was de-duplicated to one visit + one email + the bottom contact details.
- **Faithful content:** company = "Olena Christensen, Individual Entrepreneur (FOP)" dba Tattooista; contact email `privacy@nothingweird.agency`; postal DPO address in Kyiv; "Last updated June 07, 2026"; payment processor Paddle; servers US + Germany; all 18 third-party categories; all 12 US categories; all rights lists.

## Multi-tenant notes
Platform-level, **not** tenant-scoped. Lives under `(public)/` with no `studioId`. No DB, no tenant resolution. (Note: `(public)/layout.tsx` only wraps `<main>` — it has NO shared header/footer, which is why the page renders `<PlatformHeader />`/`<PlatformFooter />` itself, same lesson as cookie-policy.)

## Verification
- `npx tsc --noEmit` — clean for the new/edited files (only the pre-existing `tests/lib/placeholder.test.ts` vitest-globals errors remain, unrelated).
- `eslint` on both files — clean.
- **Not yet manually rendered** in a browser this session. Static Server Component, low risk. Suggested check: `/privacy` renders with header/footer, TOC anchors jump correctly, table is readable on mobile, footer "Privacy" link navigates.

## TODO / follow-ups
- Terms footer link is still `href="#"` (out of scope here).
- Commit alongside the footer edit when the user is ready.
