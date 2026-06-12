"use server"

import { prisma } from "@/lib/prisma"
import { signIn, signOut, auth } from "@/lib/auth"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { registerSchema, loginSchema, resetPasswordSchema, newPasswordSchema, createStudioSchema } from "@/lib/validations/auth"
import { createStudioWithDefaults } from "@/lib/studio"
import { DPA_VERSION } from "@/lib/constants"
import { generateSlug, validateSlug } from "@/lib/slug"
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/email"
import { revalidatePath } from "next/cache"
import { AuthError } from "next-auth"

export async function register(formData: FormData) {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    displayName: formData.get("displayName"),
  }

  const validationResult = registerSchema.safeParse(rawData)
  if (!validationResult.success) {
    return { error: validationResult.error.issues[0].message }
  }

  const { email, password, displayName } = validationResult.data

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    return { error: "A user with this email already exists" }
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12)

  // Create user
  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      displayName,
      isActivated: false,
    },
  })

  // Create verification token
  const token = crypto.randomBytes(32).toString("hex")
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  })

  // Send verification email
  await sendVerificationEmail(email, token)

  return { success: true, message: "Registration successful! Please check your email to verify your account." }
}

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
          return { error: "Invalid email or password" }
        default:
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

export async function verifyEmail(token: string) {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  })

  if (!verificationToken) {
    return { error: "Invalid verification token" }
  }

  if (verificationToken.expires < new Date()) {
    await prisma.verificationToken.delete({
      where: { token },
    })
    return { error: "Verification token has expired" }
  }

  await prisma.user.update({
    where: { email: verificationToken.identifier },
    data: {
      isActivated: true,
      emailVerified: new Date(),
    },
  })

  await prisma.verificationToken.delete({
    where: { token },
  })

  return { success: true, message: "Email verified successfully! You can now log in." }
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

  const user = await prisma.user.findUnique({
    where: { email },
  })

  // Always return success to prevent email enumeration
  if (!user) {
    return { success: true, message: "If an account with that email exists, we've sent a password reset link." }
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

  await sendPasswordResetEmail(email, token)

  return { success: true, message: "If an account with that email exists, we've sent a password reset link." }
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
}

export async function resendVerificationEmail(email: string) {
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

  await sendVerificationEmail(email, token)

  return { success: true, message: "Verification email sent! Please check your inbox." }
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
      // Check email not taken
      const existingUser = await tx.user.findUnique({
        where: { email },
      })
      if (existingUser) {
        throw new Error("This email is already associated with a studio on our platform. Please use a different email or sign in to your existing studio.")
      }

      // Check slug not taken
      const existingStudio = await tx.studio.findUnique({
        where: { slug },
      })
      if (existingStudio) {
        throw new Error(`The URL "${slug}" is already taken. Try a different studio name.`)
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
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: "Failed to create studio. Please try again." }
  }

  // Send email outside transaction — failure here doesn't roll back the DB
  await sendVerificationEmail(email, verificationToken)

  return {
    success: true,
    slug,
    message: "Studio created! Please check your email to verify your account.",
  }
}
