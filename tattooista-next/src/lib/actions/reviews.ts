"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { requireSessionStudio, requireStudioRole } from "@/lib/tenant"
import { revalidatePath } from "next/cache"
import { reviewSchema, updateReviewSchema } from "@/lib/validations/review"

// Reviews belong to a studio's CUSTOMER (Client), never to a platform User.
// Customers and studio owners are separate objects that never mix.
const reviewAuthor = {
  select: {
    id: true,
    fullName: true,
    avatar: true,
  },
} as const

export async function getReviews(includeArchived = false) {
  const studio = await requireSessionStudio()

  const reviews = await prisma.review.findMany({
    where: { studioId: studio.id, ...(includeArchived ? {} : { isArchived: false }) },
    include: { client: reviewAuthor, gallery: true },
    orderBy: { createdAt: "desc" },
  })

  return reviews
}

export async function getReviewById(id: string) {
  const studio = await requireSessionStudio()

  const review = await prisma.review.findUnique({
    where: { id },
    include: { client: reviewAuthor, gallery: true },
  })

  if (!review || review.studioId !== studio.id) {
    throw new Error("Review not found")
  }

  return review
}

export async function getClientReviews(clientId: string) {
  const studio = await requireSessionStudio()

  const reviews = await prisma.review.findMany({
    where: {
      studioId: studio.id,
      clientId,
      isArchived: false,
    },
    include: { client: reviewAuthor, gallery: true },
    orderBy: { createdAt: "desc" },
  })

  return reviews
}

/**
 * Submit a review for a studio.
 *
 * Public — no session, because customers have no login. The reviewer identifies
 * themselves by an email that the studio must already hold on file for one of its
 * clients. If the studio has never recorded them as a customer, the review is
 * refused. That is what makes fabricated reviews impossible.
 *
 * The studio comes from the slug in the URL, not from a session.
 */
export async function createReview(studioSlug: string, formData: FormData) {
  const studio = await prisma.studio.findUnique({
    where: { slug: studioSlug },
    select: { id: true },
  })
  if (!studio) {
    return { error: "Studio not found" }
  }

  const galleryJson = formData.get("gallery")
  let gallery: string[] = []

  if (galleryJson && typeof galleryJson === "string") {
    try {
      gallery = JSON.parse(galleryJson)
    } catch {
      // Ignore invalid gallery data
    }
  }

  const rawData = {
    email: formData.get("email"),
    rate: parseInt(formData.get("rate") as string, 10),
    content: formData.get("content"),
    gallery,
  }

  const validationResult = reviewSchema.safeParse(rawData)
  if (!validationResult.success) {
    return { error: validationResult.error.issues[0].message }
  }

  const data = validationResult.data

  try {
    // Scoped to this studio: being a customer of one studio grants nothing at another.
    const contact = await prisma.contact.findFirst({
      where: {
        studioId: studio.id,
        type: "email",
        value: { equals: data.email, mode: "insensitive" },
      },
      select: { clientId: true },
    })

    if (!contact) {
      return {
        error:
          "We couldn't find that email in this studio's client list. Reviews can only be left by the studio's customers.",
      }
    }

    await prisma.review.create({
      data: {
        studioId: studio.id,
        clientId: contact.clientId,
        rate: data.rate,
        content: data.content,
        gallery:
          data.gallery && data.gallery.length > 0
            ? {
                create: data.gallery.map((fileName) => ({
                  studioId: studio.id,
                  fileName,
                })),
              }
            : undefined,
      },
    })
  } catch (err) {
    console.error("createReview failed:", err)
    return { error: "Something went wrong. Please try again." }
  }

  revalidatePath(`/${studioSlug}/reviews`)
  return { success: true, message: "Thank you! Your review has been posted." }
}

// ---------------------------------------------------------------------------
// Studio-side management. Reviewers are customers with no login, so they cannot
// edit their own reviews — every mutation below is the studio acting on its own
// reviews, and each one is scoped by studioId so a review id from another studio
// cannot be touched.
// ---------------------------------------------------------------------------

async function requireOwnedReview(id: string) {
  const session = await auth()
  if (!session?.user) {
    return { error: "Unauthorized" as const }
  }
  const studio = await requireSessionStudio()
  await requireStudioRole(session.user.id, studio.id)

  const review = await prisma.review.findUnique({ where: { id } })
  if (!review || review.studioId !== studio.id) {
    return { error: "Review not found" as const }
  }

  return { studio, review }
}

export async function updateReview(id: string, formData: FormData) {
  const ctx = await requireOwnedReview(id)
  if ("error" in ctx) return ctx

  const rawData = {
    rate: formData.has("rate") ? parseInt(formData.get("rate") as string, 10) : undefined,
    content: formData.get("content") || undefined,
  }

  const validationResult = updateReviewSchema.safeParse(rawData)
  if (!validationResult.success) {
    return { error: validationResult.error.issues[0].message }
  }

  const data = validationResult.data

  const updatedReview = await prisma.review.update({
    where: { id },
    data: {
      ...(data.rate !== undefined && { rate: data.rate }),
      ...(data.content && { content: data.content }),
    },
    include: { client: reviewAuthor, gallery: true },
  })

  revalidatePath("/reviews")
  return { success: true, data: updatedReview }
}

export async function addReviewGalleryItem(reviewId: string, fileName: string) {
  const ctx = await requireOwnedReview(reviewId)
  if ("error" in ctx) return ctx

  await prisma.reviewGalleryItem.create({
    data: {
      studioId: ctx.studio.id,
      fileName,
      reviewId,
    },
  })

  revalidatePath("/reviews")
  return { success: true }
}

export async function removeReviewGalleryItem(id: string) {
  const session = await auth()
  if (!session?.user) {
    return { error: "Unauthorized" }
  }
  const studio = await requireSessionStudio()
  await requireStudioRole(session.user.id, studio.id)

  const item = await prisma.reviewGalleryItem.findUnique({
    where: { id },
    include: { review: true },
  })

  if (!item || item.review.studioId !== studio.id) {
    return { error: "Gallery item not found" }
  }

  await prisma.reviewGalleryItem.delete({ where: { id } })

  revalidatePath("/reviews")
  return { success: true }
}

export async function archiveReview(id: string) {
  const ctx = await requireOwnedReview(id)
  if ("error" in ctx) return ctx

  await prisma.review.update({
    where: { id },
    data: { isArchived: true },
  })

  revalidatePath("/reviews")
  revalidatePath("/[slug]/admin/reviews", "page")
  return { success: true }
}

export async function restoreReview(id: string) {
  const ctx = await requireOwnedReview(id)
  if ("error" in ctx) return ctx

  await prisma.review.update({
    where: { id },
    data: { isArchived: false },
  })

  revalidatePath("/reviews")
  revalidatePath("/[slug]/admin/reviews", "page")
  return { success: true }
}

export async function deleteReview(id: string) {
  const ctx = await requireOwnedReview(id)
  if ("error" in ctx) return ctx

  await prisma.review.delete({ where: { id } })

  revalidatePath("/reviews")
  revalidatePath("/[slug]/admin/reviews", "page")
  return { success: true }
}
