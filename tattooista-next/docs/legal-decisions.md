# Tattooista — decisions and standing rules

Settled decisions moved out of the task list so the list stays one line per item.
Source: nothing-weird-transfer-notes.md (sections 3, 4, 5) plus locked working-session calls.

## Plan split (decided 9 August 2026)

- **Free tier:** one seat (the owner), up to 50 client cards, up to 500 megabytes of image storage.
  Storage is measured in megabytes, not image count, because image sizes vary wildly and the
  platform pays for storage by the megabyte. Every upload is capped at 10 megabytes per file
  and must be a real image, on every plan.
  Full customization of the studio site — hero, logo, pages, services, styles, questions —
  is free on every plan, always. Every free studio site is an advertisement for the platform;
  capacity is what costs money, looks never do.
- **PRO tier:** unlimited client cards, unlimited gallery, up to 5 staff seats.
  A custom domain per studio joins PRO if and when that feature is ever built.
- **No free trial.** The free tier replaces it. The shipped terms never contained the trial promise.
- **Ads are planned on the free tier.** PRO removes them — the terms already say so. Until ads
  actually ship, free is limited only by capacity.
- **PRO costs 14 euro per month, or 140 euro per year** — the yearly price gives two months free.
- **Limits bite only when adding something new** — the 51st client card, the 2nd seat, the
  101st image. Incoming booking requests are never limited on any plan, because a bounced
  booking hurts the studio's customer and the studio blames the platform. Existing data is
  never locked or deleted when a limit is reached or a subscription lapses.

## Legal-document standing rules

1. Default **yes** to any capability the platform will plausibly build; **no** only for genuinely
   harmful or irrelevant items (for example child-abuse material or physical-goods shipping).
   Keep the privacy, terms, cookie and data-processing answers consistent with each other.
2. **Business-to-business, not consumer.** The documents form a subscription service agreement.
   The "user" is the studio (internal business use), not the studio's walk-in clients.
3. Tattooista is a data **processor**; studios are the controllers of their clients' data.
   A data-processing agreement is required as a separate signable document.
4. Payment is the subscription fee charged to studios, and nothing else. Tattooista is not a
   payment facilitator or marketplace for the studios' own client payments.
5. **Paddle is the merchant of record** — it is the seller on the invoice and handles European
   value-added tax. Studio value-added-tax numbers are still collected for business sales.
6. Hosting disclosure: application layer in the **United States** (Vercel); database in the
   **European Union, Germany** (Neon). File storage: Vercel Blob, United States East.
7. Base currency is the **euro**.
8. All tarot-era items are dropped: no adults-only age gate, no entertainment-only disclaimers,
   no divination category restrictions.
9. A completed legal screen is final — settled answers are not reopened. If the real decision
   was not ready, the safe placeholder was taken and the real decision became a task in the list.

## Decisions with a reason worth keeping

- **Refund page is deliberately not in the footer.** It is linked from pricing, checkout and the
  terms instead. The footer is final: privacy, terms, cookie policy, cookie preferences, contact.
- **Legal-name spelling.** One transliteration of the legal name ("Olena Christensen, Individual
  Entrepreneur") is the source of truth across all documents in both Nothing Weird products;
  no official English version exists. The audit is an open task in the list.
- **Transfer clause.** The data-transfer wording in clause 6 of the data-processing agreement
  gets a lawyer's read before scaling; optional before launch. Open task in the list.
- **Signed agreement mechanics.** Acceptance checkbox is required at studio creation; the server
  stores the acceptance date and version; the file lives at public/legal/Tattooista-DPA-v1.0.pdf.
- **People getting tattoos are records, not accounts.** They book anonymously through the public
  form and exist as client cards the studio keeps. Only leaving a review requires a lightweight
  user account, and that account is deliberately not linked to the studio's client card.

## Umbrella facts that this product relies on

Everything umbrella-level is already solved and stays out of the task list: the legal entity,
the shared mailbox and aliases on the nothingweird.agency domain, the hosting account, and the
legal-page texts to copy from. Details: `~/.claude/skills/new-product/references/umbrella-assets.md`.

Tattooista's payments run through Paddle, not through the umbrella's bank acquiring, so the
bank-terminal and fiscal-receipt chain from the other product is not part of this payment path.
Whether Paddle payouts themselves need fiscal receipts is an open task for the accountant.

## Architecture

Multitenant design and layer-0 implementation are specified in
`docs/superpowers/specs/2026-03-22-multi-tenant-architecture-design.md` and
`docs/superpowers/plans/2026-03-22-multi-tenant-layer-0.md`.
