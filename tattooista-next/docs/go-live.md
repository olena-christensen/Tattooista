# Tattooista — Go-Live Plan

Living to-do list for getting Tattooista from current state to production launch.
Grounded in what's actually in the repo as of 28 May 2026 — not a fresh roadmap.

Tomorrow's focus is at the top. The rest is the wider picture, organised by track so it can be picked up in any order once Termly day is done.

---

## Answering legal-doc / Termly questions — standing rules

The decisions we always apply, so they're not reconstructed each screen.
Source: nothing-weird-transfer-notes.md (sec 3, 4, 5) + locked working-session calls.

1. Default **YES** to any capability the platform will plausibly build; **NO** only for genuinely harmful or irrelevant items (e.g. CSAM, physical-goods shipping). Keep privacy / terms / cookie / DPA answers consistent.
2. **B2B, not B2C** — docs are a SaaS subscription/service agreement. The "user" is the studio (internal business use), not the studio's walk-in clients.
3. Tattooista is a data **processor**; studios are controllers. DPA required (separate signable doc).
4. Payment = **Option A only**: subscription fee charged to studios. NOT a payment facilitator / marketplace for studios' own client payments.
5. **Paddle = Merchant of Record** — handles EU VAT. Still collect studio VAT numbers for B2B reverse-charge (VIES validation).
6. Hosting disclosure: app layer = **United States** (Vercel); database = **EU / Germany** (Neon).
7. Base currency = **EUR**.
8. Drop all tarot-era items: **no** 18+ age gate, **no** entertainment-only disclaimers, **no** divination category restrictions.
9. A completed screen is final — do not re-open settled answers. BUT if the real decision is not ready, take the safe placeholder option to keep moving AND log it to the revisit list below.

**Revisit list (safe placeholder taken, real decision pending):**
- Free trial: terms say Yes/14-day/suspend-don't-charge, but trial-vs-freemium product decision still open.
- Legal-name string consistency: use ONE spelling of the FOP legal name ("Olena Christensen, Individual Entrepreneur (FOP)") across ALL docs — privacy, terms, cookie, DPA — AND across both Nothing Weird projects (Tattooista + The Veil). No official Diia English version exists, so the chosen transliteration is the source of truth. Audit + align on self-host.
- Refund doc shipping-language cleanup: Termly Return Policy generator emits physical-retail wording ("return package", "postmarked", "return shipping", "Company pays"). None applies to a digital subscription. Before hosting /refund, strip/reword all shipping/postmark/package language so it reads as "request a refund within 14 days" etc. Refund window = 14 days, processing = 14 days.

---

## Termly

Paddle account is live and identity-verified. Domain verification needs the four legal URLs (/pricing, /terms, /privacy, /refund) to resolve to real content before checkout can go live.

Done:
- [x] Terms and Conditions — generated + shipped at /terms (7 Jun)
- [x] Privacy policy — generated + shipped at /privacy (7 Jun)
- [x] Cookie policy — generated + shipped at /cookie-policy (7 Jun; may need revisiting)
- [x] GPC (Global Privacy Control) wired end-to-end: Sec-GPC header to GpcProvider to resolveEffectiveConsent hard-override (7 Jun)
- [x] Refund policy — generated in Termly (7 Jun). Needs shipping-language cleanup before /refund ships (see revisit list). NOT in global footer — link from pricing/checkout + terms only.
- [x] Contact form — shipped at /contact (7 Jun)

Still to do:
- [ ] Data Processing Agreement (DPA) — the contract the platform signs with each studio because their clients' personal data lives in our database (GDPR requires it). Termly CANNOT generate this — it's a separate document to draft. Downloadable PDF studios sign, not a web page.
- [ ] Build /refund route (paste cleaned refund text)
- [ ] Build /pricing route with real FREE vs PRO numbers
- [ ] Decide pricing tiers + amounts (FREE vs PRO feature split, monthly + annual)
- [ ] Add footer links so the legal routes are reachable (refund NOT in global footer)
- [ ] Once /pricing, /terms, /privacy, /refund all resolve, resubmit Paddle domain verification

Finishing Termly (the tool is temporary — cancel after):
- [ ] Export all 4 generated docs from Termly (own the text, drop dependency on Termly's hosted version)
- [ ] Confirm all 4 are self-hosted at their routes
- [ ] Cancel Termly subscription

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
- [ ] **URGENT** In-account cancellation flow (studio admin → settings → cancel → fires subscription.canceled) — terms promise users can cancel in-account; clause is false until this ships
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
- [x] Contact form shipped at /contact → API route → nodemailer over Zoho SMTP, honeypot, subject tagged [tattooista:category], routed by alias (done 7 Jun)
- [ ] DPA acceptance: checkbox at studio onboarding, store the timestamp + DPA version against the studio

---

## Onboarding gaps to check

Some of this may already exist — verify rather than assume.

- [ ] Studio invitation flow — does an OWNER inviting a STAFF member by email already work (token + email)?
- [ ] Studio creation from landing — works, verified earlier
- [ ] Email templates: verification, password reset, invitation, payment receipts. Paddle handles most billing receipts but supplemental templates are still on us.
- [ ] Terms-update notification mechanism — terms promise users are notified of legal-terms changes; needs email-blast template + in-app notice + updated "last modified" date

---

## Social & accounts

- [ ] Google OAuth social login (next-auth v5 Google provider) — declared in Termly privacy + terms
- [ ] Social sharing on studio public profiles — share/links for Instagram, Facebook, TikTok, Pinterest

---

## Launch prep

- [x] Real domain live at tattooista.app (done)
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
