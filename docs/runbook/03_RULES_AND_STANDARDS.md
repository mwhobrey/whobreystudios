# Rules & Standards

How we write code, handle errors, test, deploy, and commit — plus the gotchas that will bite you if you ignore them.

**See also:** [02_COMPONENTS_AND_FILES.md](./02_COMPONENTS_AND_FILES.md) · [04_CURRENT_STATE.md](./04_CURRENT_STATE.md) · [web/AGENTS.md](../../web/AGENTS.md)

---

## Coding conventions

### TypeScript & Next.js

| Rule | Detail |
|------|--------|
| **Server components by default** | Add `"use client"` only when you need hooks, events, or browser APIs |
| **Thin server actions** | `"use server"` files: parse → auth → `lib/data` → revalidate/redirect |
| **Auth import** | Use **`@/lib/auth`** in pages, actions, and data callers — **never** `@/auth` |
| **`server-only`** | Required on modules that must not ship to the client (Prisma, payments, email adapters) |
| **Zod for all external input** | Forms, API JSON bodies, webhook payloads — schemas live in `lib/schemas/` |
| **Money in cents** | Integer fields named `*Cents` (e.g. `totalCents`, `unitAmountCents`) |
| **Path alias** | `@/*` → `web/src/*` per `tsconfig.json` |

### Naming

| Thing | Convention | Example |
|-------|------------|---------|
| Data functions | verb + domain | `transitionProjectStatus`, `getLatestQuoteForProject` |
| Server action files | `actions.ts` or `*-actions.ts` | `quote-actions.ts` |
| Enums (DB) | snake_case | `new_request`, `quote_sent` |
| React components | PascalCase files | `QuoteBuilder.tsx` |
| UI primitives | kebab-case in `components/ui/` | `app-button.tsx` |

### UI

- Reuse **`components/ui/*`** before inventing one-off styled elements.
- Brand assets: after updating source files under `public/brand/WS */`, run `npm run sync:brand-assets`.
- Legal copy: regenerate markdown from DOCX via `npm run import:legal-docx`.

### Database

- Use **`prisma migrate dev`** for schema changes on shared branches — not `db push`.
- After schema changes: `prisma generate` (auto-runs on `predev`/`prebuild`).
- Generated client path: `web/src/generated/prisma` — **gitignored**.

### Scope discipline

- Minimal diffs — don't refactor unrelated code in the same PR.
- Match surrounding code style and abstractions.
- Comments only for non-obvious business logic.

---

## Error handling protocols

### Authorization failures

| Context | Behavior |
|---------|----------|
| **Page / layout** | `requireRole` → redirect to `/`, `/login`, or `/login/studio` |
| **API route** | `requireApiRoles` → `401` / `403` JSON response |
| **Data layer** | Throw or return null; caller maps to user-safe message |
| **Project access** | `userCanAccessProject` / `clientProjectAccessWhere` — client never sees other clients' IDs |

Never leak whether a resource exists vs forbidden — prefer generic errors where practical.

### Validation failures

- **Zod `safeParse`** at action/API boundary.
- Return field-level errors to forms; return `400` with message body for API.
- Do not proceed to Prisma with unvalidated input.

### Domain rule violations

- Invalid status transition → throw; API surfaces as `409`-style conflict where applicable.
- Quote not in expected state → clear error message to admin/client UI.
- Payment already processed → webhook handler uses idempotency (`stripeEventId`) — no double-apply.

### External service failures

| Service | Pattern |
|---------|---------|
| **Email / notifications** | `*BestEffort` helpers — primary DB transaction commits even if fan-out fails |
| **Email outbox** | Failed sends stay in `EmailOutbox` with `attempts` + `lastError`; cron retries |
| **Stripe webhook** | Verify signature first; return non-2xx only on unexpected errors (Stripe retries) |
| **Storage upload** | Roll back or avoid creating `FileAsset` if byte write fails |
| **Resend not configured** | Magic link provider omitted; credentials login still works locally |

### Graceful degradation

- **`NoopPaymentAdapter`** when Stripe env vars missing — payments UI disabled, app otherwise runs.
- **`STORAGE_PROVIDER=local`** default in dev — no R2 required locally.
- Email optional locally — seeded password login works without Resend.

### What we don't do

- Empty `catch` blocks.
- Client-only authorization checks as source of truth.
- Trusting client-reported payment success without webhook.

---

## State management rules

See [02_COMPONENTS_AND_FILES.md § State management](./02_COMPONENTS_AND_FILES.md#state-management).

**Summary:**

1. **Postgres is truth** for all durable domain state.
2. **Session cookie** is truth for who is logged in.
3. **No global client store** — use server fetch + `revalidatePath`.
4. **Payment state** comes from `PaymentRecord` rows updated by webhooks only.
5. **Project status** changes only through `transitionProjectStatus` — never raw enum writes scattered in UI.

---

## Testing & verification

There is no large automated test suite yet. Release confidence comes from scripted checks + manual regression.

### From `web/`

```powershell
npm run lint                    # ESLint
npm run build                   # Production build (includes prisma generate)
npm run verify:tranche          # lint + build + checklist + critical path
npm run verify:ui-polish        # UI polish manual checklist
npm run verify:payment-amounts  # Payment math sanity
npm run verify:email-outbox     # Email outbox (needs Resend configured)
npm run verify:critical-path    # Automated smoke checks only
```

**Before claiming core flows done:** run **`npm run verify:tranche`** and complete any printed manual steps.

### Manual regression focus areas

- Guest intake → admin sees project
- Quote send → client approve/decline
- Stripe deposit webhook → status advances
- File upload (draft) → client visibility rules
- Final payment gate → final download
- Magic link login (when Resend configured)
- Admin credentials at `/login/studio`

---

## Deployment pipeline

| Stage | Mechanism |
|-------|-----------|
| **CI** | Vercel build on push (project root = `web/`) |
| **DB migrations** | `prisma migrate deploy` in build or release step |
| **Env vars** | Vercel dashboard — see `web/.env.example` and `docs/demo-deployment-runbook.md` |
| **File storage (prod)** | `STORAGE_PROVIDER=r2` + Cloudflare credentials |
| **Stripe webhooks** | Dashboard or Stripe CLI → `POST /api/webhooks/stripe` |
| **Email cron** | Vercel cron → `POST /api/cron/email-outbox` with `CRON_SECRET` |

Full step-by-step: **`docs/demo-deployment-runbook.md`**.

---

## Git, commits & PRs

### Remote

- **URL:** `https://github.com/mwhobrey/whobreystudios`
- **Default branch:** `main`
- Feature branches → PR to `main`

### Commit message format

```
[LINEAR-ID] :gitmoji: type(scope): Brief summary
```

- Linear IDs: **`WHO-123`**
- Gitmoji must match [gitmoji.dev](https://gitmoji.dev)
- Optional body bullets: `* :gitmoji: detail`
- **No** commit trailers (`Co-authored-by`, `Signed-off-by`, etc.)
- Omit bracket prefix if no ticket

**Examples:**

```
WHO-6 :sparkles: feat(payments): Stripe checkout for deposit
WHO-7 :bug: fix(auth): block magic link for admin accounts
:memo: docs(runbook): split project runbook into 00-04
```

### PR expectations

- Summary: what / why (1–3 bullets)
- Test plan with concrete steps
- Link Linear issue when applicable
- Never commit `.env` or secrets

### Git safety (agents & humans)

- Do **not** force-push `main`
- Do **not** `commit --amend` on pushed commits unless explicitly requested
- Do **not** skip hooks unless explicitly requested
- Do **not** commit unless explicitly asked

---

## Issue tracking (Linear)

| Item | Value |
|------|-------|
| Team key | `WHO` |
| MCP server | `linear-whobrey-studios` |
| Config | `LINEAR_DEFAULT_TEAM=WHO` in `~/.cursor/mcp.json` |

Details: **`docs/linear-workspace.md`**.

When you finish work tied to a ticket, use the ticket ID in the commit message.

---

## Security rules (mandatory)

1. Server-side authz on every mutation and sensitive read.
2. Private file storage — no public bucket listing.
3. Webhook-confirmed payments only.
4. Secrets in environment variables only.
5. Guest projects linked by `contactEmail` on first client sign-in.

---

## Gotchas & technical debt

Read these before you waste an hour debugging.

### Prisma client is gitignored

**Symptom:** `Unknown field 'quotes' on model 'Project'`  
**Fix:** `cd web && npx prisma generate` — runs automatically on `predev`/`prebuild`.

### Turbopack + Prisma 7

**Symptom:** Bogus `@prisma/client-…` module errors in dev  
**Fix:** Use default **`npm run dev`** (Webpack). Avoid `dev:turbo` unless you've verified it works.  
**Mitigation:** `transpilePackages` in `next.config.ts`.

### Windows `localhost`

**Symptom:** DB connection failures  
**Fix:** Use `127.0.0.1` in `DATABASE_URL` instead of `localhost`.

### Auth redirect loops in production

**Symptom:** Login succeeds then bounces  
**Fix:** `AUTH_URL` must exactly match the public browser URL.

### Next.js 16 ≠ training data

This project uses **Next.js 16** with breaking changes. Read **`web/AGENTS.md`** and check `node_modules/next/dist/docs/` before assuming API shapes.

### README "Next steps" section is stale

Root `README.md` § "Next build steps" still lists messages/files/payments as future — **those are implemented**. Trust **`04_CURRENT_STATE.md`** and this runbook over that section until README is updated.

### Status enum vs DESIGN.md

`DESIGN.md` §4.2 describes a richer future status list. **DB enum in `schema.prisma` is what ships.** Don't add statuses without migration + transition map update.

### `whobrey-studios-app/` trap

Looks like a second app. It's a **reference prototype** — do not deploy, do not copy auth patterns.

### No middleware.ts

Route protection is via **layout `requireRole`**, not Next middleware. Adding middleware later requires coordinating with Auth.js session shape.

### Email magic link blocked for admins

By design — admins must use `/login/studio` credentials. Magic link throws for `role: admin` or users with `passwordHash`.

### Payment adapter noop locally

Without `STRIPE_*` env vars, `NoopPaymentAdapter` is active — payment buttons won't create real sessions.

### Best-effort notifications

Email/notification fan-out failures won't roll back the primary transaction. Check `EmailOutbox` for stuck rows if emails don't arrive.

---

## Runbook maintenance

When you add or change any of the following, update the relevant runbook file in the same PR:

| Change | Update |
|--------|--------|
| New route or API | `02_COMPONENTS_AND_FILES.md` |
| New env var | `02` (config) + `docs/demo-deployment-runbook.md` |
| Architecture / new service | `01_ARCHITECTURE.md` |
| New convention or gotcha | `03_RULES_AND_STANDARDS.md` |
| Feature shipped or deferred | `04_CURRENT_STATE.md` |

---

## AI agent mandatory behaviors

1. Read **`docs/runbook/00_INDEX.md`** and **`04_CURRENT_STATE.md`** at task start.
2. Code changes under **`web/`** unless explicitly told otherwise.
3. **`@/lib/auth`** not **`@/auth`**.
4. Domain logic in **`lib/data/`**.
5. Check **`decisions_complete.md`** before changing payment/revision/auth behavior.
6. Run **`npm run verify:tranche`** before claiming core flows complete.
7. Update runbook when conventions or structure change.
