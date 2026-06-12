# Cookie consent + Cookie Policy page

## Status
PARTIALLY COMMITTED (as of 2026-05-31, branch `demo-unifying`).
- **Committed** in `cf23003` ("cookies concent banner"): the original `cookie-consent.tsx` (226 lines) + its mount in `providers.tsx`.
- **Uncommitted** in the working tree: the `cookie-policy/page.tsx` page (never committed — untracked), plus edits to `cookie-consent.tsx` (re-open support + policy link) and `platform-landing.tsx` (footer links).

> Doc written retroactively on 2026-05-31 — this feature was built directly as code before the `.claude/features/` convention existed, so no doc was created at build time.

## Goal
GDPR-style cookie handling for the platform: a consent banner that lets visitors accept/reject analytics & marketing cookies (necessary always on), persists the choice, and a full Cookie Policy page explaining usage. Users can re-open the banner later to change their mind.

## Scope
- **In:** consent banner with 3 categories (Necessary/Analytics/Marketing), persistence via cookie + localStorage mirror, re-open-from-footer, a static Cookie Policy page, footer links.
- **Out / not yet:** no actual analytics/marketing scripts are gated on the stored consent yet (the choice is recorded but nothing reads it server-side to conditionally load trackers). Privacy/Terms footer links are still `href="#"` placeholders.

## MERN source of truth
Net-new — no original in `Client/`. This is platform-level (no equivalent in the old MERN app).

## Files
- `tattooista-next/src/components/shared/cookie-consent.tsx` — the banner. **Committed base + uncommitted edits.**
- `tattooista-next/src/components/shared/providers.tsx:7,27` — imports and mounts `<CookieConsent />`. **Committed.**
- `tattooista-next/src/app/(public)/cookie-policy/page.tsx` — the policy page (static Server Component, exports `metadata`). Renders the shared `<PlatformHeader />` + `<PlatformFooter />` so it matches the rest of the site. **Untracked / never committed.**
- `tattooista-next/src/components/shared/container.tsx` — **NEW.** The site's horizontal frame primitive (`mx-auto w-full max-w-[1280px] px-4 min-[990px]:px-[70px]`). Replaces the string that was copy-pasted across the landing/footer/cookie pages. Override width via `className` (twMerge wins), e.g. cookie-policy uses `max-w-[860px]`. Used by header, footer, cookie-policy, and all 6 landing sections including the hero (hero padding moved off the `<section>` onto `<Container>` so hero content aligns with the header logo; the decorative line sits 70px from the screen edge now).
- `tattooista-next/src/components/shared/platform-header.tsx` — **NEW.** Shared site header extracted from `platform-landing.tsx`, wrapped in `<Container>` so brand/nav stay centered on ultra-wide screens. Optional `onSignIn` callback (landing passes its auth-dialog opener; other pages fall back to linking home). Nav anchors use `/#features` `/#pricing` so they work cross-route.
- `tattooista-next/src/components/shared/platform-footer.tsx` — **NEW.** Shared site footer extracted from `platform-landing.tsx`. Holds the Privacy/Terms/Cookie Policy/Cookie Preferences/Contact links; "Cookie Preferences" calls `openCookiePreferences()`.
- `tattooista-next/src/components/platform-landing.tsx` — now renders `<PlatformHeader onSignIn={openLogin} />` and `<PlatformFooter />` instead of inline markup. **Uncommitted edits.**

> **Lesson (do not repeat):** the cookie-policy page originally shipped with NO header/footer because they were embedded inside `platform-landing.tsx` rather than shared. Standalone pages have no shared `(public)/layout.tsx` header — the layout only wraps `<main>`. Any new full page must render `<PlatformHeader />` + `<PlatformFooter />` (or live under a layout that does).

## How it works
**Persistence** (`cookie-consent.tsx:8-44`): consent is stored under key `cookie_consent` as JSON `{ v, necessary:true, analytics, marketing }`. `CONSENT_VERSION = 1` — a version bump invalidates old consent (`readConsent` returns null if `v` mismatches). Written both as a cookie (`max-age` 1 year, `path=/`, `SameSite=Lax`) so the **server can read it via `next/headers`**, and mirrored to `localStorage`. Cookie is the source of truth.

**Render gating** (`cookie-consent.tsx:96-97,129-134`): uses `useSyncExternalStore`. The server snapshot (`consentDecidedServer`) returns `true` so the banner renders **nothing during SSR/hydration** (`document.cookie` is unreadable there); the client re-reads `readConsent()` and reveals the banner on a first visit.

**Re-open mechanism** (uncommitted, `cookie-consent.tsx:62-91,137-141`): a second external store (`forceOpen`) with the exported `openCookiePreferences()` entry point. Anything on the page (e.g. the footer button in `platform-landing.tsx`) can call it to re-show the banner after a choice was made. On re-open, toggles are seeded from the saved choice using the "adjust state during render" pattern (`cookie-consent.tsx:160-168`), not an effect.

**Dismiss** (`cookie-consent.tsx:144,170-180`): Escape OR the visible ✕ close button (top-right of the banner) closes for the session only (`dismissed` state, no choice saved) so the banner reappears next visit. The ✕ was added because the fixed-bottom banner overlapped the Cookie Policy page content with no obvious way out.

**Buttons** (`cookie-consent.tsx:261-285`): "Accept all" → `{analytics:true,marketing:true}`; "Reject all" → both false; "Save preferences" → current toggle state.

## Multi-tenant notes
Platform-level, **not** tenant-scoped. The banner is mounted globally in `providers.tsx` and the policy page lives under `(public)/` with no `studioId` involvement. The policy text names the platform operator ("Olena Christensen, Individual Entrepreneur (FOP)") and `https://tattooista.app`.

## Decisions & trade-offs
- Cookie + localStorage dual-write so both server (`next/headers`) and client can read consent. Cookie wins on conflict.
- `useSyncExternalStore` with a `true` server snapshot avoids hydration flash and SSR cookie-read issues.
- Versioned consent (`v:1`) so policy changes can force re-consent later.
- Re-open via a module-level store rather than prop drilling, so any component (footer link) can trigger it.

## Verification
Not yet verified in this session. The policy page is a static Server Component (low risk). The consent logic has uncommitted edits that have not been manually exercised here (re-open flow, policy link, footer button). **Needs:** manual check that first visit shows the banner, choices persist across reload, footer "Cookie Preferences" re-opens with prior choice seeded, and the `/cookie-policy` route renders.

## TODO / follow-ups
- Decide whether to commit the untracked `cookie-policy/page.tsx` + uncommitted edits (user is reviewing before committing).
- Actually gate analytics/marketing scripts on the stored consent (currently recorded but unused).
- Replace placeholder Privacy/Terms footer `href="#"` links.
- ~~Confirm the policy's "Adobe Analytics / s7 cookie" details reflect what's really used~~ — **done 2026-06-12.** The Termly-template boilerplate in `cookie-policy/page.tsx` was reconciled to the other legal docs: Adobe Analytics → **Google Analytics** (`_ga`, `http_cookie`, 2 years — matches privacy policy + DPA Annex 2), contact email `founder@` → `privacy@nothingweird.agency` (matches the other legal pages), address Mykolaiv 54028 → **Kyiv 02125** (matches DPA/privacy/terms; phone line dropped), "Last updated" → June 07, 2026. NOTE: the app currently runs **no analytics at all**, so the `_ga` row is aspirational (kept to match the DPA/privacy commitment). **Do not reinject the Termly export** — it still has the old Adobe/`founder@`/address values and would regress these fixes; treat this React page as the curated source of truth.
