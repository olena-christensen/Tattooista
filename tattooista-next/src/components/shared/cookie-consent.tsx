"use client"

import { useCallback, useEffect, useState, useSyncExternalStore } from "react"

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
  // Escape closes for this session only (no choice saved), so the banner
  // reappears on the next visit.
  const [dismissed, setDismissed] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)

  const save = useCallback((choice: { analytics: boolean; marketing: boolean }) => {
    persistConsent({ v: CONSENT_VERSION, necessary: true, ...choice })
    notifyConsentChange()
  }, [])

  const open = !decided && !dismissed

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDismissed(true)
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
        <div className="flex flex-col gap-6 p-6 md:p-8 lg:flex-row lg:items-center lg:justify-between">
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
              and personalise marketing. Choose what you allow.
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
