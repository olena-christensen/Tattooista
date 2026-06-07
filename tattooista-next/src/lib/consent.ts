// Cookie-consent core: the single source of truth for what the user has allowed.
//
// This module holds the pure data model and resolution logic so it can be unit
// tested without rendering a client component. The React bits (banner UI, the
// useSyncExternalStore wiring, the GPC context) live in
// components/shared/cookie-consent.tsx and import from here — so CONSENT_KEY /
// CONSENT_VERSION / the Consent type are defined ONCE and reused, never copied.

export const CONSENT_KEY = "cookie_consent"
export const CONSENT_VERSION = 1
export const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365

export type Consent = {
  v: number
  necessary: true
  analytics: boolean
  marketing: boolean
}

// The "deny" baseline: necessary only. Used both for non-decided users and as
// the value GPC resolves to. Not a stored decision on its own — see
// resolveEffectiveConsent.
export const DENY_ALL: Consent = {
  v: CONSENT_VERSION,
  necessary: true,
  analytics: false,
  marketing: false,
}

export function readConsent(): Consent | null {
  if (typeof document === "undefined") return null
  const raw = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${CONSENT_KEY}=`))
    ?.split("=")[1]
  if (!raw) return null
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Consent
    return parsed?.v === CONSENT_VERSION ? parsed : null
  } catch {
    return null
  }
}

export function persistConsent(consent: Consent) {
  const value = encodeURIComponent(JSON.stringify(consent))
  // Cookie so the server can read the choice via next/headers cookies().
  document.cookie = `${CONSENT_KEY}=${value}; max-age=${ONE_YEAR_SECONDS}; path=/; SameSite=Lax`
  // localStorage mirror for client-side reads.
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent))
  } catch {
    // localStorage may be unavailable (private mode / blocked) — the cookie is the source of truth.
  }
}

// Reads Global Privacy Control on the client. Server detection happens via the
// Sec-GPC request header (read in the root layout) and arrives through context;
// this only covers the navigator side. Constant for the lifetime of a page load.
export function isGpcActiveClient(): boolean {
  if (typeof navigator === "undefined") return false
  return (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true
}

// The single source of truth for effective consent. Anything that gates a
// tracker (analytics, ads — none exist yet) must resolve through this so GPC is
// always accounted for.
//
// DECISION (CCPA, chosen by product owner 2026-06-01): GPC is treated as a HARD
// override, not just a default. While GPC is active, analytics + marketing are
// forced off REGARDLESS of any stored cookie, and the banner cannot re-enable
// them. This is stricter than CCPA §7025 strictly requires (which permits
// offering the user a way to consent over the signal) and is always compliant
// under GDPR. Because GPC is checked first, the stored cookie is never read or
// mutated while GPC is on — so an explicit pre-GPC choice stays intact and
// reappears if the user later turns GPC off. We never auto-write a cookie from
// GPC, keeping GPC-derived state distinguishable from an explicit choice.
export function resolveEffectiveConsent(
  stored: Consent | null,
  gpcActive: boolean
): Consent {
  if (gpcActive) return DENY_ALL
  return stored ?? DENY_ALL
}
