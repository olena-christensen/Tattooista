# Tattooista — go-live task list

Decisions and standing rules: `legal-decisions.md`. Umbrella traps: `~/.claude/skills/task-doc/references/findings.md`.

## Blocking — before taking a real payment

- [ ] 💻 When saving a subscription status, refuse to replace a final status with an earlier one that arrives late.
- [ ] 💻 Add a daily check that asks Paddle about payments stuck in pending and feeds the answer through the same handler.
- [ ] 💻 When a checkout is abandoned, mark that payment closed so the daily check stops asking about it.
- [ ] 💻 Ask for the studio's value-added-tax number during onboarding and store it in Paddle as the business record's tax_identifier.
- [ ] 💻 Record every upload's file size in the database so a studio's storage total can be counted.
- [ ] 💻 Enforce the free-plan limits at creation time: the 51st client card, the 2nd staff seat, the upload passing 500 megabytes.
- [ ] 💻 Show usage counters for clients and gallery in the admin, so the limit never arrives as a surprise.
- [ ] 💻 Never limit incoming bookings and never lock existing data on any plan.
- [ ] 💻 Run the whole purchase flow against Paddle's test environment until it passes.
- [ ] 💻 Complete one real purchase on the live site with a real card, after the test-environment run passes.
- [ ] 📋 Check that Paddle sent the buyer an invoice for that real purchase.
- [ ] 📋 Confirm which currency Paddle pays out in and which account receives it.
- [ ] 📋 Ask the accountant whether money paid out by Paddle needs Ukrainian fiscal receipts.
- [ ] 📋 Check the legal name is spelled identically in every legal page of both Nothing Weird products.
- [ ] 📋 Read all four legal pages end to end for clauses that contradict each other or the product.
- [ ] 📋 Submit tattooista.app for Paddle website approval; only the old tattooista-next.vercel.app is approved.
- [ ] 📋 Cancel the Termly subscription.

## Blocking — before letting a stranger sign up

- [ ] 💻 Limit failed sign-in and registration attempts, counted both per account and per network address.
- [ ] 💻 Accept only real image files in the upload route and cap each file at 10 megabytes.
- [ ] 💻 Add an error page to the sign-in area and a root-level error page for the whole app.
- [ ] 💻 Add a health-check route that runs a real database query, so it fails when the database is down.
- [ ] 📋 Point an external uptime monitor at that route, at an interval slow enough not to keep the database permanently awake.
- [ ] 💻 Build the per-studio data export: one download of everything belonging to the studio.
- [ ] 💻 Build user account deletion, separate from studio deletion.
- [ ] 💻 Check that deleting an account also signs it out everywhere.
- [ ] 💻 Test whether a studio owner can invite staff by email end to end; build it if not.
- [ ] 💻 Verify the verification, password-reset and invitation mail templates all exist and send.
- [ ] 💻 Build the notice for changed terms: an email to all users, a notice in the app, a new last-updated date on the page.

## Blocking — before announcing

- [ ] 💻 Bring every screen up to what the original app had; track the individual bugs on the GitHub board.
- [ ] 💻 Check the gallery and wallpaper images are all back; re-upload any missing ones from Server/uploads.
- [ ] 💻 Add robots.txt, sitemap.xml, and the metadata that makes studio pages preview nicely when shared.
- [ ] 💻 Check the whole site on a 360-pixel-wide phone screen.
- [ ] 📋 Confirm every advertised feature exists or is marked coming soon.
- [ ] 📋 Set up the mail records that keep tattooista.app mail out of spam, or send from a subdomain of the existing Zoho mailbox.
- [ ] 💻 Wire error monitoring so production crashes reach you (Sentry or similar).
- [ ] 📋 Set up automated backups for the Postgres database.
- [ ] 📋 Run the smoke test with two real studios: sign up, onboard, upgrade, use, cancel, delete.
- [ ] 📣 Send the site to one real stranger and watch where they get stuck.

## Must-have once triggered

- [ ] 💻 Move mass email to a dedicated bulk-mail service before all Nothing Weird products together near Zoho's 50-messages-per-hour limit.
- [ ] 💻 Add the four job guards the day the first scheduled job ships: alert on failure, alert on crash, a hard time limit, process every page of work.
- [ ] 💻 Build a switcher for users who belong to more than one studio, the day the first such user exists.
- [ ] 📋 Complete Google Ads advertiser verification before the first paid campaign runs.
- [ ] 💻 Build the ad block on free studio sites and wire it to an ad network (Google or similar), the day ads go live.
- [ ] 📋 Read the ad network's prohibited and restricted lists before assuming tattoo content is eligible, before ads go live.
- [ ] 💻 Verify site ownership for the ad network with a text file, not an ad script.
- [ ] 💻 Hide ads from every PRO studio before the first ad renders; the terms promise PRO removes advertising.
- [ ] 💻 Make ad scripts obey the consent banner and load nothing before consent, the day ads go live.

## Growth — the day it ships

- [ ] 📣 Pick the single marketing channel you will actually work, and ignore the rest.
- [ ] 📣 Add share links for Instagram, Facebook, TikTok and Pinterest to studio public profiles.
- [ ] 📣 Measure how many people arrive, sign up, and pay — three numbers, not a dashboard.

## Interface fixes — when convenient

- [ ] 🎨 Align the buttons on the three pricing cards; they sit at uneven heights.

## Nice to have

- [ ] 💻 Wire Google sign-in; the privacy and terms pages already declare it.
- [ ] 📋 Pay a lawyer to read the terms, the privacy page and the data-transfer clause of the data-processing agreement.

## Done

- [x] 2026-08-09 📋 Decide the plan split: free is one owner seat, 50 client cards, 500 megabytes of images; PRO lifts all three.
- [x] 2026-08-09 📋 Decide against a free trial; the free tier replaces it.
- [x] 2026-08-09 💻 Confirm the shipped terms never contained the trial promise; nothing to remove.
- [x] 2026-08-09 💻 Strip the mail-order boilerplate from the terms' purchases section and refresh the date.
- [x] 2026-08-09 📋 Find where Paddle takes the tax number: typed at checkout, or sent as tax_identifier on the business record.
- [x] 2026-08-09 📋 Create the sandbox Pro product with monthly and yearly prices; identifiers stored in the environment file.
- [x] 2026-08-09 💻 Build the Paddle checkout: script loading plus monthly and yearly upgrade buttons in settings.
- [x] 2026-08-09 💻 Build in-account cancellation; the plan downgrades only when Paddle's notification confirms it.
- [x] 2026-08-09 💻 Build the notification handler: signature check, grant-only-on-confirmation, safe against duplicates.
- [x] 2026-08-09 💻 Drop the separate token endpoint; the public client token in the environment replaces it.
- [x] 2026-08-09 📋 Create the Paddle notification destination for subscription events; secret stored in the environment.
- [x] 2026-08-09 📋 Decide the PRO prices: 14 euro monthly, 140 euro yearly — two months free.
- [x] 2026-03-21 💻 Build email-and-password sign-in with sessions, verification and password reset.
- [x] 2026-03-21 💻 Send all transactional mail through one shared mailer (src/lib/email.ts).
- [x] 2026-03-22 💻 Build the multitenant base: studio scoping on every model, tenant helpers, roles.
- [x] 2026-03-24 💻 Add error pages for the public site and the studio admin area.
- [x] 2026-03-26 💻 Build full studio deletion with a confirm dialog and cascading data removal.
- [x] 2026-05-28 💻 Build the per-studio admin: bookings, clients, gallery, services, pages, users.
- [x] 2026-05-28 💻 Build each studio's public site: portfolio, contacts, reviews.
- [x] 2026-05-28 💻 Build the platform landing page with working studio creation.
- [x] 💻 Put the real domain live at tattooista.app.
- [x] 📋 Open the Paddle account and pass its identity verification.
- [x] 2026-06-07 💻 Ship the terms, privacy and cookie-policy pages, self-hosted at their routes.
- [x] 2026-06-07 💻 Wire Global Privacy Control end to end so it hard-blocks tracking consent.
- [x] 2026-06-07 💻 Ship the contact form with a spam trap, routed by alias over the Zoho mailbox.
- [x] 2026-06-08 💻 Ship the refund page, cleaned of shipping language, linked from pricing and terms.
- [x] 2026-06-08 📋 Strip every Termly reference; all legal pages are self-hosted in the repository.
- [x] 2026-06-08 💻 Put price tiles on the landing page and finalise the footer links.
- [x] 2026-06-12 💻 Ship the data-processing agreement: signable file, required checkbox, stored version.
