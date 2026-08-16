"use server"

import { prisma } from "@/lib/prisma"
import { signIn, signOut, auth } from "@/lib/auth"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { loginSchema, resetPasswordSchema, newPasswordSchema, createStudioSchema } from "@/lib/validations/auth"
import { createStudioWithDefaults } from "@/lib/studio"
import { DPA_VERSION } from "@/lib/constants"
import { generateSlug, validateSlug } from "@/lib/slug"
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/email"
import { revalidatePath } from "next/cache"
import { AuthError, CredentialsSignin } from "next-auth"

/**
 * A signup failure whose message was written for the person reading it.
 *
 * The transaction below throws for reasons the user can act on ("that URL is taken").
 * Everything else it can throw — a Prisma error, a dropped connection — is internal and
 * must never reach the form: a raw `prisma.studio.findUnique()` error surfaced verbatim
 * on the signup page once, which told the user nothing and leaked schema details.
 */
class StudioSignupError extends Error {}

export async function login(formData: FormData) {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  }

  const validationResult = loginSchema.safeParse(rawData)
  if (!validationResult.success) {
    return { error: validationResult.error.issues[0].message }
  }

  const { email, password } = validationResult.data

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    return { success: true }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          if ((error as CredentialsSignin).code === "email_not_verified") {
            return { error: "Please verify your email before logging in. Check your inbox, or request a new verification email." }
          }
          // The password was right; the account simply owns no studio, so there is
          // nowhere to sign in to. Saying "invalid password" sends people round the
          // password-reset loop forever, which is exactly what it did.
          if ((error as CredentialsSignin).code === "no_studio") {
            return { error: "This email has no studio, so there is nothing to sign in to. Create a studio to get started." }
          }
          return { error: "Invalid email or password" }
        default:
          console.error("login failed:", error)
          return { error: "An error occurred during login" }
      }
    }
    throw error
  }
}

export async function logout() {
  await signOut({ redirect: false })
  revalidatePath("/")
  return { success: true }
}

export async function getMyStudioSlug() {
  const session = await auth()
  if (!session?.user?.id) return null

  const membership = await prisma.studioMembership.findFirst({
    where: { userId: session.user.id, role: "OWNER" },
    include: { studio: { select: { slug: true } } },
  })
  return membership?.studio.slug ?? null
}

/**
 * Verify the email link and sign the user in, in one step.
 *
 * Signup asks for credentials exactly once. Clicking the link finishes the job —
 * no second login form before or after. The token is single-use and consumed by the
 * `email-verification` provider in @/lib/auth.
 */
export async function verifyEmailAndSignIn(token: string) {
  // Resolve the destination BEFORE signing in, for two reasons: the token is consumed
  // by the provider, and the session cookie signIn() sets is not reliably readable via
  // auth() within the same request — so the slug must not come from the session.
  let email: string
  try {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    })
    if (!verificationToken) {
      return { error: "This verification link is invalid or has expired." }
    }
    email = verificationToken.identifier
  } catch (err) {
    console.error("verifyEmailAndSignIn lookup failed:", err)
    return { error: "Something went wrong. Please try again." }
  }

  try {
    await signIn("email-verification", { token, redirect: false })
  } catch (error) {
    if (error instanceof AuthError) {
      if ((error as CredentialsSignin).code === "invalid_verification_token") {
        return { error: "This verification link is invalid or has expired." }
      }
      console.error("verifyEmailAndSignIn failed:", error)
      return { error: "We couldn't complete verification. Please try again." }
    }
    throw error
  }

  const membership = await prisma.studioMembership.findFirst({
    where: { user: { email }, role: "OWNER" },
    include: { studio: { select: { slug: true } } },
  })
  if (!membership) {
    return { error: "We couldn't complete verification. Please try again." }
  }

  revalidatePath("/")
  return { success: true, slug: membership.studio.slug }
}

export async function requestPasswordReset(formData: FormData) {
  const rawData = {
    email: formData.get("email"),
  }

  const validationResult = resetPasswordSchema.safeParse(rawData)
  if (!validationResult.success) {
    return { error: validationResult.error.issues[0].message }
  }

  const { email } = validationResult.data

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return { error: "No account found with that email." }
    }

    // Delete any existing reset tokens
    await prisma.passwordResetToken.deleteMany({
      where: { email },
    })

    // Create new token
    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      },
    })

    // sendPasswordResetEmail swallows its own errors and reports them in the
    // return value — check it, or a failed send looks identical to a sent one.
    const emailResult = await sendPasswordResetEmail(email, token)
    if ("error" in emailResult) {
      // Drop the token — it can never reach them.
      await prisma.passwordResetToken.deleteMany({ where: { email } })
      return { error: "We couldn't send the reset email right now. Please try again in a few minutes." }
    }

    return { success: true, message: "Password reset link sent. Please check your inbox." }
  } catch (err) {
    console.error("requestPasswordReset failed:", err)
    return { error: "Something went wrong. Please try again." }
  }
}

export async function resetPassword(token: string, formData: FormData) {
  const rawData = {
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  }

  const validationResult = newPasswordSchema.safeParse(rawData)
  if (!validationResult.success) {
    return { error: validationResult.error.issues[0].message }
  }

  const { password } = validationResult.data

  try {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    })

    if (!resetToken) {
      return { error: "Invalid reset token" }
    }

    if (resetToken.expires < new Date()) {
      await prisma.passwordResetToken.delete({
        where: { token },
      })
      return { error: "Reset token has expired" }
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    await prisma.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword },
    })

    await prisma.passwordResetToken.delete({
      where: { token },
    })

    return { success: true, message: "Password reset successfully! You can now log in with your new password." }
  } catch (err) {
    console.error("resetPassword failed:", err)
    return { error: "Something went wrong. Please try again." }
  }
}

export async function resendVerificationEmail(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return { error: "No user found with this email" }
    }

    if (user.isActivated) {
      return { error: "This email is already verified" }
    }

    // Delete any existing tokens
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    })

    // Create new token
    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    })

    // This action already discloses whether the account exists, so there is no
    // enumeration reason to hide a failed send — report it plainly.
    const emailResult = await sendVerificationEmail(email, token)
    if ("error" in emailResult) {
      return { error: "We couldn't send the verification email right now. Please try again in a few minutes." }
    }

    return { success: true, message: "Verification email sent! Please check your inbox." }
  } catch (err) {
    console.error("resendVerificationEmail failed:", err)
    return { error: "Something went wrong. Please try again." }
  }
}

export async function createStudio(formData: FormData) {
  const rawData = {
    studioName: formData.get("studioName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    dpaAccepted: formData.get("dpaAccepted") === "true",
  }

  // Re-validates DPA acceptance server-side (schema requires dpaAccepted === true)
  const validationResult = createStudioSchema.safeParse(rawData)
  if (!validationResult.success) {
    return { error: validationResult.error.issues[0].message }
  }

  const { studioName, email, password } = validationResult.data

  // Generate and validate slug before hitting the DB
  const slug = generateSlug(studioName)
  const slugValidation = validateSlug(slug)
  if (!slugValidation.valid) {
    return { error: `Studio name produces an invalid URL. Try a longer or different name.` }
  }

  // Hash password before the transaction (CPU-intensive, don't hold tx open)
  const hashedPassword = await bcrypt.hash(password, 12)

  // Atomic: create User + Studio + Membership + defaults + verification token
  let verificationToken: string
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Check email not taken. Accounts and studios are created together here, so an
      // existing email USUALLY means an existing studio — but not always: rows left by
      // the retired register() own nothing, and claiming they have a studio sends the
      // person hunting for one that does not exist.
      const existingUser = await tx.user.findUnique({
        where: { email },
        select: { _count: { select: { memberships: true } } },
      })
      if (existingUser) {
        throw new StudioSignupError(
          existingUser._count.memberships > 0
            ? "This email is already associated with a studio on our platform. Please use a different email or sign in to your existing studio."
            : "This email is already registered but owns no studio, so it cannot be used to create one. Please use a different email, or contact support to have it released."
        )
      }

      // Check slug not taken
      const existingStudio = await tx.studio.findUnique({
        where: { slug },
      })
      if (existingStudio) {
        throw new StudioSignupError(`The URL "${slug}" is already taken. Try a different studio name.`)
      }

      // Create user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          displayName: studioName,
          isActivated: false,
        },
      })

      // Create studio with defaults (Studio + Membership + pages + default style).
      // DPA acceptance is stamped server-side here — never trusted from the client.
      await createStudioWithDefaults(
        user.id,
        { name: studioName, slug, dpaAcceptedAt: new Date(), dpaVersion: DPA_VERSION },
        tx
      )

      // Create verification token
      const token = crypto.randomBytes(32).toString("hex")
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

      await tx.verificationToken.create({
        data: {
          identifier: email,
          token,
          expires,
        },
      })

      return { slug, token }
    })

    verificationToken = result.token
  } catch (error) {
    if (error instanceof StudioSignupError) {
      return { error: error.message }
    }
    console.error("createStudio failed:", error)
    return { error: "We couldn't create your studio right now. Please try again in a few minutes." }
  }

  // Send email outside transaction — failure here doesn't roll back the DB.
  // The studio is committed, so a failed send must not read as a failed signup.
  const emailResult = await sendVerificationEmail(email, verificationToken)
  if ("error" in emailResult) {
    return {
      success: true,
      slug,
      message: "Studio created, but we couldn't send the verification email. Use \"Resend verification email\" to try again.",
    }
  }

  return {
    success: true,
    slug,
    message: "Studio created! Please check your email to verify your account.",
  }
}
