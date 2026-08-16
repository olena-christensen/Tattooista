# Reviews belong to studio customers, not platform users

## Status
IN PROGRESS — code complete, uncommitted, on branch `email-fix`. Schema **applied to the
Neon dev branch** on 2026-08-16 (`Review.userId` dropped, `clientId` added, 0 rows lost,
`migrate diff` reports no drift). **Production has NOT been migrated** — see
"Before this ships".

## Issue
https://github.com/olena-christensen/Tattooista/issues/389 (supersedes part of
https://github.com/olena-christensen/Tattooista/issues/387)

## Goal
Stop mixing two different objects. A studio's **customer** (`Client`) and a platform
**studio owner** (`User`) are separate things; sharing an email field does not make them
the same. Everything already respected that except `Review`, which pointed at `User` and so
dragged every reviewer onto the platform as a studio-less account.

## Scope
**In:** repointing `Review` at `Client`; a public review form gated on studio-held customer
contacts; moving review editing to the studio side; fixing the missing tenant scoping found
along the way.

**Out:** per-studio uniqueness for customers (still nothing stops a studio adding the same
person twice); any admin UI for moderating reviews; letting customers edit their own review.

## MERN source of truth
No original — this is a platform-model decision with no MERN counterpart. Owner's call,
2026-08-16: *"studio level they are not users at all they are customers, and platform level
studio owners they are users — two absolutely different objects."*

## Files
- `prisma/schema.prisma` — `Review.userId` → `clientId` (+ `@@index([clientId])`);
  `Client.reviews` added; `User.reviews` removed.
- `src/lib/validations/review.ts` — `email` added to `reviewSchema`.
- `src/lib/actions/reviews.ts` — rewritten (see below).
- `src/components/forms/review-form.tsx` — public form: takes `studioSlug`, collects email.
- `src/app/[slug]/(public)/reviews/page.tsx` — studio resolved from the slug, reviews scoped
  to it, sign-in gate replaced by the open form.
- `tests/lib/review-actions.test.ts` — new, 7 tests.

## How it works

**Who may review.** Customers have no login, so identity is proved by an address the studio
already holds: `createReview()` looks for a `Contact` with `type: "email"` whose `value`
matches (case-insensitively) **within that studio**. No match → refused. That is what makes
fabricated reviews impossible without inventing an account system for customers.

**Where the studio comes from.** The slug in the URL, not a session — a public reviewer has
none. `createReview(studioSlug, formData)` resolves it and 404s if unknown.

**Scoping.** The contact lookup filters on `studioId`, so being a customer of one studio
grants nothing at another.

## Multi-tenant notes

Two real isolation holes were found and closed while doing this — both pre-existing:

1. `[slug]/(public)/reviews/page.tsx` queried `review.findMany({ where: { isArchived: false } })`
   with **no `studioId`**. On a tenant-scoped route. Every studio's reviews page would have
   listed every other studio's reviews. Invisible only because the table was empty.
2. Every review mutation (`updateReview`, `archiveReview`, `restoreReview`, `deleteReview`,
   the gallery item actions) looked the row up by **id alone** and then wrote to it. A review
   id belonging to another studio could be archived or deleted by any studio owner. They now
   share a `requireOwnedReview()` helper that resolves the session studio, checks the role,
   and confirms `review.studioId` matches before returning.

## Decisions & trade-offs

- **Repoint rather than keep both.** A nullable `userId` alongside `clientId` would have kept
  the mixing alive. The table had **zero rows**, so the clean change cost no migration — and
  would only have got more expensive later.
- **Match on `Contact`, not a new `Client.email` column.** Email already lives in
  `Contact(type, value)`; the data uses `type: "email"` (7 rows), `phone` (9), `instagram` (1).
  Adding a second home for the same fact invites drift.
- **Reviews are visible immediately** (`isArchived` defaults false). The reviewer is by
  definition someone the studio has recorded, so pre-moderation seemed like friction for no
  gain. `archiveReview()` remains for taking one down.
- **Editing removed from `ReviewForm`.** Reviewers have no session, so they cannot edit;
  the edit branch had no caller (no admin reviews page exists). `updateReview()` is kept,
  studio-scoped, for when that UI is built.
- **A client may leave more than one review.** Nothing prevents it. Not obviously wrong, not
  obviously right — flagged rather than decided.

## Verification

- `npm test` → **8 files, 55 tests passed** (was 7/48). 7 new tests pin the gate: accepted
  for a known customer, refused for an unknown email, lookup scoped by `studioId` +
  `type: "email"`, unknown studio slug refused, invalid email and out-of-range rating
  rejected before any DB call, and a `P1001` returning `{ error }` rather than throwing.
- `npx tsc --noEmit` clean; `npm run lint` clean on all touched files (the 5 remaining
  `no-explicit-any` errors are pre-existing in `src/lib/tenant-prisma.ts`).
- **Not run in a browser.** The submit path, the "we couldn't find that email" rejection, and
  the rendering of a review against a client avatar are all unproven end-to-end.

## Before this ships

**Dev branch: done.** `npx prisma db push` run 2026-08-16 with the owner's go-ahead.
Verified after: `Review` columns are `clientId, content, createdAt, id, isArchived, rate,
studioId, updatedAt` — no `userId` — and 0 rows, so nothing was lost.

**Production: not done, and it drops a column.** Before deploying:

```bash
cd tattooista-next
npx vercel env pull .env.production.local
# 1. CONFIRM the production Review table is empty FIRST:
#      select count(*) from "Review";
# 2. Only if it is 0:
DATABASE_URL=$(grep DATABASE_URL .env.production.local | head -1 | cut -d'"' -f2) npx prisma db push
```

If production has reviews, this destroys them — they are attached to `User` rows and there
is no automatic way to map those to `Client` rows. That case needs a real migration plan,
not `db push`.

## TODO / follow-ups
- Apply the schema change (above), then click through the flow.
- Confirm production's `Review` table is empty before deploying.
- #387 needs rewriting: customer signup is no longer "missing", it is deliberately absent.
- No admin UI for reviews — `archiveReview`/`restoreReview`/`deleteReview` have no screen.
- Per-studio customer uniqueness still doesn't exist; a studio can hold the same person twice,
  and both records could review.
