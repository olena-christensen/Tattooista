import NextAuth, { CredentialsSignin } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"
import authConfig from "./auth.config"
import type { PlatformRole } from "@/types"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      displayName: string
      avatar: string | null
      platformRole: PlatformRole
      isActivated: boolean
      studioSlug: string | null
    }
  }

  interface User {
    id: string
    email: string
    displayName: string
    avatar: string | null
    platformRole: PlatformRole
    isActivated: boolean
    studioSlug?: string | null
  }

  interface JWT {
    id: string
    platformRole: PlatformRole
    isActivated: boolean
    displayName: string
    avatar: string | null
    studioSlug: string | null
  }
}

// A plain `throw new Error(...)` inside authorize() is wrapped by @auth/core as
// CallbackRouteError, which collapses every sign-in failure into one generic
// message. Subclassing CredentialsSignin keeps `type === "CredentialsSignin"`
// (it is a static, so subclasses inherit it) while carrying a distinct `code`,
// so the caller can tell the failures apart.
export class InvalidCredentialsError extends CredentialsSignin {
  code = "invalid_credentials"
}

export class EmailNotVerifiedError extends CredentialsSignin {
  code = "email_not_verified"
}

export class NoStudioError extends CredentialsSignin {
  code = "no_studio"
}

export class InvalidVerificationTokenError extends CredentialsSignin {
  code = "invalid_verification_token"
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          throw new InvalidCredentialsError()
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: {
            memberships: {
              include: { studio: { select: { slug: true } } },
              take: 1,
            },
          },
        })

        if (!user) {
          throw new InvalidCredentialsError()
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          throw new InvalidCredentialsError()
        }

        if (!user.isActivated) {
          throw new EmailNotVerifiedError()
        }

        // No studio means no account. The platform only knows studio owners; a row
        // with no membership is leftover data, not a user, and must not hold a
        // session. Accounts are always created together with a studio, so this can
        // only ever be reached by a stale row.
        const studioSlug = user.memberships[0]?.studio.slug
        if (!studioSlug) {
          throw new NoStudioError()
        }

        return {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          avatar: user.avatar,
          platformRole: user.platformRole,
          isActivated: user.isActivated,
          studioSlug,
        }
      },
    }),

    // Sign-in by email-verification link. Clicking a single-use, short-lived token
    // sent to the address proves control of the mailbox — at least as strong as a
    // password — so signup ends in the studio rather than at another login form.
    // Verifying and signing in are the same step; the token is consumed here.
    Credentials({
      id: "email-verification",
      name: "Email verification link",
      credentials: { token: { label: "Token", type: "text" } },
      authorize: async (credentials) => {
        const token = credentials?.token as string | undefined
        if (!token) {
          throw new InvalidVerificationTokenError()
        }

        const verificationToken = await prisma.verificationToken.findUnique({
          where: { token },
        })

        if (!verificationToken || verificationToken.expires < new Date()) {
          if (verificationToken) {
            await prisma.verificationToken.delete({ where: { token } })
          }
          throw new InvalidVerificationTokenError()
        }

        const user = await prisma.user.update({
          where: { email: verificationToken.identifier },
          data: { isActivated: true, emailVerified: new Date() },
          include: {
            memberships: {
              include: { studio: { select: { slug: true } } },
              take: 1,
            },
          },
        })

        // Single use: consume it whether or not the sign-in below succeeds.
        await prisma.verificationToken.delete({ where: { token } })

        const studioSlug = user.memberships[0]?.studio.slug
        if (!studioSlug) {
          throw new NoStudioError()
        }

        return {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          avatar: user.avatar,
          platformRole: user.platformRole,
          isActivated: true,
          studioSlug,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.platformRole = user.platformRole
        token.isActivated = user.isActivated
        token.displayName = user.displayName
        token.avatar = user.avatar
        token.studioSlug = user.studioSlug ?? null
      }

      // Handle session update (e.g., after profile update)
      if (trigger === "update" && session) {
        token.displayName = session.displayName ?? token.displayName
        token.avatar = session.avatar ?? token.avatar
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.platformRole = token.platformRole as PlatformRole
        session.user.isActivated = token.isActivated as boolean
        session.user.displayName = token.displayName as string
        session.user.avatar = token.avatar as string | null
        session.user.studioSlug = token.studioSlug as string | null
      }
      return session
    },
  },
})

export function isPlatformAdmin(platformRole: PlatformRole): boolean {
  return platformRole === "PLATFORM_ADMIN"
}
