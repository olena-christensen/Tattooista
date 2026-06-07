import NextAuth from "next-auth"
import authConfig from "@/lib/auth.config"
import { NextResponse } from "next/server"
import { extractSubdomain } from "@/lib/tenant"

const { auth } = NextAuth(authConfig)

// Known top-level routes that are NOT studio slugs
const PLATFORM_ROUTES = [
  "login", "register", "verify-email", "reset-password",
  "api", "_next", "not-found", "studio-suspended",
]

function extractSlugFromPath(pathname: string): string | null {
  const firstSegment = pathname.split("/")[1]
  if (!firstSegment) return null
  if (PLATFORM_ROUTES.includes(firstSegment)) return null
  return firstSegment
}

export default auth(async (req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session

  // ---- TENANT RESOLUTION ----
  const hostname = req.headers.get("host") || "localhost:3000"

  // Resolve tenant: subdomain (production) or first path segment (localhost)
  const slug = extractSubdomain(hostname) || extractSlugFromPath(nextUrl.pathname)

  // ---- ROUTE CLASSIFICATION ----
  const isAdminRoute = /^\/[^/]+\/admin(\/|$)/.test(nextUrl.pathname)
  const isStudioPublicRoute = slug && !isAdminRoute
  const isAuthRoute =
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/register")
  const isPlatformPublicRoute =
    nextUrl.pathname === "/" ||
    nextUrl.pathname.startsWith("/api/auth") ||
    nextUrl.pathname.startsWith("/api/contact") ||
    nextUrl.pathname.startsWith("/verify-email") ||
    nextUrl.pathname.startsWith("/reset-password")

  // ---- PUBLIC ROUTES: allow through ----
  if (isPlatformPublicRoute || isStudioPublicRoute) {
    return NextResponse.next()
  }

  // ---- AUTH ROUTES ----
  if (isAuthRoute) {
    // Logged-in users don't need auth pages
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", nextUrl))
    }
    return NextResponse.next()
  }

  // ---- ADMIN ROUTES: require login ----
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl))
    }
    return NextResponse.next()
  }

  // ---- EVERYTHING ELSE: require login ----
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
