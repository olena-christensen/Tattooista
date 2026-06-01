#!/usr/bin/env bash
# Create one GitHub issue per open item in tattooista-next/docs/go-live.md.
#
# Prereqs:
#   1. gh auth login           (the CLI must be authenticated)
#   2. On the board (projects/1) enable the workflow "Item added to repo -> add
#      to project" (or "Auto-add"), so these issues land on the board
#      automatically. Alternatively run with ADD_TO_BOARD=1 (needs project scope:
#      gh auth refresh -s project).
#
# Run ONCE — re-running creates duplicates.
#   bash scripts/create-go-live-issues.sh
#
# Repo override if the name differs:
#   REPO=olena-christensen/Tattooista bash scripts/create-go-live-issues.sh
set -euo pipefail

REPO="${REPO:-olena-christensen/Tattooista}"
PROJECT="${PROJECT:-1}"
OWNER="${OWNER:-olena-christensen}"
ADD_TO_BOARD="${ADD_TO_BOARD:-0}"

echo "Target repo: $REPO"
command -v gh >/dev/null || { echo "gh not installed"; exit 1; }
gh auth status >/dev/null 2>&1 || { echo "Run: gh auth login"; exit 1; }

# --- ensure labels (idempotent) ---
lbl() { gh label create "$1" --color "$2" --description "$3" --repo "$REPO" --force >/dev/null; }
lbl "type:feature"   "0e8a16" "New code / capability"
lbl "type:chore"     "fef2c0" "Ops, config, legal, docs"
lbl "type:decision"  "d4c5f9" "Needs a decision before build"
lbl "priority:high"  "b60205" "Do next"
lbl "priority:medium" "fbca04" "Soon"
lbl "priority:low"   "c2e0c6" "Later / backlog"
lbl "area:legal"     "5319e7" "Termly / legal docs / policies"
lbl "area:billing"   "1d76db" "Paddle / pricing / subscriptions"
lbl "area:ads"       "006b75" "Advertising / free-tier monetization"
lbl "area:gdpr"      "0052cc" "Data-processor obligations"
lbl "area:auth"      "5319e7" "Auth / NextAuth"
lbl "area:email"     "bfd4f2" "Transactional / marketing email"
lbl "area:launch"    "c5def5" "Launch prep / infra / SEO"
lbl "area:tax"       "e4e669" "FOP / tax ops"
lbl "area:ui"        "bfd4f2" "Public-site routes / layout"

DOC="tattooista-next/docs/go-live.md"
mk() { # title, labels, body
  echo "  + $1"
  url=$(gh issue create --repo "$REPO" --title "$1" --label "$2" --body "$3")
  if [ "$ADD_TO_BOARD" = "1" ]; then
    gh project item-add "$PROJECT" --owner "$OWNER" --url "$url" >/dev/null
  fi
}
ref() { printf 'From the go-live plan (`%s`) → %s.\n\n%s' "$DOC" "$1" "$2"; }

echo "Creating issues…"

# ── Termly day (legal URLs for Paddle verification) ──
mk "Privacy policy (Termly)" "type:chore,area:legal,priority:high" "$(ref 'Termly day' 'In progress. One of the four legal URLs Paddle needs to resolve.')"
mk "Cookie policy (Termly)" "type:chore,area:legal,priority:high" "$(ref 'Termly day' 'Note: a cookie-policy PAGE already exists in-app (.claude/features/cookie-policy.md) — reconcile Termly text with it.')"
mk "Refund policy (Termly) — align with Paddle MoR terms" "type:chore,area:legal,priority:high" "$(ref 'Termly day' 'Must align with Paddle Merchant-of-Record terms.')"
mk "Terms / subscription agreement (Termly)" "type:chore,area:legal,priority:high" "$(ref 'Termly day' '')"
mk "DPA template (Claude drafts)" "type:chore,area:legal,priority:high" "$(ref 'Termly day' 'Termly cannot generate a customer-facing DPA — draft separately.')"
mk "Build (public) routes: /pricing /terms /privacy /refund" "type:feature,area:legal,area:ui,priority:high" "$(ref 'Termly day' 'Routes under src/app/(public)/. The four legal URLs must resolve to real content for Paddle verification.')"
mk "Footer links across (public) and [slug]/(public) layouts" "type:feature,area:ui,priority:high" "$(ref 'Termly day' 'Link the new legal routes from both layout footers.')"
mk "Decide pricing tiers + real numbers on /pricing" "type:chore,area:billing,priority:high" "$(ref 'Termly day' 'Depends on the pricing-tiers decision.')"
mk "Resubmit Paddle domain verification" "type:chore,area:billing,priority:high" "$(ref 'Termly day' 'Once all four legal URLs resolve.')"
mk "Export Termly docs, then downgrade/cancel Termly" "type:chore,area:legal,priority:medium" "$(ref 'Termly day' 'Host exported text in-app to avoid recurring Termly cost.')"

# ── Decisions (block billing build) ──
mk "DECISION: Payment flow — subscription-only (A) vs facilitate studio payments (B)" "type:decision,area:billing,priority:high" "$(ref 'Decisions — block billing build' '')"
mk "DECISION: Pricing tiers — FREE/PRO split + monthly & annual amounts" "type:decision,area:billing,priority:high" "$(ref 'Decisions — block billing build' '')"
mk "DECISION: Trial model — freemium FREE tier vs time-limited PRO trial" "type:decision,area:billing,priority:high" "$(ref 'Decisions — block billing build' '')"
mk "DECISION: EU B2B VAT — how Paddle wants VAT numbers passed (reverse charge)" "type:decision,area:billing,priority:high" "$(ref 'Decisions — block billing build' '')"

# ── Build: Auth ──
mk "Add Google OAuth (next-auth v5 Google provider)" "type:feature,area:auth,priority:medium" "$(ref 'Build — Auth' '')"
mk "Verify studio invitation flow (OWNER invites STAFF by email)" "type:feature,area:auth,priority:medium" "$(ref 'Build — Auth' 'Token + email.')"

# ── Build: Billing (Paddle) ──
mk "Schema: add paddleCustomerId / paddleSubscriptionId to Studio" "type:feature,area:billing,priority:medium" "$(ref 'Build — Billing' '')"
mk "Paddle catalog: FREE + PRO products + prices; copy price IDs to env" "type:chore,area:billing,priority:medium" "$(ref 'Build — Billing' '')"
mk "Client-side token issuance endpoint" "type:feature,area:billing,priority:medium" "$(ref 'Build — Billing' '')"
mk "Init Paddle.js in studio admin area" "type:feature,area:billing,priority:medium" "$(ref 'Build — Billing' '')"
mk "Checkout flow: admin → settings → upgrade → Paddle overlay → success/cancel" "type:feature,area:billing,priority:medium" "$(ref 'Build — Billing' '')"
mk "Webhook handler api/paddle/webhook (created/updated/canceled/past_due)" "type:feature,area:billing,priority:medium" "$(ref 'Build — Billing' '')"
mk "Plan-gated features in admin UI" "type:feature,area:billing,priority:medium" "$(ref 'Build — Billing' '')"
mk "E2E test against Paddle Sandbox before production keys" "type:feature,area:billing,priority:medium" "$(ref 'Build — Billing' '')"

# ── Build: Email ──
mk "Email templates: verification, reset, invitation, receipts + unsubscribe" "type:feature,area:email,priority:medium" "$(ref 'Build — Email' 'Paddle covers most billing receipts; unsubscribe link required on marketing email.')"

# ── Advertising (free-tier monetization) ──
mk "Ad injection on free-tier studio public sites only; PRO removes ads" "type:feature,area:ads,priority:medium" "$(ref 'Advertising' 'Core revenue model.')"
mk "Plan-gate the ad slots (render ads when Studio.plan = FREE)" "type:feature,area:ads,priority:medium" "$(ref 'Advertising' '')"
mk "Pick ad network (AdSense / alternative) + apply/verify" "type:chore,area:ads,priority:medium" "$(ref 'Advertising' '')"
mk "Block ad-network cookies until consent (wire to marketing toggle)" "type:feature,area:ads,priority:medium" "$(ref 'Advertising' 'Tie to the cookie banner marketing toggle.')"
mk "GPC detection (Sec-GPC: 1) → suppress ads + tracking for that visitor" "type:feature,area:ads,priority:medium" "$(ref 'Advertising' '')"
mk "Ad + tracking disclosure in studio public-site privacy + cookie notice" "type:chore,area:ads,area:gdpr,priority:medium" "$(ref 'Advertising' 'Controller-side obligation.')"
mk "Confirm ad network allows this placement model in their policy" "type:chore,area:ads,priority:medium" "$(ref 'Advertising' '')"
mk "CCPA Do-Not-Sell-or-Share link for California visitors" "type:feature,area:ads,area:gdpr,priority:medium" "$(ref 'Advertising' 'Ads = "sharing" under CCPA.')"

# ── GDPR (data-processor obligations) ──
mk "Per-studio data export endpoint (JSON scoped to studioId)" "type:feature,area:gdpr,priority:high" "$(ref 'GDPR' '')"
mk "Full studio deletion flow (confirm UI + endpoint)" "type:feature,area:gdpr,priority:high" "$(ref 'GDPR' 'Cascade exists — needs confirm UI + endpoint.')"
mk "User account deletion (memberships cascade)" "type:feature,area:gdpr,priority:high" "$(ref 'GDPR' '')"
mk "Contact form → API → nodemailer Zoho SMTP (honeypot, category routing)" "type:feature,area:gdpr,area:email,priority:high" "$(ref 'GDPR' '[tattooista:category] routing.')"
mk "VAT capture + VIES validation at studio onboarding" "type:feature,area:gdpr,area:billing,priority:high" "$(ref 'GDPR' '')"
mk "DPA acceptance: onboarding checkbox + store timestamp + DPA version" "type:feature,area:gdpr,priority:high" "$(ref 'GDPR' '')"

# ── Launch prep ──
mk "DNS / SPF / DKIM / DMARC for tattooista.app" "type:chore,area:launch,priority:medium" "$(ref 'Launch prep' 'Or subdomain off existing Zoho mailbox.')"
mk "Add Tattooista signature in Zoho (no new aliases)" "type:chore,area:launch,priority:low" "$(ref 'Launch prep' '')"
mk "Point deployment at tattooista.app; update Termly site URL" "type:chore,area:launch,priority:medium" "$(ref 'Launch prep' 'Off the vercel.app domain.')"
mk "Google Ads advertiser verification" "type:chore,area:launch,priority:medium" "$(ref 'Launch prep' 'Pricing + refund + contact covered by Termly day.')"
mk "Full smoke test, two studios: signup → onboard → upgrade → use → cancel → delete" "type:chore,area:launch,priority:high" "$(ref 'Launch prep' '')"
mk "Error monitoring (Sentry or similar)" "type:chore,area:launch,priority:medium" "$(ref 'Launch prep' '')"
mk "Postgres backup strategy" "type:chore,area:launch,priority:medium" "$(ref 'Launch prep' '')"
mk "SEO: robots.txt, sitemap.xml, OG metadata for studio public pages" "type:feature,area:launch,priority:medium" "$(ref 'Launch prep' '')"

# ── FOP / tax ops ──
mk "PRRO digital receipts (Monobank built-in or Checkbox)" "type:chore,area:tax,priority:low" "$(ref 'FOP / tax ops' '')"
mk "Non-Union OSS — register once first EU customer pays" "type:chore,area:tax,priority:low" "$(ref 'FOP / tax ops' '')"
mk "Quarterly єдиний податок reports + monthly ЕСВ reminders" "type:chore,area:tax,priority:low" "$(ref 'FOP / tax ops' '')"

# ── Decide later ──
mk "2FA on Paddle, Zoho, Namecheap, Termly" "type:chore,priority:low" "$(ref 'Decide later' '')"
mk "GDPR Art.27 EU/UK representative (revisit at meaningful revenue)" "type:decision,area:gdpr,priority:low" "$(ref 'Decide later' '')"
mk "Ukraine FOP entity setup (parked)" "type:decision,priority:low" "$(ref 'Decide later' 'Parked at user request.')"

echo
echo "Done. Open issues: gh issue list --repo $REPO --limit 100"
echo "If they didn't land on the board, enable the project's auto-add workflow,"
echo "or re-run with: ADD_TO_BOARD=1 (after: gh auth refresh -s project)"
