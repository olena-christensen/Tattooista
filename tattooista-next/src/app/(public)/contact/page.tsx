import type { Metadata } from "next"
import Link from "next/link"

import { Container } from "@/components/shared/container"
import { PlatformHeader } from "@/components/shared/platform-header"
import { PlatformFooter } from "@/components/shared/platform-footer"
import { ContactForm } from "@/components/forms/contact-form"

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with the Tattooista team — general questions, data and privacy requests, or legal matters.",
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <PlatformHeader />
      <Container className="max-w-[860px] pt-[120px] pb-16 min-[990px]:pt-[140px] min-[990px]:pb-[100px]">
        <Link
          href="/"
          className="inline-block text-[13px] tracking-[1.5px] uppercase text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to home
        </Link>

        <h1 className="font-display text-[clamp(32px,5vw,55px)] font-normal uppercase tracking-[2px] mt-8">
          Contact
        </h1>
        <p className="text-[15px] leading-[1.8] text-[#c7c7c7] mt-6 max-w-[560px]">
          Have a question about Tattooista, a data or privacy request, or a legal matter?
          Send us a message below and we&rsquo;ll route it to the right team.
        </p>

        <div className="mt-10 max-w-[560px]">
          <ContactForm />
        </div>
      </Container>
      <PlatformFooter />
    </div>
  )
}
