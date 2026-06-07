"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  CONSENT_VERSION,
  DENY_ALL,
  isGpcActiveClient,
  persistConsent,
  readConsent,
  resolveEffectiveConsent,
  type Consent,
} from "@/lib/consent"

// External store: tracks whether a consent decision already exists. The only
// thing that mutates it is this component's own save(), so subscribers are
// notified manually after persisting.
let listeners: Array<() => void> = []

function subscribe(onChange: () => void) {
  listeners.push(onChange)
  return () => {
    listeners = listeners.filter((l) => l !== onChange)
  }
}

// Cached snapshot of the stored consent. readConsent() returns a fresh object
// each call, which would make useSyncExternalStore loop forever (it compares
// snapshots with Object.is). Cache the parsed value and invalidate only when a
// choice is saved, so consumers get a stable reference between changes.
let consentCache: Consent | null = null
let consentCacheValid = false

function getConsentSnapshot(): Consent | null {
  if (!consentCacheValid) {
    consentCache = readConsent()
    consentCacheValid = true
  }
  return consentCache
}

function notifyConsentChange() {
  consentCacheValid = false
  for (const l of listeners) l()
}

// Separate external store: lets anything on the page (e.g. a footer link)
// re-open the banner after a choice has already been made, so users can change
// their mind. `openCookiePreferences()` is the public entry point.
let forceOpen = false
let openListeners: Array<() => void> = []

function subscribeForceOpen(onChange: () => void) {
  openListeners.push(onChange)
  return () => {
    openListeners = openListeners.filter((l) => l !== onChange)
  }
}

function notifyForceOpen() {
  for (const l of openListeners) l()
}

const getForceOpen = () => forceOpen
const getForceOpenServer = () => false

export function openCookiePreferences() {
  forceOpen = true
  notifyForceOpen()
}

function resetForceOpen() {
  if (!forceOpen) return
  forceOpen = false
  notifyForceOpen()
}

// True once a choice has been made. Server snapshot returns true so the banner
// renders nothing during SSR/initial hydration (document.cookie is unreadable
// there); React then re-reads on the client to reveal it on a first visit.
const consentDecided = () => getConsentSnapshot() !== null
const consentDecidedServer = () => true

// Server snapshot of the stored consent (cookie unreadable during SSR).
const consentSnapshotServer = (): Consent | null => null

// ---- Global Privacy Control ----
//
// GPC arrives two ways: the Sec-GPC request header (read server-side in the
// root layout and threaded in via GpcContext) and navigator.globalPrivacyControl
// on the client. Both feed one boolean. The server/hydration snapshot uses the
// header value (from context) so there is no flash; the client snapshot reads
// navigator. GPC is constant for a page load, so the store never notifies.
const GpcContext = createContext(false)

export function GpcProvider({
  value,
  children,
}: {
  value: boolean
  children: React.ReactNode
}) {
  return <GpcContext.Provider value={value}>{children}</GpcContext.Provider>
}

const subscribeGpcNoop = () => () => {}

function useGpcActive(): boolean {
  const gpcServer = useContext(GpcContext)
  return useSyncExternalStore(
    subscribeGpcNoop,
    isGpcActiveClient,
    () => gpcServer
  )
}

// THE single source of truth for effective consent. Future tracker gating (GA,
// ad scripts — none exist yet) must read this hook so GPC is always accounted
// for. Server/hydration snapshot resolves to DENY_ALL (trackers off until the
// client confirms a stored choice — the safe direction).
export function useEffectiveConsent(): Consent {
  const gpcActive = useGpcActive()
  const stored = useSyncExternalStore(
    subscribe,
    getConsentSnapshot,
    consentSnapshotServer
  )
  return resolveEffectiveConsent(stored, gpcActive)
}

function Toggle({
  checked,
  onChange,
  disabled = false,
  label,
}: {
  checked: boolean
  onChange?: (next: boolean) => void
  disabled?: boolean
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      data-on={checked}
      onClick={() => onChange?.(!checked)}
      className="relative h-5 w-9 shrink-0 border-2 border-foreground/60 bg-transparent transition-colors data-[on=true]:bg-foreground disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <span
        data-on={checked}
        className="absolute top-0 left-0 aspect-square h-full bg-foreground transition-transform data-[on=true]:translate-x-full data-[on=true]:bg-background"
      />
    </button>
  )
}

export function CookieConsent() {
  const decided = useSyncExternalStore(
    subscribe,
    consentDecided,
    consentDecidedServer
  )
  // GPC hard-override: while active, analytics/marketing are forced off and the
  // toggles are locked. See resolveEffectiveConsent for the decision rationale.
  const gpcActive = useGpcActive()
  // True while the user has explicitly re-opened the banner via
  // openCookiePreferences() — overrides `decided` so they can change their mind.
  const requested = useSyncExternalStore(
    subscribeForceOpen,
    getForceOpen,
    getForceOpenServer
  )
  // Escape closes for this session only (no choice saved), so the banner
  // reappears on the next visit.
  const [dismissed, setDismissed] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)

  const save = useCallback(
    (choice: { analytics: boolean; marketing: boolean }) => {
      // Under GPC the user cannot opt in, so every save clamps to deny. This is
      // an explicit user action (a click), not an auto-write from GPC.
      const next = gpcActive ? DENY_ALL : { v: CONSENT_VERSION, necessary: true as const, ...choice }
      persistConsent(next)
      notifyConsentChange()
      resetForceOpen()
    },
    [gpcActive]
  )

  const open = requested || (!decided && !dismissed)

  // When re-opened, seed the toggles from the saved choice so the banner
  // reflects the user's current preferences instead of resetting them. This is
  // the "adjust state during render" pattern (react.dev/learn/you-might-not-need-an-effect)
  // — seed once per re-open, not in an effect.
  const [seeded, setSeeded] = useState(false)
  if (requested && !seeded) {
    const current = readConsent()
    setAnalytics(current?.analytics ?? false)
    setMarketing(current?.marketing ?? false)
    setSeeded(true)
  } else if (!requested && seeded) {
    setSeeded(false)
  }

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDismissed(true)
        resetForceOpen()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open])

  if (!open) return null

  // While GPC is active the analytics/marketing toggles always read off and are
  // disabled, regardless of local state.
  const analyticsChecked = gpcActive ? false : analytics
  const marketingChecked = gpcActive ? false : marketing

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
      className="fixed inset-x-0 bottom-0 z-50 p-4 md:p-6"
    >
      <div className="relative mx-auto max-w-[1100px] overflow-hidden border-2 border-[rgba(250,250,250,0.6)] bg-[rgba(8,8,8,0.5)] shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-[9px]">
        <button
          type="button"
          aria-label="Close cookie banner"
          onClick={() => {
            setDismissed(true)
            resetForceOpen()
          }}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center text-foreground/60 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="square"
            aria-hidden="true"
          >
            <line x1="2" y1="2" x2="16" y2="16" />
            <line x1="16" y1="2" x2="2" y2="16" />
          </svg>
        </button>
        <div className="flex flex-col gap-6 p-6 pt-12 md:p-8 md:pt-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="lg:max-w-2xl">
            <h2
              id="cookie-consent-title"
              className="text-sm font-bold uppercase tracking-wider text-foreground"
            >
              Cookies
            </h2>
            <p
              id="cookie-consent-desc"
              className="mt-2 text-sm leading-relaxed text-foreground/70"
            >
              We use cookies to run this site and, with your consent, to measure traffic
              and personalise marketing. Choose what you allow. See our{" "}
              <Link
                href="/cookie-policy"
                className="underline underline-offset-4 hover:text-foreground"
              >
                Cookie Policy
              </Link>
              .
            </p>

            {gpcActive && (
              <p className="mt-3 text-xs leading-relaxed text-foreground/60">
                Global Privacy Control detected in your browser — analytics and
                marketing are turned off automatically and can&apos;t be enabled here.
              </p>
            )}

            <ul className="mt-5 flex flex-col gap-3">
              <li className="flex items-center justify-between gap-4 border-b border-foreground/10 pb-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Necessary
                  </p>
                  <p className="mt-0.5 text-xs text-foreground/50">
                    Required for the site to work. Always on.
                  </p>
                </div>
                <Toggle checked disabled label="Necessary cookies (always on)" />
              </li>
              <li className="flex items-center justify-between gap-4 border-b border-foreground/10 pb-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Analytics
                  </p>
                  <p className="mt-0.5 text-xs text-foreground/50">
                    Helps us understand how the site is used.
                  </p>
                </div>
                <Toggle
                  checked={analyticsChecked}
                  onChange={setAnalytics}
                  disabled={gpcActive}
                  label="Analytics cookies"
                />
              </li>
              <li className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Marketing
                  </p>
                  <p className="mt-0.5 text-xs text-foreground/50">
                    Used to personalise marketing and measure campaigns.
                  </p>
                </div>
                <Toggle
                  checked={marketingChecked}
                  onChange={setMarketing}
                  disabled={gpcActive}
                  label="Marketing cookies"
                />
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:w-56 lg:flex-col">
            {gpcActive ? (
              // GPC forces analytics + marketing off, so "Accept all" is
              // meaningless. A single explicit acknowledgment persists deny and
              // stops the banner from reappearing.
              <Button
                type="button"
                onClick={() => save({ analytics: false, marketing: false })}
                className="h-11 border-2 border-foreground bg-foreground px-6 text-xs font-bold uppercase tracking-wider text-background hover:bg-transparent hover:text-foreground"
              >
                Got it
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  onClick={() => save({ analytics: true, marketing: true })}
                  className="h-11 border-2 border-foreground bg-foreground px-6 text-xs font-bold uppercase tracking-wider text-background hover:bg-transparent hover:text-foreground"
                >
                  Accept all
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => save({ analytics: false, marketing: false })}
                  className="h-11 border-2 border-foreground bg-transparent px-6 text-xs font-bold uppercase tracking-wider text-foreground hover:bg-foreground hover:text-background"
                >
                  Reject all
                </Button>
                <Button
                  type="button"
                  variant="link"
                  onClick={() => save({ analytics, marketing })}
                  className="h-auto px-0 text-xs font-semibold uppercase tracking-wider text-foreground/70 hover:text-foreground"
                >
                  Save preferences
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
