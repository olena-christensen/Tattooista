import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import {
  decideSubscriptionWrite,
  type PaddleSubscriptionEvent,
} from "@/lib/paddle-subscription"

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

  const decision = decideSubscriptionWrite(studio, event)

  if (!decision.apply) {
    // Acknowledged, deliberately not applied. Paddle must not retry a stale event.
    console.warn(
      `Paddle webhook: ignoring ${event.event_type} for studio ${studio.id} — ${decision.reason}`
    )
    return NextResponse.json({ received: true })
  }

  if (event.event_type === "subscription.past_due") {
    console.warn(`Paddle: subscription ${event.data.id} past due (studio ${studio.id})`)
  }

  await prisma.studio.update({
    where: { id: studio.id },
    data: decision.data,
  })

  return NextResponse.json({ received: true })
}
