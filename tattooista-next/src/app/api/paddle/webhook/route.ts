import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"

// Paddle signs every webhook. We verify the signature against the raw body
// before trusting anything in it. Docs: developer.paddle.com → Webhooks → Verify.
const SIGNATURE_MAX_AGE_SECONDS = 300

function verifyPaddleSignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.PADDLE_WEBHOOK_SECRET
  if (!secret || !signatureHeader) return false

  const parts = Object.fromEntries(
    signatureHeader.split(";").map((p) => p.split("=") as [string, string])
  )
  const ts = parts["ts"]
  const h1 = parts["h1"]
  if (!ts || !h1) return false

  const age = Math.abs(Date.now() / 1000 - Number(ts))
  if (!Number.isFinite(age) || age > SIGNATURE_MAX_AGE_SECONDS) return false

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${ts}:${rawBody}`)
    .digest("hex")

  const a = Buffer.from(expected, "hex")
  const b = Buffer.from(h1, "hex")
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

interface PaddleSubscriptionEvent {
  event_type: string
  occurred_at: string
  data: {
    id: string
    status: string
    customer_id: string
    custom_data?: { studioId?: string } | null
  }
}

async function findStudio(event: PaddleSubscriptionEvent) {
  const studioId = event.data.custom_data?.studioId
  if (studioId) {
    const byId = await prisma.studio.findUnique({ where: { id: studioId } })
    if (byId) return byId
  }
  const bySubscription = await prisma.studio.findFirst({
    where: { paddleSubscriptionId: event.data.id },
  })
  if (bySubscription) return bySubscription
  return prisma.studio.findFirst({
    where: { paddleCustomerId: event.data.customer_id },
  })
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get("paddle-signature")

  if (!verifyPaddleSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  let event: PaddleSubscriptionEvent
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (!event.event_type?.startsWith("subscription.")) {
    // Not a subscription event — acknowledge and ignore.
    return NextResponse.json({ received: true })
  }

  const studio = await findStudio(event)
  if (!studio) {
    console.error(`Paddle webhook: no studio found for ${event.event_type} ${event.data.id}`)
    // Acknowledge so Paddle stops retrying; the event is logged for investigation.
    return NextResponse.json({ received: true })
  }

  const { event_type } = event
  const { id: subscriptionId, status, customer_id } = event.data

  switch (event_type) {
    case "subscription.created":
    case "subscription.activated":
    case "subscription.updated": {
      // Grant PRO only on an active or trialing status confirmed by this signed event.
      // Writing the same values twice is harmless, so duplicate deliveries change nothing.
      if (status === "active" || status === "trialing") {
        await prisma.studio.update({
          where: { id: studio.id },
          data: {
            plan: "PRO",
            paddleCustomerId: customer_id,
            paddleSubscriptionId: subscriptionId,
          },
        })
      } else if (status === "canceled" && studio.paddleSubscriptionId === subscriptionId) {
        await prisma.studio.update({
          where: { id: studio.id },
          data: { plan: "FREE", paddleSubscriptionId: null },
        })
      }
      // Statuses like past_due keep PRO while Paddle retries payment (dunning).
      break
    }

    case "subscription.canceled": {
      // Downgrade only if this event is about the subscription we actually have —
      // a stale event about an old, replaced subscription must not touch the plan.
      if (studio.paddleSubscriptionId === subscriptionId || !studio.paddleSubscriptionId) {
        await prisma.studio.update({
          where: { id: studio.id },
          data: { plan: "FREE", paddleSubscriptionId: null },
        })
      }
      break
    }

    case "subscription.past_due": {
      // Keep PRO during dunning; Paddle retries the payment itself.
      console.warn(`Paddle: subscription ${subscriptionId} past due (studio ${studio.id})`)
      break
    }

    default:
      break
  }

  return NextResponse.json({ received: true })
}
