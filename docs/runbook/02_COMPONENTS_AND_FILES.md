# Components & Files

Where everything lives, what each layer owns, and how to find routing, config, and state.

**See also:** [01_ARCHITECTURE.md](./01_ARCHITECTURE.md) · [03_RULES_AND_STANDARDS.md](./03_RULES_AND_STANDARDS.md)

---

## Repository directory map

```
whobrey-studios/                         # Git root
├── package.json                         # Root scripts: dev, build, lint, start
├── scripts/dev.mjs                      # Local bootstrap: Docker → migrate → seed → next dev
├── docker-compose.yml                   # Postgres 16 for local dev
├── README.md                            # Quick start
├── DESIGN.md                            # Technical design + requirement traceability
├── overview.md                          # Original product intent (guide)
├── decisions.md                         # Client checklist (may lag)
├── decisions_complete.md                # Client answers (source of truth)
├── docs/
│   ├── runbook/                         # ★ This runbook series (00–04)
│   ├── demo-deployment-runbook.md
│   ├── linear-workspace.md
│   └── who-*-implementation-plan.md
├── web/                                 # ★ Production application
│   ├── package.json                     # App deps & npm scripts
│   ├── next.config.ts                   # Next.js config (Prisma transpile, pg external)
│   ├── tsconfig.json                    # Path alias `@/*` → `src/*`
│   ├── eslint.config.mjs
│   ├── postcss.config.mjs
│   ├── vercel.json                      # Vercel project config
│   ├── .env.example                     # Canonical env var list
│   ├── prisma/
│   │   ├── schema.prisma                # Domain models & enums
│   │   ├── migrations/                  # SQL migration history
│   │   └── seed.ts                      # Dev/demo users & sample data
│   ├── scripts/                         # Verify, legal import, prod DB helpers
│   ├── content/legal/                   # Markdown legal pages (+ DOCX sources)
│   ├── public/brand/                    # Logos, icons, favicons
│   └── src/
│       ├── auth.ts                      # Auth.js config (provider swap point)
│       ├── app/                         # Routes, layouts, API, server actions
│       ├── components/                  # Shared UI components
│       ├── lib/                         # Business logic, adapters, data layer
│       └── generated/prisma/            # Generated ORM client (gitignored)
└── whobrey-studios-app/                 # Reference prototype — DO NOT SHIP
    └── whobrey-studios-app/
```

---

## Core modules & strict responsibilities

### `web/src/app/` — routing & entry points

| Area | Responsibility | Must NOT |
|------|----------------|----------|
| `app/**/page.tsx` | RSC pages, data fetching for UI | Contain raw Prisma queries or auth provider imports |
| `app/**/layout.tsx` | Shared chrome, role gates (`requireRole`) | Business logic beyond auth/layout |
| `app/**/actions.ts`, `*-actions.ts` | Thin server actions: Zod → auth → `lib/data` | Duplicate domain rules already in data layer |
| `app/api/**/route.ts` | REST JSON endpoints | Skip `requireApiRoles` / data-layer authz |

### `web/src/lib/data/` — business logic & persistence

**This is the source of truth for domain behavior.** All Prisma access for features should go here.

| Module | Owns |
|--------|------|
| `projects.ts` | CRUD, pagination, access control, **status transitions**, guest linking |
| `quotes.ts` | Draft/create, line items, send, approve, decline, addons, revisions override |
| `messages.ts` | List thread, insert messages |
| `file-assets.ts` | Upload orchestration, list, download authz, promote to final |
| `payments.ts` | Payment record CRUD, webhook state updates |
| `project-payment-state.ts` | Aggregated payment state for UI panels |
| `notifications.ts` | Create, list, mark read, audience resolution |
| `revisions.ts` | Count delivered drafts vs included revision limit |
| `service-types.ts` | Active types for forms, admin list |
| `workspace-settings.ts` | Singleton policy row (deposit %, legal URLs, shop URL) |

Intake UX config (static categories, not DB): `lib/project-intake/categories.ts`.

### `web/src/lib/` — adapters & shared utilities

| Path | Owns |
|------|------|
| `lib/auth/` | Session façade: `getAppUser`, `requireRole`, `requireApiRoles` |
| `lib/schemas/` | Zod parsers: project, quote, message, service-type, file-upload |
| `lib/payments/` | Stripe adapter, checkout, webhook handler, amount math |
| `lib/storage/project-files.ts` | Local vs R2 read/write |
| `lib/email/` | Resend, outbox queue, templates, notification fan-out |
| `lib/legal/documents.ts` | Load markdown legal content |
| `lib/brand/assets.ts` | Brand asset path helpers |
| `lib/prisma.ts` | Singleton Prisma client |
| `lib/actions/project-messages.ts` | Server action wrapper for messages |

### `web/src/components/` — presentation

| Path | Owns |
|------|------|
| `components/ui/*` | Design system: buttons, cards, badges, shells, skeletons |
| `components/project-*.tsx` | Project-scoped UI: files, messages, summary, nav |
| `components/notification-bell.tsx` | In-app notification dropdown |
| `components/brand/wordmark.tsx` | Brand mark |
| `components/marketing/*` | Public landing header, intake shell, nav cards |
| `components/project-intake/*` | Service picker, unified intake details form |
| `components/analytics/*` | Vercel Web Analytics + Speed Insights; intake funnel trackers |
| `lib/analytics/track-client-event.ts` | Typed custom event helper (no PII) |

### `web/src/auth.ts` — auth provider config only

Auth.js providers, callbacks, adapter wiring. **Feature code must not import from here** — use `@/lib/auth`.

---

## Page routes

| Path | Auth | Key files |
|------|------|-----------|
| `/` | Public | `app/page.tsx`, `components/marketing/*` |
| `/faq` | Public | `app/faq/page.tsx` |
| `/projects/new` | Public | `app/projects/new/page.tsx`, `components/project-intake/service-type-picker.tsx` |
| `/projects/new/details` | Public | `app/projects/new/details/page.tsx`, `components/project-intake/intake-details-form.tsx` |
| `/request` | Public | Redirect → `/projects/new` (`app/request/page.tsx`, `actions.ts`) |
| `/login` | Public | `app/login/page.tsx`, `actions.ts`, `ui.tsx` |
| `/login/studio` | Public | `app/login/studio/page.tsx`, `actions.ts`, `ui.tsx` |
| `/login/check-email` | Public | `app/login/check-email/page.tsx` |
| `/post-login` | Session | `app/post-login/page.tsx` → redirects by role |
| `/portal` | `client` | `app/portal/page.tsx`, `layout.tsx` |
| `/portal/projects/new` | Public | Redirect → `/projects/new` |
| `/portal/projects/[id]` | `client` | `page.tsx`, `quote-actions.ts`, `payment-panel.tsx`, `sent-quote-panel.tsx` |
| `/admin` | `admin` | `app/admin/page.tsx`, `layout.tsx` |
| `/admin/projects` | `admin` | `app/admin/projects/page.tsx` |
| `/admin/projects/[id]` | `admin` | `page.tsx`, `quote-builder.tsx`, `quote-section.tsx`, `project-actions.ts`, `project-status-controls.tsx` |
| `/admin/settings/service-types` | `admin` | `page.tsx`, `actions.ts` |
| `/admin/settings/policies` | `admin` | `page.tsx`, `actions.ts` |
| `/legal/[slug]` | Public | `app/legal/[slug]/page.tsx` + `content/legal/*.md` |

**Route protection:** `admin/layout.tsx` → `requireRole(["admin"])`. `portal/layout.tsx` → `requireRole(["client"])`.

---

## API routes

| Method / path | Who | Handler | Data layer |
|---------------|-----|---------|------------|
| `*` `/api/auth/[...nextauth]` | Public | Auth.js | `src/auth.ts` |
| `GET/POST` `/api/projects` | Admin list / client create | `api/projects/route.ts` | `lib/data/projects.ts` |
| `GET` `/api/projects/[id]` | Admin any / client own | `api/projects/[id]/route.ts` | `projects.ts` |
| `POST` `/api/projects/[id]/checkout` | Client (own project) | `checkout/route.ts` | `lib/payments/checkout.ts` |
| `GET/POST` `/api/projects/[id]/files` | Project audience | `files/route.ts` | `lib/data/file-assets.ts` |
| `GET` `/api/projects/[id]/files/[fileId]` | Authorized + payment gates | `files/[fileId]/route.ts` | `file-assets.ts` |
| `GET` `/api/notifications` | Signed-in user | `notifications/route.ts` | `lib/data/notifications.ts` |
| `POST` `/api/notifications/[id]/read` | Owner | `notifications/[id]/read/route.ts` | `notifications.ts` |
| `POST` `/api/webhooks/stripe` | Stripe (signed) | `webhooks/stripe/route.ts` | `lib/payments/webhook-handler.ts` |
| `POST` `/api/cron/email-outbox` | Cron | `cron/email-outbox/route.ts` | `lib/email/outbox.ts` |

---

## Server actions registry

| File | Feature |
|------|---------|
| `app/request/actions.ts` | Guest intake submit (used by `IntakeDetailsForm`) |
| `app/portal/projects/new/actions.ts` | Authenticated client intake |
| `app/portal/projects/[id]/quote-actions.ts` | Client approve / decline quote |
| `app/admin/projects/[id]/quote-actions.ts` | Admin quote save / send / line items |
| `app/admin/projects/[id]/project-actions.ts` | Status transitions, admin ops |
| `app/admin/settings/service-types/actions.ts` | Service type CRUD |
| `app/admin/settings/policies/actions.ts` | Workspace settings update |
| `app/login/actions.ts` | Client sign-in |
| `app/login/studio/actions.ts` | Admin sign-in |
| `app/sign-out/actions.ts` | Sign out |
| `lib/actions/project-messages.ts` | Post message / reply |

**Pattern:** Zod parse → `requireAppUser` / `requireRole` → `lib/data/*` → `revalidatePath` / `redirect`.

---

## Configuration files

| File | Purpose |
|------|---------|
| `web/.env` | Local secrets (gitignored) — copy from `.env.example` |
| `web/.env.example` | Documented env var template |
| `web/next.config.ts` | `transpilePackages` for Prisma; `serverExternalPackages: ["pg"]` |
| `web/tsconfig.json` | `@/*` path alias, strict TS |
| `web/eslint.config.mjs` | ESLint (Next.js preset) |
| `web/postcss.config.mjs` | Tailwind v4 |
| `web/vercel.json` | Vercel deployment config |
| `web/prisma/schema.prisma` | Database schema |
| `docker-compose.yml` | Local Postgres credentials (match `DATABASE_URL`) |

---

## State management

There is **no global client state library** (no Redux, Zustand, Jotai).

| State type | Where it lives |
|------------|--------------|
| **Server / domain state** | PostgreSQL via Prisma (`lib/data/*`) |
| **Session** | Auth.js JWT in cookie; read via `getAppUser()` |
| **URL state** | Next.js App Router (`searchParams`, dynamic `[id]` segments) |
| **Form state** | React controlled inputs in client components; submitted via server actions |
| **Optimistic UI** | Minimal — prefer `revalidatePath` after mutations |
| **Notifications (unread count)** | Fetched server-side + client refresh via API |
| **File upload progress** | Local component state during upload |

**Rule:** If it must survive a refresh or be shared across users, it belongs in Postgres, not client memory.

---

## Cross-cutting system file map

### Authentication

| Concern | File |
|---------|------|
| Auth.js config | `src/auth.ts` |
| App session API | `lib/auth/session.ts` |
| API route auth | `lib/auth/api-route.ts` |
| Rate limiting | `lib/auth/rate-limit.ts` |
| Guest project linking | `lib/auth/link-client-projects.ts` |
| Types | `lib/auth/types.ts` |
| Public export | `lib/auth/index.ts` |

### Payments

| Concern | File |
|---------|------|
| Adapter interface | `lib/payments/adapter.ts` |
| Stripe implementation | `lib/payments/stripe-adapter.ts` |
| Checkout sessions | `lib/payments/checkout.ts` |
| Webhooks | `lib/payments/webhook-handler.ts` |
| Amount calculation | `lib/payments/amounts.ts`, `policy.ts` |
| Stripe client | `lib/payments/stripe-client.ts` |

### Files

| Concern | File |
|---------|------|
| Storage backend switch | `lib/storage/project-files.ts` |
| Upload + metadata | `lib/data/file-assets.ts` |
| Download route | `api/projects/[id]/files/[fileId]/route.ts` |
| UI | `components/project-files-section.tsx`, `project-files-upload.tsx` |

### Email & notifications

| Concern | File |
|---------|------|
| In-app notifications | `lib/data/notifications.ts` |
| Email fan-out | `lib/email/fanout.ts` |
| Outbox worker | `lib/email/outbox.ts` |
| Templates | `lib/email/templates/render.ts` |
| Resend send | `lib/email/resend.ts` |
| Bell UI | `components/notification-bell.tsx` |

---

## Tooling scripts (`web/scripts/`)

| Script | npm command |
|--------|-------------|
| `verify-critical-path.mjs` | `verify:critical-path` |
| `tranche-regression-checklist.mjs` | `verify:tranche-checklist` |
| `payment-amounts-check.mjs` | `verify:payment-amounts` |
| `ui-polish-checklist.mjs` | `verify:ui-polish` |
| `verify-email-outbox.ts` | `verify:email-outbox` |
| `import-legal-docx.mjs` | `import:legal-docx` |
| `sync-brand-assets.mjs` | `sync:brand-assets` |
| `prisma-prod.mjs` | `db:prod:push`, `db:prod:seed` |
| `baseline-prisma-migrations.mjs` | `db:baseline` |

---

## Reference prototype (do not ship)

**Path:** `whobrey-studios-app/whobrey-studios-app/`

Use for UX ideas (status richness, dashboard KPIs, client "next step" copy). **Never** copy its auth model or client-side filtering patterns. See `DESIGN.md` §10.
