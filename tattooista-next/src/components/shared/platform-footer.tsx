"use client"

import Link from "next/link"

import { Container } from "@/components/shared/container"
import { openCookiePreferences } from "@/components/shared/cookie-consent"

const linkClass =
  "text-[13px] text-muted-foreground hover:text-foreground transition-colors"

export function PlatformFooter() {
  return (
    <footer className="border-t border-border py-12">
      <Container className="flex justify-between items-center flex-wrap gap-4">
        <Link
          href="/"
          className="font-display text-lg font-semibold tracking-[2px] uppercase text-muted-foreground hover:text-foreground transition-colors"
        >
          Tattooista
        </Link>
        <div className="flex gap-6">
          <Link href="/privacy" className={linkClass}>Privacy</Link>
          <Link href="/terms" className={linkClass}>Terms</Link>
          <Link href="/cookie-policy" className={linkClass}>Cookie Policy</Link>
          <button
            type="button"
            onClick={() => openCookiePreferences()}
            className={linkClass}
          >
            Cookie Preferences
          </button>
          <a href="#" className={linkClass}>Contact</a>
        </div>
        <span className="text-[13px] text-muted-foreground">&copy; 2026 Tattooista</span>
      </Container>
    </footer>
  )
}
