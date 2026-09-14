# Current State

What works today, what doesn't, and what to build next. **This file should change most often** as the project evolves.

**See also:** [00_INDEX.md](./00_INDEX.md) · [DESIGN.md](../../DESIGN.md) · [docs/linear-workspace.md](../linear-workspace.md)

_Last reviewed: 2026-09-14_

---

## Phase summary

| Phase | Linear epic | Status |
|-------|-------------|--------|
| Phase 0 — As-built portal | WHO-5 | **Shipped** (core MVP) |
| P1 — Stripe payments | WHO-6 | **Shipped** (needs Stripe env + webhook in each environment) |
| P1 — Auth & email | WHO-7 | **Shipped** (magic link when Resend configured) |
| P1 — Ship polish | WHO-9 | **Mostly shipped** (PWA, brand, legal, rate limits) |
| Ops — Client inputs | WHO-8 | **Ongoing** (legal import pipeline exists) |
| Phase 2 — Shop | WHO-10 | **Deferred** (external `shopUrl` only) |
| Phase 3 — SMS/Push | WHO-11 | **Deferred** (in-app bell + email today) |

---

## What is currently working

### Auth & access

- [x] Role-based access: `admin` vs `client`
- [x] Admin credentials login at `/login/studio`
- [x] Client login: password (seed/dev) + magic link when `RESEND_API_KEY` set
- [x] Optional GitHub OAuth (`AUTH_GITHUB_*`)
- [x] Auth façade at `@/lib/auth` for swap-friendly architecture
- [x] Layout-level route protection (`requireRole`)
- [x] Login rate limiting (`AuthRateLimit` model)
- [x] Guest project linking on client sign-in by email

### Project intake

- [x] Public two-step intake: `/projects/new` (service picker) → `/projects/new/details` (guest or signed-in client)
- [x] Legacy redirects: `/request`, `/portal/projects/new` → `/projects/new`
- [x] Signed-in clients can attach files on intake step 2
- [x] Admin-managed **service types** (`/admin/settings/service-types`)
- [x] Optional file attachments on intake
- [x] Logo design questionnaire (Services → "Logo & Brand Systems" → Get started) replaces the free-text notes field on the `digital` intake with structured Qs; answers are compiled into `Project.notes` — no dedicated DB fields
- [x] Project list + detail for admin and client

### Quotes

- [x] Admin quote builder (draft line items, save, send)
- [x] Quote versioning per project
- [x] Client approve / decline on portal project page
- [x] Admin resolve declined quote (revise / close paths)
- [x] Per-quote overrides: included revisions, deposit percent
- [x] Quote addon line items after approval

### Payments (Stripe)

- [x] `PaymentAdapter` with Stripe implementation
- [x] Deposit + final checkout sessions
- [x] Webhook handler with idempotency (`stripeEventId`)
- [x] Payment state UI on client project page
- [x] Final file download gated on paid final payment (configurable via workspace settings)
- [x] `NoopPaymentAdapter` when Stripe not configured (local dev without keys)

### Files & revisions

- [x] Draft + final file uploads
- [x] Local storage (dev) and R2 (production)
- [x] Authorized download routes with payment gates for finals
- [x] Admin promote draft → final
- [x] Revision counting vs included limit (workspace default + per-quote override)
- [x] 50 MB upload cap (configurable via `MAX_UPLOAD_BYTES`)

### Collaboration

- [x] Threaded in-app messages per project
- [x] In-app notification bell + unread counts
- [x] Notification types: project created, quote events, messages, files, status changes

### Email

- [x] Resend integration for magic links and transactional email
- [x] Email outbox queue + cron worker endpoint
- [x] Template rendering for notification events
- [x] Best-effort fan-out (primary transaction not blocked by email failure)

### Admin settings & content

- [x] Workspace policies: revision default, deposit %, legal URLs, shop URL
- [x] On-site legal pages from markdown (`/legal/[slug]`)
- [x] DOCX → markdown import script for legal docs
- [x] Brand asset sync script
- [x] Marketing landing page (`/`) with Option A nav cards (My Project, New Project, Shop)
- [x] Public FAQ page (`/faq`) — workflow help migrated from former landing capability strip
- [x] Vercel Web Analytics + Speed Insights (`@vercel/analytics`, `@vercel/speed-insights`) with intake funnel custom events

### API

- [x] REST endpoints for projects, files, notifications, checkout
- [x] Stripe webhook + email cron endpoints

### DevOps & tooling

- [x] One-command local dev (`npm run dev` from root)
- [x] Docker Postgres via `docker-compose.yml`
- [x] Prisma migrations + seed
- [x] Verification scripts (`verify:tranche`, `verify:ui-polish`, etc.)
- [x] Demo deployment runbook (Vercel + Neon + R2)
- [x] Demo deployed at `https://demo.whobreystudios.llc` (see deployment runbook)

---

## What is incomplete, degraded, or environment-dependent

These are **not necessarily bugs** — often missing config or deliberate deferrals.

| Area | State | Notes |
|------|-------|-------|
| **Magic link login** | Requires Resend | Without `RESEND_API_KEY`, use seeded password locally |
| **Transactional email delivery** | Requires Resend + cron | Outbox fills; worker needs `CRON_SECRET` + Vercel cron in prod |
| **Payments** | Requires Stripe env + webhook | Without keys, `NoopPaymentAdapter` — no real checkout |
| **File storage (prod)** | Requires R2 config | Local dev uses disk; Vercel needs `STORAGE_PROVIDER=r2` |
| **SMS / text notifications** | Not built | Client wants SMS/push (decisions F1) — WHO-11 |
| **Native push (FCM/APNs)** | Not built | In-app bell only |
| **Google OAuth for clients** | Not built | Magic link first; Google later per decisions B1 |
| **Admin MFA** | Not built | Password only; revisit per decisions B2 |
| **In-app shop / cart** | Not built | External shop link via `shopUrl` — WHO-10 |
| **Rich status progression** | Partial | DB enum is simpler than DESIGN.md §4.2 / prototype |
| **Admin analytics dashboard** | Basic | KPI cards exist; full dashboard from prototype not implemented |
| **Real-time / live chat** | Not built | Async threaded messages only |
| **Automated test suite** | Minimal | Verification scripts + manual regression, not Jest/Playwright CI |
| **Virus scanning on uploads** | Deferred | Per DESIGN.md |
| **Structured revision feedback** | Not built | Free-text messages only; checklist TBD with client |
| **Quote decline copy polish** | Functional | UX copy refinement optional per DESIGN.md §8 |
| **Root README "Next steps"** | Stale | Still lists messages/files/payments as future — ignore; see this file |

---

## Known gotchas (active)

See [03_RULES_AND_STANDARDS.md § Gotchas](./03_RULES_AND_STANDARDS.md#gotchas--technical-debt) for full list.

Quick hits:

- Prisma client gitignored — run `prisma generate` after schema pulls
- Use Webpack dev (`npm run dev`), not Turbopack, with Prisma 7
- `AUTH_URL` must match deployed URL
- Don't copy patterns from `whobrey-studios-app/`

---

## Immediate next steps (recommended priority)

Ordered by impact and documented Linear backlog. Adjust with Mike if priorities shift.

### 1. Documentation hygiene (low effort)

- [ ] Update root `README.md` § "Next build steps" to reflect shipped features
- [ ] Keep **`04_CURRENT_STATE.md`** updated when closing Linear issues

### 2. WHO-11 — SMS / push notifications (client-requested)

- [ ] Choose SMS/push provider(s)
- [ ] Extend notification fan-out beyond email + in-app bell
- [ ] Admin escalation rules (what is immediate vs digest)

### 3. Auth hardening (incremental)

- [ ] Admin MFA (when prioritized)
- [ ] Google OAuth for clients (when prioritized)
- [ ] Production secrets audit on Vercel

### 4. UX polish from prototype (non-blocking)

- [ ] Richer client "next step" copy by project status
- [ ] Admin dashboard KPIs (awaiting deposit, urgent, outstanding)
- [ ] Expand status enum if client signs off on full progression (requires migration)

### 5. Phase 2 — Shop (deferred)

- [ ] Confirm external shop URL strategy (`shopUrl` already in settings)
- [ ] WHO-10 epic when reprioritized

### 6. Testing investment (when bandwidth allows)

- [ ] Playwright or similar E2E for critical path (intake → quote → pay)
- [ ] CI gate beyond Vercel build

---

## Open client / product questions

From `DESIGN.md` §8 (still relevant):

1. **Notification vendors** — SMS/push providers and escalation (WHO-11)
2. **Google login timing** — MVP+1 or later
3. **URL strategy** — single domain (`/admin`, `/portal`) vs subdomains (currently single domain)
4. **Legal copy updates** — regenerate from DOCX when client sends revisions
5. **Shop integration timing** — external site vs in-app (deferred)

Source of truth for client choices: **`decisions_complete.md`**.

---

## Verification before demo or release

From `web/`:

```powershell
npm run verify:tranche
```

Then manually confirm:

1. Admin login → project list → quote send
2. Client login → approve quote → checkout (if Stripe configured)
3. File upload + download authorization
4. Notification bell updates
5. Email received (if Resend + cron live)

---

## How to update this document

When you **ship**, **break**, or **defer** a feature:

1. Move items between **Working** and **Incomplete** sections
2. Update **Immediate next steps** — remove done items, add new ones
3. Bump **Last reviewed** date
4. Reference Linear issue IDs where applicable
