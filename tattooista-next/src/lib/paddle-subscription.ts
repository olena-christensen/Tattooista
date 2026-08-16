import type { Plan } from "@prisma/client"

/**
 * Decides what a Paddle subscription webhook should write to a Studio.
 *
 * Split out of the route handler for one reason: webhooks arrive out of order.
 * Paddle retries, and a retry of an *earlier* event can land after a later one —
 * so a stale "active" can undo a cancellation that already happened. The rule is
 * that an event older than the last one we acted on is never applied.
 *
 * Kept free of Prisma, `next/server` and HTTP so the ordering rules can be tested
 * directly; the route does the signature check, the lookup and the write.
 */

export interface PaddleSubscriptionEventData {
  id: string
  status: string
  customer_id: string
  custom_data?: { studioId?: string } | null
}

export interface PaddleSubscriptionEvent {
  event_type: string
  occurred_at: string
  data: PaddleSubscriptionEventData
}

/** The only Studio fields the decision depends on. */
export interface StudioBillingState {
  paddleSubscriptionId: string | null
  paddleEventAt: Date | null
}

export interface StudioBillingWrite {
  paddleStatus: string
  paddleEventAt: Date
  plan?: Plan
  paddleCustomerId?: string
  paddleSubscriptionId?: string | null
}

export type SubscriptionDecision =
  | { apply: false; reason: string }
  | { apply: true; data: StudioBillingWrite }

/**
 * `true` when the event happened strictly before the last event we applied.
 * Equal timestamps are allowed through: that is a duplicate delivery of the same
 * event, and re-writing identical values changes nothing.
 */
function isStale(occurredAt: Date, lastAppliedAt: Date | null): boolean {
  return lastAppliedAt !== null && occurredAt.getTime() < lastAppliedAt.getTime()
}

export function decideSubscriptionWrite(
  studio: StudioBillingState,
  event: PaddleSubscriptionEvent
): SubscriptionDecision {
  const occurredAt = new Date(event.occurred_at)
  if (Number.isNaN(occurredAt.getTime())) {
    // An event we cannot place in time cannot be ordered against the others.
    // Applying it risks undoing a later one, so it is refused and logged.
    return { apply: false, reason: `unparsable occurred_at: ${event.occurred_at}` }
  }

  if (isStale(occurredAt, studio.paddleEventAt)) {
    return {
      apply: false,
      reason: `event from ${occurredAt.toISOString()} is older than the last applied event at ${studio.paddleEventAt!.toISOString()}`,
    }
  }

  const { id: subscriptionId, status, customer_id: customerId } = event.data

  // Recorded for every event we act on, whether or not the plan moves — the
  // status is what makes a misbehaving subscription readable without guessing
  // from `plan`, and the timestamp is what orders the next event.
  const data: StudioBillingWrite = { paddleStatus: status, paddleEventAt: occurredAt }

  switch (event.event_type) {
    case "subscription.created":
    case "subscription.activated":
    case "subscription.updated": {
      if (status === "active" || status === "trialing") {
        // Grant PRO only on a status confirmed by this signed event.
        data.plan = "PRO"
        data.paddleCustomerId = customerId
        data.paddleSubscriptionId = subscriptionId
      } else if (status === "canceled" && studio.paddleSubscriptionId === subscriptionId) {
        data.plan = "FREE"
        data.paddleSubscriptionId = null
      }
      // Statuses like past_due keep PRO while Paddle retries payment (dunning).
      break
    }

    case "subscription.canceled": {
      // Downgrade only if this event is about the subscription we actually have —
      // a stale event about an old, replaced subscription must not touch the plan.
      if (studio.paddleSubscriptionId === subscriptionId || !studio.paddleSubscriptionId) {
        data.plan = "FREE"
        data.paddleSubscriptionId = null
      }
      break
    }

    case "subscription.past_due":
      // Keep PRO during dunning; Paddle retries the payment itself.
      break

    default:
      break
  }

  return { apply: true, data }
}
