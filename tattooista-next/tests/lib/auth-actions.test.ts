import { describe, it, expect, vi, beforeEach } from "vitest"

// Regression cover for two defects in src/lib/actions/auth.ts:
//   1. email send failures were swallowed — the action claimed a link was sent
//      when sendPasswordResetEmail had returned { error }.
//   2. Prisma throws propagated out of the server action as a raw HTTP 500
//      instead of a readable { error } result.

// vi.mock is hoisted above the module body, so the mock objects have to be
// built inside vi.hoisted() to exist by the time the factories run.
const { prisma, auth, signIn, sendPasswordResetEmail, sendVerificationEmail } = vi.hoisted(() => {
  return {
    auth: vi.fn(),
    signIn: vi.fn(),
    prisma: {
      $transaction: vi.fn(),
      user: { findUnique: vi.fn(), update: vi.fn(), create: vi.fn() },
      studio: { findUnique: vi.fn() },
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
vi.mock("@/lib/auth", () => ({ signIn, signOut: vi.fn(), auth }))
// actions/auth.ts imports AuthError from next-auth directly; loading the real
// package pulls in next/server, which does not resolve under the node runner.
vi.mock("next-auth", () => ({ AuthError: class AuthError extends Error {} }))
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))
vi.mock("@/lib/email", () => ({ sendPasswordResetEmail, sendVerificationEmail }))
// Real bcrypt hashing is ~300ms a call and proves nothing here.
vi.mock("bcryptjs", () => ({ default: { hash: vi.fn().mockResolvedValue("hashed") } }))
vi.mock("@/lib/studio", () => ({ createStudioWithDefaults: vi.fn() }))

import { AuthError } from "next-auth"
import {
  login,
  createStudio,
  getMyStudioSlug,
  requestPasswordReset,
  resetPassword,
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

/** An AuthError as @auth/core delivers it: `type` plus the subclass's `code`. */
function credentialsError(code: string) {
  const err = new AuthError("sign-in failed") as AuthError & { type: string; code: string }
  err.type = "CredentialsSignin"
  err.code = code
  return err
}

// Every one of these messages sent a real person round a loop they could not escape:
// a studio-less account was told its password was wrong, so resetting the password
// looked like the fix and never was.
describe("login — what the user is told", () => {
  it("says the account has no studio, rather than blaming the password", async () => {
    signIn.mockRejectedValue(credentialsError("no_studio"))

    const result = await login(form({ email: EMAIL, password: "correct-horse" }))

    expect(result.error).toContain("no studio")
    expect(result.error).not.toContain("Invalid email or password")
  })

  it("still says invalid credentials when the password really is wrong", async () => {
    signIn.mockRejectedValue(credentialsError("invalid_credentials"))

    const result = await login(form({ email: EMAIL, password: "wrong" }))

    expect(result.error).toBe("Invalid email or password")
  })

  it("points an unverified account at its inbox", async () => {
    signIn.mockRejectedValue(credentialsError("email_not_verified"))

    const result = await login(form({ email: EMAIL, password: "correct-horse" }))

    expect(result.error).toContain("verify your email")
  })
})

describe("createStudio — what the user is told", () => {
  const signup = () =>
    form({
      studioName: "Test Studio",
      email: EMAIL,
      password: "correct-horse",
      confirmPassword: "correct-horse",
      dpaAccepted: "true",
    })

  /** Runs the transaction callback against the mocked client, as Prisma would. */
  function runTransaction() {
    prisma.$transaction.mockImplementation((fn: (tx: unknown) => unknown) => fn(prisma))
  }

  it("never leaks a raw database error to the signup form", async () => {
    // This exact message reached a user on the live site.
    runTransaction()
    prisma.user.findUnique.mockRejectedValue(
      new Error(
        "Invalid `prisma.studio.findUnique()` invocation: The column `(not available)` does not exist in the current database."
      )
    )

    const result = await createStudio(signup())

    expect(result.error).not.toContain("prisma")
    expect(result.error).not.toContain("column")
    expect(result.error).toBe("We couldn't create your studio right now. Please try again in a few minutes.")
  })

  it("does not claim a studio exists when the account owns none", async () => {
    runTransaction()
    prisma.user.findUnique.mockResolvedValue({ _count: { memberships: 0 } })

    const result = await createStudio(signup())

    expect(result.error).toContain("owns no studio")
    expect(result.error).not.toContain("sign in to your existing studio")
  })

  it("points at the existing studio when the account really owns one", async () => {
    runTransaction()
    prisma.user.findUnique.mockResolvedValue({ _count: { memberships: 1 } })

    const result = await createStudio(signup())

    expect(result.error).toContain("already associated with a studio")
  })

  it("still surfaces a taken URL, which the user can act on", async () => {
    runTransaction()
    prisma.user.findUnique.mockResolvedValue(null)
    prisma.studio.findUnique.mockResolvedValue({ id: "s1", slug: "test-studio" })

    const result = await createStudio(signup())

    expect(result.error).toContain("already taken")
  })
})

// owner-login-form.tsx redirects on this after a successful sign-in. A null slug should
// now be unreachable for a live session — authorize() refuses any account without a
// studio — but the function is still the source of the slug, so its contract is pinned.
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
