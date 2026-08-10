# Tattooista

Multi-studio platform for tattoo studios. Each studio gets its own public site — portfolio, booking, reviews — and an admin area for managing bookings, clients, gallery, services and staff, on a subscription.

## Repository layout

- `tattooista-next/` — the live application (Next.js, Prisma, Postgres). All current work happens here.
- `Client/` and `Server/` — the original single-studio app (React, Express, MongoDB). Kept only as the reference for migration; not developed further.
- `tattooista-next/docs/go-live.md` — the task list. Single source of truth for what is done and what comes next.
- `tattooista-next/docs/legal-decisions.md` — settled decisions and standing rules behind the legal pages and billing setup.

## Local development

- `.env` has local Docker Postgres: `postgresql://postgres:postgres@localhost:5432/tattooista`
- `.env.local.bak` has the Neon remote database (renamed to avoid overriding the local one)
- Run locally: `docker start tattooista-postgres && cd tattooista-next && npm run dev`
- Demo studio: visit `http://localhost:3000?studio=demo`
- Login: `admin@tattooista.com` / `admin123`

## Original app reference data

Used when migrating screens — copy content exactly, never invent it.

- Seed data: `Client/src/data/` (FaqData.js, ServicesData.js, PagesData.js, GalleryData.js)
- Image files: `Server/uploads/` (gallery, serviceWallpapers, pageWallpapers, styleWallpapers)
- Database exports: `tattooista-next/scripts/data/` (MongoDB exports such as tattoostyles.json)

## Running the original app (reference only)

Backend from `Server/`: `npm run devStart`. Frontend from `Client/`: `npm run start`.
