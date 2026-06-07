import type { Metadata } from "next"
import Link from "next/link"

import { Container } from "@/components/shared/container"
import { PlatformHeader } from "@/components/shared/platform-header"
import { PlatformFooter } from "@/components/shared/platform-footer"

export const metadata: Metadata = {
  title: "Refund Policy",
  description:
    "How to request a refund for your Tattooista subscription, how long refunds take, and how to reach us about billing.",
}

const COMPANY = "Olena Christensen, Individual Entrepreneur (FOP)"

const headingClass =
  "font-display text-[clamp(22px,3vw,28px)] font-normal uppercase tracking-[1px] mt-14 mb-4 scroll-mt-28"
const bodyClass = "text-[15px] leading-[1.8] text-[#c7c7c7] mb-4"
const linkClass =
  "text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors break-words"

const BILLING_EMAIL = "billing@nothingweird.agency"

export default function RefundPolicyPage() {
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
          Refund Policy
        </h1>
        <p className="text-[13px] tracking-[1.5px] uppercase text-muted-foreground mt-4">
          Last updated June 07, 2026
        </p>

        <div className="mt-12">
          <p className={bodyClass}>
            Thank you for subscribing to Tattooista. We hope you are happy with your
            subscription. However, if you are not completely satisfied with your purchase
            for any reason, you may request a refund. Please see below for more information
            on our refund policy.
          </p>

          <h2 className={headingClass}>Refunds</h2>
          <p className={bodyClass}>
            To request a refund, email us at{" "}
            <a href={`mailto:${BILLING_EMAIL}`} className={linkClass}>
              {BILLING_EMAIL}
            </a>{" "}
            within fourteen (14) days of the purchase date. Please include the email address
            associated with your account and proof of purchase so we can locate your
            subscription.
          </p>
          <p className={bodyClass}>
            After receiving your request, we will process your refund. Please allow at least
            fourteen (14) days from the date of your request for us to process it. Refunds
            may take 1–2 billing cycles to appear on your statement, depending on your
            payment provider. We will notify you by email when your refund has been
            processed.
          </p>

          <h2 className={headingClass}>Exceptions</h2>
          <p className={bodyClass}>
            For defective or unsatisfactory service, please contact us at the contact
            details below to arrange a refund.
          </p>

          <h2 className={headingClass}>Questions</h2>
          <p className={bodyClass}>
            If you have any questions concerning our refund policy, please contact us at:
          </p>
          <address className="not-italic text-[15px] leading-[1.8] text-[#c7c7c7]">
            {COMPANY}
            <br />
            <a href={`mailto:${BILLING_EMAIL}`} className={linkClass}>
              {BILLING_EMAIL}
            </a>
            <br />
            Phone: (+380)776591244
          </address>
        </div>
      </Container>
      <PlatformFooter />
    </div>
  )
}
