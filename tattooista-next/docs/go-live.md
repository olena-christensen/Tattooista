# Tattooista — Go-Live Plan

Living to-do list for getting Tattooista from current state to production launch.
Updated 31 May 2026. Mirror of the PDF in chat — keep both in sync.

---

## ✅ Done

### Platform / build
- [x] Multitenancy — Studio model, tenant scoping, `tenant-prisma.ts` / `tenant.ts` helpers
- [x] Auth — NextAuth v5: email/password, sessions, verification, password reset
- [x] Roles — PlatformRole + StudioRole via StudioMembership
- [x] Per-studio admin — bookings, clients, gallery, services, FAQ, pages, profile, settings, users
- [x] Per-studio public site — portfolio, contacts, reviews
- [x] Plan enum stub (FREE / PRO) on Studio — no billing wired yet
- [x] Public landing page
- [x] Cookie consent banner

### Payments / business
- [x] Paddle account live + identity-verified
- [x] Paddle payout to Monobank UA configured
- [x] Decision gate #0 closed — Paddle pays out to Ukrainian FOP
- [x] Real domain — tattooista.app registered

---

## 🔥 Termly day — current focus

Paddle domain verification needs the four legal URLs to resolve to real content.

- [ ] Privacy policy (Termly) — IN PROGRESS
- [ ] Cookie policy (Termly)
- [ ] Refund policy (Termly) — align with Paddle MoR terms
- [ ] Terms / subscription agreement (Termly)
- [ ] DPA template — Claude drafts (Termly can't generate a customer-facing DPA)
- [ ] Build routes in `src/app/(public)/` : /pricing /terms /privacy /refund
- [ ] Footer links across (public) and [slug]/(public) layouts
- [ ] Decide pricing tiers + put real numbers on /pricing
- [ ] Resubmit Paddle domain verification once all four URLs resolve
- [ ] Export all docs, then downgrade/cancel Termly to avoid recurring cost (host exported text in-app)

---

## 🧭 Decisions — block billing build

- [ ] Payment flow: subscription-only (A) vs facilitate studio payments (B)
- [ ] Pricing tiers: FREE/PRO feature split + monthly & annual amounts
- [ ] Trial model: freemium FREE tier vs time-limited PRO trial
- [ ] EU B2B VAT: confirm how Paddle wants VAT numbers passed (reverse charge)

---

## 🔧 Build — remaining code

### Auth
- [ ] Add Google OAuth (next-auth v5 Google provider)
- [ ] Verify studio invitation flow — OWNER invites STAFF by email (token + email)

### Billing (Paddle)
- [ ] Schema: add paddleCustomerId / paddleSubscriptionId to Studio
- [ ] Paddle catalog: FREE + PRO products + prices; copy price IDs to env
- [ ] Client-side token issuance endpoint
- [ ] Init Paddle.js in studio admin area
- [ ] Checkout flow: admin → settings → upgrade → Paddle overlay → success/cancel
- [ ] Webhook handler api/paddle/webhook — created / updated / canceled / past_due
- [ ] Plan-gated features in admin UI
- [ ] E2E test against Paddle Sandbox before switching to production keys

### Email
- [ ] Templates: verification, reset, invitation, receipts (Paddle covers most billing); unsubscribe link on marketing email

---

## 💰 Advertising — free-tier monetization

The core revenue model. FREE-tier studios get ads injected into their public sites; PRO removes them.

- [ ] Ad injection on free-tier studio public sites only; PRO removes ads
- [ ] Plan-gate the ad slots (read Studio.plan; render ads when FREE)
- [ ] Pick ad network (AdSense / alternative) + apply/verify
- [ ] Block ad-network cookies until consent — wire to marketing toggle in cookie banner
- [ ] GPC detection (Sec-GPC: 1) → suppress ads + tracking for that visitor
- [ ] Ad + tracking disclosure in each studio public-site privacy + cookie notice (controller-side obligation)
- [ ] Confirm ad network allows this placement model in their policy
- [ ] CCPA "Do Not Sell or Share" link for California visitors (ads = "sharing")

---

## 🛡 GDPR — data-processor obligations

You hold studios' client data → Tattooista is a processor. Non-negotiable for B2B SaaS.

- [ ] Per-studio data export endpoint (JSON scoped to studioId)
- [ ] Full studio deletion flow (cascade exists — needs confirm UI + endpoint)
- [ ] User account deletion (memberships cascade)
- [ ] Contact form → API → nodemailer Zoho SMTP, honeypot, [tattooista:category] routing
- [ ] VAT capture + VIES validation at studio onboarding
- [ ] DPA acceptance: onboarding checkbox, store timestamp + DPA version on studio

---

## 🚀 Launch prep

- [ ] DNS / SPF / DKIM / DMARC for tattooista.app (or subdomain off existing Zoho mailbox)
- [ ] Add Tattooista signature in Zoho (do NOT create new aliases)
- [ ] Point deployment at tattooista.app; update Termly site URL off the vercel domain
- [ ] Google Ads advertiser verification (pricing + refund + contact covered by Termly day)
- [ ] Full smoke test, two studios: signup → onboard → upgrade → use → cancel → delete
- [ ] Error monitoring (Sentry or similar)
- [ ] Postgres backup strategy
- [ ] SEO: robots.txt, sitemap.xml, OG metadata for studio public pages

---

## 🏢 FOP / tax ops

- [ ] PRRO digital receipts (Monobank built-in or Checkbox)
- [ ] Non-Union OSS — register once first EU customer pays
- [ ] Quarterly єдиний податок reports + monthly ЕСВ contribution reminders

---

## 🤔 Decide later

- [ ] 2FA on Paddle, Zoho, Namecheap, Termly
- [ ] GDPR Art.27 EU/UK representative (revisit when revenue is meaningful)
- [ ] Ukraine FOP entity setup — parked at your request

---

## Reference

| Item | Value |
|---|---|
| Local repo | /Users/morthalion/Projects/Tattooista/tattooista-next |
| Deploy | tattooista.app |
| Legal entity | Ukrainian FOP — єдиний податок 3rd group (5%) |
| Bank | Monobank for FOP |
| Payment processor | Paddle (Merchant of Record) |
| Primary email | founder@nothingweird.agency |
| Aliases | hello@ / support@ / billing@ / privacy@ / legal@ |
| Zoho SMTP | smtppro.zoho.eu : 465 SSL |
| Legal docs | Termly (Pro+) — privacy / cookie / refund / terms ; DPA drafted separately |
| Stack | Next 16 · Prisma 7 · NextAuth v5 · Tailwind 4 · shadcn (new-york) |

---

## How to use this doc

- Update it as things ship. "Done" grows; the work sections shrink.
- One file. Don't split across tools.
- When something changes in a chat, write it back HERE — this file is the source of truth, the chat PDF is just a render of it.
