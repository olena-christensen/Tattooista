import { describe, it, expect, vi, beforeEach } from "vitest"

// Regression cover for two defects in src/lib/actions/auth.ts:
//   1. email send failures were swallowed — the action claimed a link was sent
//      when sendPasswordResetEmail had returned { error }.
//   2. Prisma throws propagated out of the server action as a raw HTTP 500
//      instead of a readable { error } result.

// vi.mock is hoisted above the module body, so the mock objects have to be
// built inside vi.hoisted() to exist by the time the factories run.
const {
  prisma,
  auth,
  tx,
  createStudioWithDefaults,
  sendPasswordResetEmail,
  sendVerificationEmail,
} = vi.hoisted(() => {
  const tx = {
    studioMembership: { findFirst: vi.fn() },
    studio: { findUnique: vi.fn() },
  }
  return {
    tx,
    auth: vi.fn(),
    createStudioWithDefaults: vi.fn(),
    prisma: {
      $transaction: vi.fn(async (fn: (t: typeof tx) => unknown) => fn(tx)),
      user: { findUnique: vi.fn(), update: vi.fn() },
      studioMembership: { findFirst: vi.fn() },
      passwordResetToken: {
        findUnique: vi.fn(),
        deleteMany: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
      },
      verificationToken: {
        findUnique: vi.fn(),
        deleteMany: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
      },
    },
    sendPasswordResetEmail: vi.fn(),
    sendVerificationEmail: vi.fn(),
  }
})

vi.mock("@/lib/prisma", () => ({ prisma }))
vi.mock("@/lib/auth", () => ({ signIn: vi.fn(), signOut: vi.fn(), auth }))
// actions/auth.ts imports AuthError from next-auth directly; loading the real
// package pulls in next/server, which does not resolve under the node runner.
vi.mock("next-auth", () => ({ AuthError: class AuthError extends Error {} }))
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))
vi.mock("@/lib/email", () => ({ sendPasswordResetEmail, sendVerificationEmail }))
vi.mock("@/lib/studio", () => ({ createStudioWithDefaults }))

import {
  createStudioForExistingUser,
  getMyStudioSlug,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
} from "@/lib/actions/auth"

function form(entries: Record<string, string>) {
  const fd = new FormData()
  for (const [k, v] of Object.entries(entries)) fd.append(k, v)
  return fd
}

const EMAIL = "someone@example.com"

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(console, "error").mockImplementation(() => {})
  sendPasswordResetEmail.mockResolvedValue({ success: true })
  sendVerificationEmail.mockResolvedValue({ success: true })
})

// owner-login-form.tsx branches on this: a null slug means "signed in but nowhere to
// go", and must surface a message rather than navigating to "/" — a reload of the page
// the user is already on, which reads as the login having silently failed.
describe("getMyStudioSlug", () => {
  it("returns null when the signed-in user owns no studio", async () => {
    auth.mockResolvedValue({ user: { id: "u1" } })
    prisma.studioMembership.findFirst.mockResolvedValue(null)

    expect(await getMyStudioSlug()).toBeNull()
  })

  it("returns the slug when the user owns a studio", async () => {
    auth.mockResolvedValue({ user: { id: "u1" } })
    prisma.studioMembership.findFirst.mockResolvedValue({ studio: { slug: "tatts" } })

    expect(await getMyStudioSlug()).toBe("tatts")
  })

  it("returns null when there is no session at all", async () => {
    auth.mockResolvedValue(null)

    expect(await getMyStudioSlug()).toBeNull()
    expect(prisma.studioMembership.findFirst).not.toHaveBeenCalled()
  })
})

// The bug: createStudio() rejected any email that already had a User row, without
// checking whether that user owned a studio — so a studio-less account could never
// create one. This action is the way out, and its identity MUST come from the session:
// attaching a studio to an email typed into a public form is account takeover.
describe("createStudioForExistingUser", () => {
  const studioForm = () => form({ studioName: "Ink Bar", dpaAccepted: "true" })

  it("refuses when nobody is signed in", async () => {
    auth.mockResolvedValue(null)

    const result = await createStudioForExistingUser(studioForm())

    expect(result).toHaveProperty("error")
    expect(createStudioWithDefaults).not.toHaveBeenCalled()
  })

  it("creates the studio for a signed-in account that owns none", async () => {
    auth.mockResolvedValue({ user: { id: "u1" } })
    tx.studioMembership.findFirst.mockResolvedValue(null)
    tx.studio.findUnique.mockResolvedValue(null)

    const result = await createStudioForExistingUser(studioForm())

    expect(result).toMatchObject({ success: true, slug: "ink-bar" })
    expect(createStudioWithDefaults).toHaveBeenCalledWith(
      "u1",
      expect.objectContaining({ name: "Ink Bar", slug: "ink-bar" }),
      tx
    )
  })

  it("takes the owner from the session, ignoring any email in the form", async () => {
    auth.mockResolvedValue({ user: { id: "u1" } })
    tx.studioMembership.findFirst.mockResolvedValue(null)
    tx.studio.findUnique.mockResolvedValue(null)

    await createStudioForExistingUser(
      form({ studioName: "Ink Bar", dpaAccepted: "true", email: "victim@example.com" })
    )

    // "u1" — the session user — never the submitted address.
    expect(createStudioWithDefaults).toHaveBeenCalledWith("u1", expect.anything(), tx)
  })

  it("refuses when the account already owns a studio", async () => {
    auth.mockResolvedValue({ user: { id: "u1" } })
    tx.studioMembership.findFirst.mockResolvedValue({ id: "m1", role: "OWNER" })

    const result = await createStudioForExistingUser(studioForm())

    expect(result).toHaveProperty("error")
    expect(createStudioWithDefaults).not.toHaveBeenCalled()
  })

  it("refuses when the slug is taken", async () => {
    auth.mockResolvedValue({ user: { id: "u1" } })
    tx.studioMembership.findFirst.mockResolvedValue(null)
    tx.studio.findUnique.mockResolvedValue({ id: "s9", slug: "ink-bar" })

    const result = await createStudioForExistingUser(studioForm())

    expect(result).toHaveProperty("error")
    expect(createStudioWithDefaults).not.toHaveBeenCalled()
  })

  it("requires the DPA to be accepted", async () => {
    auth.mockResolvedValue({ user: { id: "u1" } })

    const result = await createStudioForExistingUser(
      form({ studioName: "Ink Bar", dpaAccepted: "false" })
    )

    expect(result).toHaveProperty("error")
    expect(createStudioWithDefaults).not.toHaveBeenCalled()
  })
})

describe("requestPasswordReset", () => {
  it("reports an error when the reset email fails to send", async () => {
    prisma.user.findUnique.mockResolvedValue({ id: "u1", email: EMAIL })
    prisma.passwordResetToken.deleteMany.mockResolvedValue({ count: 0 })
    prisma.passwordResetToken.create.mockResolvedValue({})
    sendPasswordResetEmail.mockResolvedValue({ error: "Failed to send password reset email" })

    const result = await requestPasswordReset(form({ email: EMAIL }))

    expect(result).toHaveProperty("error")
    expect(result).not.toHaveProperty("success")
  })

  it("discards the token when the email could not be delivered", async () => {
    prisma.user.findUnique.mockResolvedValue({ id: "u1", email: EMAIL })
    prisma.passwordResetToken.deleteMany.mockResolvedValue({ count: 0 })
    prisma.passwordResetToken.create.mockResolvedValue({})
    sendPasswordResetEmail.mockResolvedValue({ error: "boom" })

    await requestPasswordReset(form({ email: EMAIL }))

    // once to clear old tokens, once to drop the undeliverable one
    expect(prisma.passwordResetToken.deleteMany).toHaveBeenCalledTimes(2)
  })

  it("returns success when the email is sent", async () => {
    prisma.user.findUnique.mockResolvedValue({ id: "u1", email: EMAIL })
    prisma.passwordResetToken.deleteMany.mockResolvedValue({ count: 0 })
    prisma.passwordResetToken.create.mockResolvedValue({})

    const result = await requestPasswordReset(form({ email: EMAIL }))

    expect(result).toMatchObject({ success: true })
  })

  it("returns an error result instead of throwing when the DB is unreachable", async () => {
    prisma.user.findUnique.mockRejectedValue(
      Object.assign(new Error("Can't reach database server"), { code: "P1001" })
    )

    const result = await requestPasswordReset(form({ email: EMAIL }))

    expect(result).toHaveProperty("error")
  })

  it("says plainly when there is no account for that email", async () => {
    prisma.user.findUnique.mockResolvedValue(null)

    const result = await requestPasswordReset(form({ email: EMAIL }))

    expect(result).toHaveProperty("error")
    expect(prisma.passwordResetToken.create).not.toHaveBeenCalled()
  })
})

describe("resetPassword", () => {
  it("returns an error result instead of throwing when the DB is unreachable", async () => {
    prisma.passwordResetToken.findUnique.mockRejectedValue(new Error("P1001"))

    const result = await resetPassword("tok", form({ password: "Passw0rd!x", confirmPassword: "Passw0rd!x" }))

    expect(result).toHaveProperty("error")
  })
})

describe("verifyEmail", () => {
  it("returns an error result instead of throwing when the DB is unreachable", async () => {
    prisma.verificationToken.findUnique.mockRejectedValue(new Error("P1001"))

    const result = await verifyEmail("tok")

    expect(result).toHaveProperty("error")
  })
})

describe("resendVerificationEmail", () => {
  it("reports an error when the verification email fails to send", async () => {
    prisma.user.findUnique.mockResolvedValue({ id: "u1", email: EMAIL, isActivated: false })
    prisma.verificationToken.deleteMany.mockResolvedValue({ count: 0 })
    prisma.verificationToken.create.mockResolvedValue({})
    sendVerificationEmail.mockResolvedValue({ error: "Failed to send verification email" })

    const result = await resendVerificationEmail(EMAIL)

    expect(result).toHaveProperty("error")
    expect(result).not.toHaveProperty("success")
  })
})
