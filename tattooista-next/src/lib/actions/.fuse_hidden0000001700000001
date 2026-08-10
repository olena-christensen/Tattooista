"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function updateStudioSettings(data: {
  name: string
  logo: string
  heroImage: string
  heroPortrait: string
  heroTextLeft: string
  heroTextCenter: string
  heroTextBottom: string
  phone: string
  instagram: string
  facebook: string
}) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Not authenticated" }
  }

  const studioSlug = session.user.studioSlug
  if (!studioSlug) {
    return { error: "No studio found" }
  }

  const studio = await prisma.studio.findUnique({
    where: { slug: studioSlug },
  })

  if (!studio) {
    return { error: "Studio not found" }
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
    return { error: "Only the studio owner can update settings" }
  }

  await prisma.studio.update({
    where: { id: studio.id },
    data: {
      name: data.name || studio.name,
      logo: data.logo || null,
      heroImage: data.heroImage || null,
      heroPortrait: data.heroPortrait || null,
      heroTextLeft: data.heroTextLeft || null,
      heroTextCenter: data.heroTextCenter || null,
      heroTextBottom: data.heroTextBottom || null,
      phone: data.phone || null,
      instagram: data.instagram || null,
      facebook: data.facebook || null,
    },
  })

  return { success: true }
}

export async function getStudioSettings() {
  const session = await auth()
  if (!session?.user?.id) return null

  const studioSlug = session.user.studioSlug
  if (!studioSlug) return null

  return prisma.studio.findUnique({
    where: { slug: studioSlug },
    select: {
      name: true,
      slug: true,
      logo: true,
      heroImage: true,
      heroPortrait: true,
      heroTextLeft: true,
      heroTextCenter: true,
      heroTextBottom: true,
      phone: true,
      instagram: true,
      facebook: true,
    },
  })
}

export async function deleteStudio() {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Not authenticated" }
  }

  const studioSlug = session.user.studioSlug
  if (!studioSlug) {
    return { error: "No studio found" }
  }

  const studio = await prisma.studio.findUnique({
    where: { slug: studioSlug },
  })

  if (!studio) {
    return { error: "Studio not found" }
  }

  // Verify the user is the owner
  const membership = await prisma.studioMembership.findUnique({
    where: {
      userId_studioId: {
        userId: session.user.id,
        studioId: studio.id,
      },
    },
  })

  if (!membership || membership.role !== "OWNER") {
    return { error: "Only the studio owner can delete the studio" }
  }

  // Delete everything — Prisma cascades handle related records
  await prisma.studio.delete({
    where: { id: studio.id },
  })

  return { success: true }
}
