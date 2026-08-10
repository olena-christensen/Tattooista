"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { cancelPaddleSubscription } from "@/lib/paddle"

async function getOwnedStudio() {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Not authenticated" as const }
  }

  const studioSlug = session.user.studioSlug
  if (!studioSlug) {
    return { error: "No studio found" as const }
  }

  const studio = await prisma.studio.findUnique({
    where: { slug: studioSlug },
  })

  if (!studio) {
    return { error: "Studio not found" as const }
  }

  const membership = await prisma.studioMembership.findUnique({
    where: {
      userId_studioId: {
        userId: session.user.id,
        studioId: studio.id,
      },
    },
  })

  if (!membership || membership.role !== "OWNER") {
    return { error: "Only the studio owner can manage billing" as const }
  }

  return { studio }
}

/**
 * Cancel the studio's PRO subscription at the end of the paid period.
 * The plan itself is downgraded only when Paddle's signed webhook confirms
 * the cancellation — never here.
 */
export async function cancelProSubscription() {
  const result = await getOwnedStudio()
  if ("error" in result) {
    return { error: result.error }
  }

  const { studio } = result

  if (!studio.paddleSubscriptionId) {
    return { error: "No active subscription found for this studio" }
  }

  try {
    await cancelPaddleSubscription(studio.paddleSubscriptionId)
  } catch (e) {
    console.error("Paddle cancellation failed:", e)
    return { error: "Cancellation failed. Please try again or contact support." }
  }

  return {
    success: true,
    message:
      "Subscription canceled. PRO stays active until the end of the paid period.",
  }
}
