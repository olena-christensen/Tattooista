# SaaS transformation plan — superseded

The live task list is `tattooista-next/docs/go-live.md`.
Decisions and standing rules: `tattooista-next/docs/legal-decisions.md`.
Everything still open from this plan was folded into the task list on 9 August 2026.

## Local development setup

- `.env` has local Docker Postgres: `postgresql://postgres:postgres@localhost:5432/tattooista`
- `.env.local.bak` has the Neon remote database (renamed to avoid overriding the local one)
- To run locally: `docker start tattooista-postgres && cd tattooista-next && npm run dev`
- Demo studio: visit `http://localhost:3000?studio=demo`
- Login: `admin@tattooista.com` / `admin123`

## Original app reference data

- Seed data lives in `Client/src/data/` (FaqData.js, ServicesData.js, PagesData.js, GalleryData.js)
- Image files live in `Server/uploads/` (gallery, serviceWallpapers, pageWallpapers, styleWallpapers)
