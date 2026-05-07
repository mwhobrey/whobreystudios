# Whobrey Studios

Graphic design **client portal** and **admin** workflow (quotes, revisions, files, payments, shop — see `DESIGN.md`). Product intent capture: `overview.md`. Client choices in progress: `decisions.md`.

## Repo layout

| Path | Purpose |
|------|---------|
| `web/` | Next.js (App Router) app: UI + API routes |
| `docker-compose.yml` | Local PostgreSQL |
| `DESIGN.md` | Technical design + requirement traceability |
| `decisions.md` | Checklist for the client |

## Prerequisites

- Node 20+
- Docker Desktop (or compatible) for local Postgres

### Prisma: “Unknown field `quotes` on model `Project`”

The ORM client is generated into `web/src/generated/prisma` (gitignored). If you pull schema changes but don’t regenerate, you’ll get runtime validation errors. **`npm run dev` and `npm run build` run `prisma generate` first** (`predev` / `prebuild`). If you still see this, from `web/` run:

```powershell
npx prisma generate
```

Then restart the dev server.

## Local development

**From the repo root** (one command after prerequisites):

```powershell
npm run dev
```

That starts Docker Postgres, ensures `web/.env` (copies from `.env.example`, fills `AUTH_SECRET` if still the placeholder), runs migrations + seed, then the Next.js dev server. First time you’ll need `npm install` inside `web/` (the script does it when `web/node_modules` is missing); after pulling dependency changes, run `npm install` in `web/` once.

Manual breakdown (only if you prefer): `docker compose up -d`, copy `web/.env.example` → `web/.env`, then from `web/` run `npm install`, `npm run db:migrate`, `npm run db:seed`, `npm run dev`. Dev uses **Webpack** by default (`next dev --webpack`) because **Turbopack + Prisma 7** can throw bogus `@prisma/client-…` module errors. `transpilePackages` in `web/next.config.ts` also helps if you run **`npm run dev:turbo`** from `web/`.

**Prerequisites:** Node 20+, Docker for Postgres. If `localhost` fails to resolve, use `127.0.0.1` in `DATABASE_URL` in `web/.env`.

Open [http://localhost:3000](http://localhost:3000). Sign in at `/login` with seeded users (defaults):

   - **Admin:** `admin@whobrey.local` / `dev-admin-password` → `/admin`
   - **Client:** `client@whobrey.local` / `dev-client-password` → `/portal`

   API (session cookie from logged-in user):

   - `GET /api/projects` — **admin only**; optional `?page=1&limit=50` (max 100).
   - `POST /api/projects` — **client only**; sets `clientUserId` to the signed-in user.
   - `GET /api/projects/:id` — **admin** (any id) or **client** (own projects only).

### Auth (swap-friendly)

- **Auth.js** lives in `web/src/auth.ts` (route: `/api/auth/*`).
- **Application code** should import **`@/lib/auth`** (`getAppUser`, `requireAppUser`, `requireRole`) and the `AppUser` type — not `auth()` / `signIn` from Auth.js directly — so replacing Auth.js with Clerk or another host later is mostly a rewrite of `auth.ts` + `lib/auth/session.ts`, not every page.

## Git

`create-next-app` added a `.git` folder inside `web/`. For a **single repo at the workspace root**, remove nested git and init at root:

```powershell
Remove-Item -Recurse -Force web\.git
git init
```

## Next build steps (do not require client decisions)

- **Done (UI slice):** `/portal` (list + new request), `/portal/projects/new`, `/portal/projects/[id]`; `/admin/projects` + `/admin/projects/[id]`; shared logic in `web/src/lib/data/projects.ts` (API routes call the same helpers).
- **Done (quotes MVP):** `Quote` + `QuoteLineItem` models; admin **Start quote** → draft line editor → **Save draft** / **Send quote** (project → `quote_sent`); client **Approve** / **Decline** on `/portal/projects/[id]` (project → `approved` / `declined`); revised quote after decline. Logic in `web/src/lib/data/quotes.ts`.
- **Next:** In-app messages on a project, file uploads + S3, payment webhooks / deposit.
- Harden auth: rate limit login, production secrets, optional MFA for admin (`decisions.md`).

## Tranche verification

From `web/`, run:

```powershell
npm run verify:tranche
```

This runs lint + build, then prints the hardening tranche manual regression checklist used before release.

## UI polish verification

From `web/`, run:

```powershell
npm run verify:ui-polish
```

Use this checklist together with lint/build to validate the demo-critical UI/UX polish surfaces.

## Deployment runbook

For a full production-like demo deployment (Vercel + Neon + Cloudflare R2 + custom DNS), use:

- `docs/demo-deployment-runbook.md`
