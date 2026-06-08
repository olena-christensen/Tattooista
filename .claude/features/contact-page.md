# Platform Contact page

## Status
BUILT (uncommitted, branch `privacy-policy`) as of 2026-06-07. No GitHub issue; slug `contact-page`.

## Goal
A platform-level `/contact` page (distinct from the per-studio one) with a real, working contact form that emails the right alias per category. Created to resolve the dead `/contact` links the privacy page pointed at.

## Scope
- **In:** `/contact` page (privacy-page shell), client form (react-hook-form + zod + sonner), honeypot, `POST /api/contact`, independent Zoho SMTP mailer, category→recipient routing, proxy exemption, link wiring from privacy + footer.
- **Out:** the per-studio contact page (`src/app/[slug]/(public)/contacts/page.tsx`) is a separate stub (`return null`) — untouched. The legacy `lib/email.ts` transactional stack — untouched.

## Files
- `src/app/(public)/contact/page.tsx` — **NEW.** Server Component, `metadata.title = "Contact"`. Privacy-page shell (`PlatformHeader` + `Container max-w-[860px]` + `PlatformFooter`), renders `<ContactForm />` in a `max-w-[560px]` column.
- `src/components/forms/contact-form.tsx` — **NEW.** `"use client"`. Mirrors `booking-form.tsx`: `useForm` + `zodResolver(contactSchema)`, shadcn `Form*` primitives, `Input`/`Textarea`/`Select`/`Button`/`LoadingSpinner`, `toast` from sonner. Fields: name, email, category (Select), message, + off-screen honeypot `company`. Submits JSON to `/api/contact`, toasts success/error, `form.reset()`.
- `src/lib/validations/contact.ts` — **NEW.** `contactSchema` (zod) + `ContactInput`/`ContactCategory` + `CONTACT_CATEGORIES` (client select options). Honeypot `company` is optional.
- `src/lib/contact-email.ts` — **NEW.** Independent nodemailer transporter via `getContactTransporter()` reading `CONTACT_SMTP_HOST/PORT/USER/PASS` (`secure: port === 465`). `sendContactEmail()`: `from: Tattooista <CONTACT_SMTP_USER>`, `to:` category alias, `replyTo:` visitor, subject `[tattooista:<category>] message from <name>`, HTML-escaped body. **Deliberately separate from `lib/email.ts`** so platform contact mail never touches the inherited studio transactional mail.
- `src/app/api/contact/route.ts` — **NEW.** `POST`: `request.json()` → `contactSchema.safeParse` (400 on fail) → **honeypot filled ⇒ 200 with no send** → `sendContactEmail` → 200, or 502 on send failure. Matches `NextRequest`/`NextResponse` convention (`api/gallery`, `api/upload`).
- `src/proxy.ts` — **EDIT.** Added `nextUrl.pathname.startsWith("/api/contact")` to `isPlatformPublicRoute`. Without it the proxy 307-redirects all non-`/api/auth` API routes to `/login`. (The `/contact` *page* itself passes via the existing "first path segment treated as studio slug" behavior, same as `/privacy` etc.)
- `src/app/(public)/privacy/page.tsx` — **EDIT.** The 3 `CONTACT_URL` DSAR/"exercise your rights" links changed from hardcoded `https://tattooista.app/contact` external `<a>` to internal `<Link href="/contact">` (display text still the canonical URL).
- `src/components/shared/platform-footer.tsx` — **EDIT.** Footer "Contact" `<a href="#">` → `<Link href="/contact">`.

## Category → recipient routing (`contact-email.ts`)
Mirrors the addresses published in the legal pages (all confirmed real Zoho mailboxes):
- `general` (General / Support) → **support@nothingweird.agency**
- `billing` (Billing / Refund) → **billing@nothingweird.agency** (matches /refund)
- `dsar` (Data / Privacy) → **privacy@nothingweird.agency** (matches /privacy)
- `legal` (Legal / IP) → **legal@nothingweird.agency** (matches /terms)
Category is also preserved in the subject tag (`[tattooista:<category>]`).

## Env vars (reuses shared `ZOHO_SMTP_*` — independent from legacy `SMTP_*`)
Only two secrets needed; host/port default to Zoho in code (`smtppro.zoho.eu` / `465`, override via `ZOHO_SMTP_HOST`/`ZOHO_SMTP_PORT` if ever needed):
- `ZOHO_SMTP_USER=<a real Zoho mailbox, e.g. support@nothingweird.agency>`
- `ZOHO_SMTP_PASS=<that mailbox's Zoho app password>`
`from` is derived from `ZOHO_SMTP_USER` (Zoho only sends as an owned address). No separate FROM var.
Vercel already has `ZOHO_SMTP_USER`/`ZOHO_SMTP_PASS`; local `.env` uses the same two (renamed from the original `CONTACT_SMTP_*` to avoid breeding parallel vars).

## Multi-tenant notes
Platform-level, **not** tenant-scoped. No `studioId`, no DB. The legacy `lib/email.ts` (verification/reset/booking, still on the inherited Gmail `SMTP_*`) is intentionally left alone.

## Verification
- `tsc --noEmit` + `eslint` — clean (only the pre-existing `placeholder.test.ts` vitest-globals errors remain).
- Live (dev server, `CONTACT_SMTP_*` NOT set locally): `GET /contact` → 200; `POST /api/contact` empty → 400; honeypot filled → 200 (no send); valid → 502 with graceful error (tries to send, fails only because env unset). Privacy renders `href="/contact"`; footer Contact wired.

## TODO / follow-ups
- Set the 4 `CONTACT_SMTP_*` env vars in Vercel; then valid submissions send (200) and arrive at hello@/support@.
- Legacy cleanup (separate): `lib/email.ts` `FROM_EMAIL`/`ADMIN_EMAIL` point at non-existent `*@tattooista.com`; SMTP_* still on personal Gmail.
- `privacy@`/`legal@`/`billing@` confirmed real (2026-06-07) and now wired into the contact form routing. (`founder@` from cookie-policy still unverified.)
- Per-studio `[slug]/(public)/contacts/page.tsx` is an empty stub.
