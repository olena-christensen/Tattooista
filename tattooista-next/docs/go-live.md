# Tattooista — Go-Live Plan

Living to-do list for getting Tattooista from current state to production launch.
Grounded in what's actually in the repo as of 28 May 2026 — not a fresh roadmap.

Tomorrow's focus is at the top. The rest is the wider picture, organised by track so it can be picked up in any order once Termly day is done.

---

## Tomorrow — Termly day

The Paddle account is live and identity-verified. Domain verification is the last gate before going live with checkout, and it needs the four legal URLs to resolve to real content. So tomorrow is the legal-and-pricing-pages sprint.

- [ ] Generate the B2B SaaS subscription agreement in Termly (not consumer ToU — Tattooista sells to studios)
- [ ] Generate the privacy policy (positioning: Tattooista is a data **processor**, studios are controllers)
- [ ] Generate the cookie policy
- [ ] Generate the refund policy (Paddle's domain verification specifically requires this URL)
- [ ] Generate the DPA template (downloadable PDF studios can sign — separate document, not a page)
- [ ] Create the four routes in `src/app/(public)/`:
  - `/pricing`
  - `/terms`
  - `/privacy`
  - `/refund`
- [ ] Add footer links across the `(public)` and `[slug]/(public)` layouts so all routes link to all four
- [ ] Decide pricing tiers and put real numbers on `/pricing` (FREE vs PRO feature split + amounts)
- [ ] Once all four URLs resolve, go back to Paddle and resubmit domain verification

---

## Already built — don't redo

Confirmed from the repo. Listing these so they're not accidentally re-planned.

- **Multitenancy** — `Studio` model with `slug`, `studioId` foreign keys and indexes across every business model, `tenant-prisma.ts` and `tenant.ts` helpers in `src/lib/`. Solid.
- **Auth** — NextAuth (v5 beta) with email/password, sessions, accounts, verification tokens, password reset.
- **Roles** — `PlatformRole` (USER / PLATFORM_ADMIN) and `StudioRole` (OWNER / STAFF) via `StudioMembership`.
- **Per-studio admin** — bookings, clients, gallery, services, FAQ, pages, profile, settings, styles, users (under `src/app/[slug]/admin/`).
- **Per-studio public site** — portfolio, contacts, reviews (under `src/app/[slug]/(public)/`).
- **Plan model stub** — `Plan` enum (FREE / PRO) on `Studio`. No billing wired yet.
- **Public landing page** — done.

---

## Decisions to make before billing wires in

These don't need to be made tomorrow, but they block the Paddle integration work.

- [ ] **Pricing tiers.** FREE vs PRO: what's the feature split, what are the amounts (monthly + annual). Needs to be real because it lands on the `/pricing` page and in Paddle's catalog.
- [ ] **Free trial or freemium?** FREE tier with limits, or PRO trial period? Affects schema, gating logic, and how Paddle is configured.
- [ ] **EU B2B VAT model.** Paddle handles VAT as Merchant of Record, but you still collect studio VAT numbers for reverse-charge eligibility. Confirm in Paddle docs how it wants this passed.

---

## Billing — Paddle integration

Once tiers are decided, this is the biggest single chunk of build work.

- [ ] Schema migration: add `paddleCustomerId` and `paddleSubscriptionId` to `Studio` (or rename the existing Stripe-named fields)
- [ ] Set up Paddle catalog in dashboard: FREE + PRO products with prices; copy price IDs into env
- [ ] Build client-side token issuance endpoint
- [ ] Initialise Paddle.js in the studio admin area
- [ ] Checkout flow: studio admin → settings → upgrade → Paddle overlay → success/cancel
- [ ] Webhook handler at `src/app/api/paddle/webhook/route.ts` — handle `subscription.created`, `subscription.updated`, `subscription.canceled`, `subscription.past_due`
- [ ] VAT number capture + VIES validation in studio onboarding (for EU B2B reverse-charge)
- [ ] Plan-gated features in admin UI (some features only on PRO)
- [ ] End-to-end test against Paddle Sandbox before switching env to production keys

---

## GDPR / data processor obligations

You handle studios' clients' data — that makes Tattooista a processor under GDPR. These are non-negotiable for B2B SaaS.

- [ ] Per-studio data export endpoint — JSON dump of everything scoped to the studio's `studioId`
- [ ] Full studio deletion flow — schema already cascades on `onDelete: Cascade`, so this is mostly a confirmation UI + endpoint
- [ ] User account deletion (separate from studio deletion — memberships cascade)
- [ ] Contact form: `/contact` → API route → nodemailer over Zoho SMTP, honeypot, subject tagged `[tattooista:category]` so it routes to the right alias (DSAR → `privacy@`, IP → `legal@`, general → `support@`)
- [ ] DPA acceptance: checkbox at studio onboarding, store the timestamp + DPA version against the studio

---

## Onboarding gaps to check

Some of this may already exist — verify rather than assume.

- [ ] Studio invitation flow — does an OWNER inviting a STAFF member by email already work (token + email)?
- [ ] Studio creation from landing — works, verified earlier
- [ ] Email templates: verification, password reset, invitation, payment receipts. Paddle handles most billing receipts but supplemental templates are still on us.

---

## Launch prep

- [ ] Replace `tattooista-next.vercel.app` with a real domain
- [ ] DNS / SPF / DKIM / DMARC pattern replicated for the new domain (or point a subdomain at the existing Zoho mailbox)
- [ ] Google Ads advertiser verification — landing must show clear pricing, refund policy, and contact (all of which Termly day delivers)
- [ ] Full smoke test with two real studios end-to-end: signup → onboarding → upgrade → daily use → cancel → delete
- [ ] Error monitoring wired in (Sentry or similar)
- [ ] Backup strategy for Postgres
- [ ] SEO basics: `robots.txt`, `sitemap.xml`, OG metadata for studio public pages

---

## Parked

- **Ukraine FOP entity setup** — parked at user's request. Doesn't block any of the above; can be revisited later.

---

## How to use this doc

- Update it as things ship. The "Already built" section grows; the work sections shrink.
- One file. Don't split into multiple to-do lists across tools.
- If a task here needs a decision more than a build action, surface it in the "Decisions" section first so the build work isn't blocked.
