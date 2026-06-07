# Global Privacy Control (GPC) honoring

## Status
IN PROGRESS — committed locally? No, uncommitted working-tree changes on branch `demo-unifying` as of 2026-06-01.

## Issue
No GitHub board issue assigned. Slug is the plain `gpc-honoring`; rename doc to `<issue#>-gpc-honoring` and link the card here if one is created.

## Goal
Honor the Global Privacy Control browser signal: when a visitor's browser sends GPC, analytics and marketing are turned off automatically, regardless of any stored cookie choice. Plumbing only — no analytics/ad scripts exist yet; this establishes the single source of truth they will later read.

## Scope
**In:**
- Detect GPC two ways: the `Sec-GPC: 1` request header (server) and `navigator.globalPrivacyControl === true` (client).
- A single source of truth, `useEffectiveConsent()`, that resolves effective consent and always accounts for GPC.
- Banner reflects GPC: analytics/marketing toggles locked off, a "GPC detected" notice, and an explicit "Got it" acknowledgment.
- Vitest coverage of the resolution logic.

**Out / deferred:**
- Loading any actual tracker (GA, ad scripts). None exist; gating them is a future feature that consumes `useEffectiveConsent()`.
- Per-studio consent configuration (platform-level, not tenant-scoped).

## MERN source of truth
Net-new. No original in `Client/` — the cookie-consent banner itself is a Next-only component; GPC has no MERN precedent.

## Files
- `src/lib/consent.ts` — **NEW.** Consent core extracted from the component: `CONSENT_KEY`, `CONSENT_VERSION`, `Consent` type, `DENY_ALL`, `readConsent`/`persistConsent` (relocated, unchanged), `isGpcActiveClient()`, and the pure `resolveEffectiveConsent(stored, gpcActive)`. Uncommitted.
- `src/components/shared/cookie-consent.tsx` — **EDIT.** Imports core from `lib/consent` (no redefinition). Adds `GpcContext` + `GpcProvider`, `useGpcActive()`, and exported `useEffectiveConsent()`. Banner is GPC-aware: locked-off toggles, notice, clamped saves, single "Got it" button. Uncommitted.
- `src/components/shared/providers.tsx` — **EDIT.** Accepts `gpcServer?: boolean`, wraps the tree in `<GpcProvider value={gpcServer}>`. Uncommitted.
- `src/app/layout.tsx` — **EDIT.** Now `async`; reads `Sec-GPC` via `headers()` and passes `gpcServer` into `Providers`. Uncommitted.
- `tests/lib/consent.test.ts` — **NEW.** 6 tests covering the `resolveEffectiveConsent` truth table + non-mutation of stored choice. Uncommitted.

## How it works
1. **Server detect** — `layout.tsx:RootLayout` (now async) reads `(await headers()).get("sec-gpc") === "1"` and passes it as `gpcServer` to `Providers` (`layout.tsx`), which seeds `GpcContext` via `GpcProvider` (`providers.tsx`).
2. **Client detect** — `useGpcActive()` (`cookie-consent.tsx`) is `useSyncExternalStore(noopSubscribe, isGpcActiveClient, () => gpcServer)`. The server/hydration snapshot is the header value (from context, no flash); after hydration the client snapshot reads `navigator.globalPrivacyControl`. GPC is constant per page load, so the store never notifies.
3. **Single source of truth** — `useEffectiveConsent()` combines `useGpcActive()` with the stored cookie (read through the existing consent external store) and returns `resolveEffectiveConsent(stored, gpcActive)`. Server snapshot resolves to `DENY_ALL` (trackers off until the client confirms — the safe direction). Future tracker gating reads only this hook.
4. **Resolution** — `resolveEffectiveConsent` (`consent.ts`) checks GPC **first**: if active → `DENY_ALL`; otherwise `stored ?? DENY_ALL`. The stored cookie is never read or mutated while GPC is on.
5. **Banner** — when `gpcActive`, analytics/marketing toggles render `checked={false} disabled`, a notice line appears, every `save()` clamps to `DENY_ALL`, and the three-button cluster collapses to a single "Got it" that persists deny and dismisses. The existing SSR behavior (banner renders nothing on the server via `consentDecidedServer = () => true`) is preserved.

## Multi-tenant notes
N/A, platform-level. GPC is a per-visitor browser signal with no `studioId`. `proxy.ts` is intentionally untouched — tenant/auth resolution is unaffected.

## Decisions & trade-offs
- **Hard override (chosen by product owner, 2026-06-01).** While GPC is active, analytics/marketing are forced off and cannot be re-enabled in the banner. Stricter than CCPA §7025 strictly requires (which permits offering consent over the signal); always compliant under GDPR. Rationale documented inline in `consent.ts`. Alternative considered: "GPC sets the default, explicit choice wins" — rejected by owner.
- **No auto-write from GPC.** GPC never persists a cookie on its own; the stored cookie stays distinguishable from GPC-derived state and reappears if the user disables GPC. The "Got it" button does persist `DENY_ALL`, but that is an explicit user click, not an automatic write — chosen so the banner stops nagging GPC users (purist alternative: session-only dismiss with zero stored state, rejected for UX).
- **Server signal via `headers()` in the root layout (chosen by owner).** Flash-free, no cookie, leaves `proxy.ts` alone. Trade-off: reading `headers()` in the root layout opts the app into per-request dynamic rendering — but the app is already request-dynamic (per-request tenant + auth + Prisma via `proxy.ts`), so no material change. Alternative considered: detect in `proxy.ts` — rejected to avoid touching the tenant/auth interceptor.
- **Core extracted to `lib/consent.ts`.** Moves the pure logic out of a `"use client"` component so it's unit-testable and so the effective-consent resolution has one home. `CONSENT_KEY`/`CONSENT_VERSION`/`Consent` are re-imported, not duplicated.

## Verification
- `npx vitest run tests/lib/consent.test.ts` — 6/6 pass.
- `npx tsc --noEmit` — no errors in any touched file (only pre-existing errors in the unrelated `tests/lib/placeholder.test.ts`, which lacks vitest global imports).
- **Not yet manually verified in-browser:** GPC on/off behavior with a real `Sec-GPC` header and `navigator.globalPrivacyControl` (e.g. Firefox `privacy.globalprivacycontrol.enabled` or a DevTools override). No production deploy.

## TODO / follow-ups
- Manual browser verification with GPC enabled/disabled.
- When analytics/ads are introduced, gate them through `useEffectiveConsent()` (do not read the cookie directly).
- If a board issue is created, rename this doc to `<issue#>-gpc-honoring.md` and fill in the Issue link.
