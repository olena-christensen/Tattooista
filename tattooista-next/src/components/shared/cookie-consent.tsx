"use client"

import { useCallback, useEffect, useState, useSyncExternalStore } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"

const CONSENT_KEY = "cookie_consent"
const CONSENT_VERSION = 1
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365

type Consent = {
  v: number
  necessary: true
  analytics: boolean
  marketing: boolean
}

function readConsent(): Consent | null {
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

function persistConsent(consent: Consent) {
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

function notifyConsentChange() {
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
const consentDecided = () => readConsent() !== null
const consentDecidedServer = () => true

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

  const save = useCallback((choice: { analytics: boolean; marketing: boolean }) => {
    persistConsent({ v: CONSENT_VERSION, necessary: true, ...choice })
    notifyConsentChange()
    resetForceOpen()
  }, [])

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
                  checked={analytics}
                  onChange={setAnalytics}
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
                  checked={marketing}
                  onChange={setMarketing}
                  label="Marketing cookies"
                />
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:w-56 lg:flex-col">
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
          </div>
        </div>
      </div>
    </div>
  )
}
