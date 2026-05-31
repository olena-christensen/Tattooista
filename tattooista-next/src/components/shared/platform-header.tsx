"use client"

import Link from "next/link"

import { Container } from "@/components/shared/container"

const navLinkClass =
  "text-[#c7c7c7] text-[13px] tracking-[1.5px] uppercase hover:text-foreground transition-colors"
const signInClass =
  "inline-flex items-center justify-center px-7 h-11 border-[1.5px] border-foreground text-[12px] font-semibold tracking-[1.5px] uppercase transition-all duration-300 hover:bg-foreground hover:text-background"

// `onSignIn` opens the auth dialog, which only lives on the landing page. When
// not provided (e.g. on the cookie-policy page), Sign In links home instead.
export function PlatformHeader({ onSignIn }: { onSignIn?: () => void }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-5 bg-background/90 backdrop-blur-md border-b border-border">
      <Container className="flex items-center justify-between">
        <Link
          href="/"
          className="font-display text-[28px] font-semibold tracking-[3px] uppercase"
        >
          Tattooista
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/#features" className={navLinkClass}>
            Features
          </Link>
          <Link href="/#pricing" className={navLinkClass}>
            Pricing
          </Link>
          {onSignIn ? (
            <button type="button" onClick={onSignIn} className={signInClass}>
              Sign In
            </button>
          ) : (
            <Link href="/" className={signInClass}>
              Sign In
            </Link>
          )}
        </nav>
      </Container>
    </header>
  )
}
