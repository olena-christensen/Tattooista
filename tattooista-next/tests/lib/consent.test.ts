import { describe, it, expect } from "vitest"
import {
  CONSENT_VERSION,
  DENY_ALL,
  resolveEffectiveConsent,
  type Consent,
} from "@/lib/consent"

const ACCEPT_ALL: Consent = {
  v: CONSENT_VERSION,
  necessary: true,
  analytics: true,
  marketing: true,
}

describe("resolveEffectiveConsent", () => {
  it("returns deny when no choice has been made and GPC is off", () => {
    expect(resolveEffectiveConsent(null, false)).toEqual(DENY_ALL)
  })

  it("returns the stored choice when GPC is off", () => {
    expect(resolveEffectiveConsent(ACCEPT_ALL, false)).toEqual(ACCEPT_ALL)
  })

  it("forces deny when GPC is active and no choice exists", () => {
    expect(resolveEffectiveConsent(null, true)).toEqual(DENY_ALL)
  })

  it("overrides an opt-in stored choice when GPC is active (hard override)", () => {
    const result = resolveEffectiveConsent(ACCEPT_ALL, true)
    expect(result).toEqual(DENY_ALL)
    expect(result.analytics).toBe(false)
    expect(result.marketing).toBe(false)
  })

  it("does not mutate the stored choice when GPC overrides", () => {
    const stored: Consent = { ...ACCEPT_ALL }
    resolveEffectiveConsent(stored, true)
    expect(stored).toEqual(ACCEPT_ALL)
  })

  it("always keeps necessary on", () => {
    expect(resolveEffectiveConsent(null, false).necessary).toBe(true)
    expect(resolveEffectiveConsent(null, true).necessary).toBe(true)
    expect(resolveEffectiveConsent(ACCEPT_ALL, true).necessary).toBe(true)
  })
})
