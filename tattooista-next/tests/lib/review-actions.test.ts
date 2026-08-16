import { describe, it, expect, vi, beforeEach } from "vitest"

// Reviews belong to a studio's CUSTOMER (Client), never to a platform User — the two
// are separate objects that never mix. Since customers have no login, the only gate on
// a review is that the email given is already on file as a contact of one of THIS
// studio's clients. These tests pin that gate.

const { prisma } = vi.hoisted(() => ({
  prisma: {
    studio: { findUnique: vi.fn() },
    contact: { findFirst: vi.fn() },
    review: { create: vi.fn() },
  },
}))

vi.mock("@/lib/prisma", () => ({ prisma }))
vi.mock("@/lib/auth", () => ({ auth: vi.fn() }))
vi.mock("@/lib/tenant", () => ({
  requireSessionStudio: vi.fn(),
  requireStudioRole: vi.fn(),
}))
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))

import { createReview } from "@/lib/actions/reviews"

function form(entries: Record<string, string>) {
  const fd = new FormData()
  for (const [k, v] of Object.entries(entries)) fd.append(k, v)
  return fd
}

const validReview = {
  email: "customer@example.com",
  rate: "5",
  content: "Absolutely brilliant work, exactly what I asked for.",
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(console, "error").mockImplementation(() => {})
  prisma.studio.findUnique.mockResolvedValue({ id: "studio-1" })
  prisma.review.create.mockResolvedValue({ id: "r1" })
})

describe("createReview", () => {
  it("accepts a review from someone the studio has on file", async () => {
    prisma.contact.findFirst.mockResolvedValue({ clientId: "client-1" })

    const result = await createReview("tatts", form(validReview))

    expect(result).toMatchObject({ success: true })
    expect(prisma.review.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ studioId: "studio-1", clientId: "client-1" }),
      })
    )
  })

  it("refuses a review from an email the studio doesn't know", async () => {
    prisma.contact.findFirst.mockResolvedValue(null)

    const result = await createReview("tatts", form(validReview))

    expect(result).toHaveProperty("error")
    expect(prisma.review.create).not.toHaveBeenCalled()
  })

  it("looks the customer up scoped to this studio, by email contact", async () => {
    prisma.contact.findFirst.mockResolvedValue({ clientId: "client-1" })

    await createReview("tatts", form(validReview))

    // Being a customer of one studio must grant nothing at another.
    expect(prisma.contact.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ studioId: "studio-1", type: "email" }),
      })
    )
  })

  it("refuses when the studio slug doesn't exist", async () => {
    prisma.studio.findUnique.mockResolvedValue(null)

    const result = await createReview("nope", form(validReview))

    expect(result).toHaveProperty("error")
    expect(prisma.contact.findFirst).not.toHaveBeenCalled()
  })

  it("rejects an invalid email before touching the database", async () => {
    const result = await createReview("tatts", form({ ...validReview, email: "nope" }))

    expect(result).toHaveProperty("error")
    expect(prisma.contact.findFirst).not.toHaveBeenCalled()
  })

  it("rejects a rating outside 1-5", async () => {
    const result = await createReview("tatts", form({ ...validReview, rate: "9" }))

    expect(result).toHaveProperty("error")
    expect(prisma.review.create).not.toHaveBeenCalled()
  })

  it("returns an error result instead of throwing when the DB is unreachable", async () => {
    prisma.contact.findFirst.mockRejectedValue(
      Object.assign(new Error("Can't reach database server"), { code: "P1001" })
    )

    const result = await createReview("tatts", form(validReview))

    expect(result).toHaveProperty("error")
  })
})
