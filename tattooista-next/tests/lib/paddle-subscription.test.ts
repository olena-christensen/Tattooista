import { describe, it, expect } from "vitest"
import {
  decideSubscriptionWrite,
  type PaddleSubscriptionEvent,
  type StudioBillingState,
} from "@/lib/paddle-subscription"

// Paddle retries webhooks, so a retry of an earlier event can arrive after a later
// one. Before the guard, a stale "active" landing after a cancellation re-granted
// PRO and silently undid the cancellation.

const CUSTOMER = "ctm_1"
const SUB = "sub_1"

const EARLIER = "2026-08-16T10:00:00.000Z"
const LATER = "2026-08-16T10:05:00.000Z"

function event(
  event_type: string,
  status: string,
  occurred_at: string,
  id = SUB
): PaddleSubscriptionEvent {
  return {
    event_type,
    occurred_at,
    data: { id, status, customer_id: CUSTOMER },
  }
}

function studio(over: Partial<StudioBillingState> = {}): StudioBillingState {
  return { paddleSubscriptionId: SUB, paddleEventAt: null, ...over }
}

describe("ordering guard", () => {
  it("ignores an event that happened before the last one applied", () => {
    const decision = decideSubscriptionWrite(
      studio({ paddleEventAt: new Date(LATER) }),
      event("subscription.updated", "active", EARLIER)
    )

    expect(decision.apply).toBe(false)
  })

  it("does not re-grant PRO when a stale 'active' arrives after a cancellation", () => {
    // The cancellation already ran: plan is FREE and the subscription id was cleared.
    const cancelled = studio({
      paddleSubscriptionId: null,
      paddleEventAt: new Date(LATER),
    })

    const decision = decideSubscriptionWrite(
      cancelled,
      event("subscription.updated", "active", EARLIER)
    )

    expect(decision.apply).toBe(false)
    if (decision.apply) throw new Error("unreachable")
    expect(decision.reason).toContain("older than the last applied event")
  })

  it("applies an event that happened after the last one", () => {
    const decision = decideSubscriptionWrite(
      studio({ paddleEventAt: new Date(EARLIER) }),
      event("subscription.canceled", "canceled", LATER)
    )

    expect(decision.apply).toBe(true)
    if (!decision.apply) throw new Error("unreachable")
    expect(decision.data.plan).toBe("FREE")
  })

  it("applies a duplicate delivery of the same event", () => {
    // Identical timestamp, identical values — re-writing them changes nothing,
    // so it is allowed through rather than treated as out of order.
    const decision = decideSubscriptionWrite(
      studio({ paddleEventAt: new Date(LATER) }),
      event("subscription.updated", "active", LATER)
    )

    expect(decision.apply).toBe(true)
  })

  it("applies the first event, when nothing has been applied before", () => {
    const decision = decideSubscriptionWrite(
      studio({ paddleEventAt: null }),
      event("subscription.created", "active", EARLIER)
    )

    expect(decision.apply).toBe(true)
  })

  it("refuses an event whose timestamp cannot be read", () => {
    const decision = decideSubscriptionWrite(
      studio(),
      event("subscription.updated", "active", "not-a-date")
    )

    expect(decision.apply).toBe(false)
    if (decision.apply) throw new Error("unreachable")
    expect(decision.reason).toContain("unparsable")
  })
})

describe("what gets written", () => {
  it("grants PRO and records the subscription on an active event", () => {
    const decision = decideSubscriptionWrite(
      studio({ paddleSubscriptionId: null }),
      event("subscription.activated", "active", LATER)
    )

    if (!decision.apply) throw new Error("expected the event to apply")
    expect(decision.data).toMatchObject({
      plan: "PRO",
      paddleCustomerId: CUSTOMER,
      paddleSubscriptionId: SUB,
      paddleStatus: "active",
    })
    expect(decision.data.paddleEventAt.toISOString()).toBe(LATER)
  })

  it("grants PRO while trialing", () => {
    const decision = decideSubscriptionWrite(studio(), event("subscription.created", "trialing", LATER))

    if (!decision.apply) throw new Error("expected the event to apply")
    expect(decision.data.plan).toBe("PRO")
  })

  it("keeps PRO while past due, recording the status", () => {
    const decision = decideSubscriptionWrite(
      studio({ paddleEventAt: new Date(EARLIER) }),
      event("subscription.past_due", "past_due", LATER)
    )

    if (!decision.apply) throw new Error("expected the event to apply")
    expect(decision.data.plan).toBeUndefined()
    expect(decision.data.paddleStatus).toBe("past_due")
  })

  it("records the status and moves the clock even when the plan does not change", () => {
    const decision = decideSubscriptionWrite(
      studio(),
      event("subscription.updated", "paused", LATER)
    )

    if (!decision.apply) throw new Error("expected the event to apply")
    expect(decision.data.plan).toBeUndefined()
    expect(decision.data.paddleStatus).toBe("paused")
    expect(decision.data.paddleEventAt.toISOString()).toBe(LATER)
  })

  it("leaves the plan alone when a cancellation names a subscription we do not hold", () => {
    const decision = decideSubscriptionWrite(
      studio({ paddleSubscriptionId: "sub_current" }),
      event("subscription.canceled", "canceled", LATER, "sub_old")
    )

    if (!decision.apply) throw new Error("expected the event to apply")
    expect(decision.data.plan).toBeUndefined()
    expect(decision.data.paddleSubscriptionId).toBeUndefined()
  })

  it("downgrades on a cancellation for the subscription we hold", () => {
    const decision = decideSubscriptionWrite(
      studio({ paddleSubscriptionId: SUB }),
      event("subscription.canceled", "canceled", LATER)
    )

    if (!decision.apply) throw new Error("expected the event to apply")
    expect(decision.data.plan).toBe("FREE")
    expect(decision.data.paddleSubscriptionId).toBeNull()
  })

  it("downgrades on an updated-to-canceled event for the subscription we hold", () => {
    const decision = decideSubscriptionWrite(
      studio({ paddleSubscriptionId: SUB }),
      event("subscription.updated", "canceled", LATER)
    )

    if (!decision.apply) throw new Error("expected the event to apply")
    expect(decision.data.plan).toBe("FREE")
    expect(decision.data.paddleSubscriptionId).toBeNull()
  })
})
