# Whobrey Studios — Runbook Index

**Audience:** New developers, contractors, and AI coding agents.  
**Maintenance:** Update the relevant runbook file in the same PR when you change architecture, routes, env vars, or team conventions.

---

## North Star

**Replace scattered text/email with one trusted workflow** — from client project request through quote, approval, deposit, design revisions, final payment, and file delivery — so the business owner and every client always know what step they are on and what happens next.

Everything we build serves that single pipeline. Features that do not advance intake → quote → pay → deliver are phase 2 unless explicitly reprioritized.

---

## Executive summary

Whobrey Studios is a **dual-role web application** for a graphic design business:

| Surface | User | Purpose |
|---------|------|---------|
| **Client portal** (`/portal`) | Clients | Submit requests, review quotes, pay deposits/finals, download deliverables, message on projects |
| **Admin workspace** (`/admin`) | Business owner | Review intake, build/send quotes, manage status, upload files, configure policies |
| **Public** (`/`, `/projects/new`, `/faq`, `/legal/*`) | Guests & marketing | Landing, intake picker + details, FAQ, legal pages |

**Production code lives in `web/`** — a Next.js 16 App Router app with PostgreSQL (Prisma), Auth.js, Stripe payments, Resend email, and S3-compatible file storage (local dev / Cloudflare R2 in production).

**Not production:** `whobrey-studios-app/` — client-supplied prototype for UX ideas only.

### Quick facts

| Item | Value |
|------|-------|
| Local URL | [http://localhost:3000](http://localhost:3000) |
| Start dev | `npm run dev` from repo root |
| Seeded admin | `admin@whobrey.local` / `dev-admin-password` → `/login/studio` |
| Seeded client | `client@whobrey.local` / `dev-client-password` → `/login` |
| Git remote | `https://github.com/mwhobrey/whobreystudios` — branch `main` |
| Issue tracker | Linear team **`WHO`** — MCP `linear-whobrey-studios` |
| Demo deploy | `docs/demo-deployment-runbook.md` |

---

## Runbook table of contents

| # | Document | Read when you need… |
|---|----------|---------------------|
| **00** | [00_INDEX.md](./00_INDEX.md) | Orientation, North Star, links to everything else |
| **01** | [01_ARCHITECTURE.md](./01_ARCHITECTURE.md) | Stack, patterns, data flow, external services |
| **02** | [02_COMPONENTS_AND_FILES.md](./02_COMPONENTS_AND_FILES.md) | Directory map, routes, modules, configs, where code lives |
| **03** | [03_RULES_AND_STANDARDS.md](./03_RULES_AND_STANDARDS.md) | Coding conventions, git/commits, testing, deployment, gotchas |
| **04** | [04_CURRENT_STATE.md](./04_CURRENT_STATE.md) | What's shipped, what's incomplete, next steps |

---

## Related docs (outside this runbook)

| Document | Purpose |
|----------|---------|
| [README.md](../../README.md) | Fast local setup |
| [DESIGN.md](../../DESIGN.md) | Requirements traceability, security, MVP scope |
| [decisions_complete.md](../../decisions_complete.md) | Client-signed product choices (source of truth) |
| [overview.md](../../overview.md) | Original product intent (guide, not contract) |
| [docs/demo-deployment-runbook.md](../demo-deployment-runbook.md) | Vercel + Neon + R2 production demo |
| [docs/linear-workspace.md](../linear-workspace.md) | Linear labels, epics, MCP setup |
| [web/AGENTS.md](../../web/AGENTS.md) | Next.js 16 agent warning |

---

## Recommended read order

**Humans:** 00 → 04 → 01 → 02 → 03 → `DESIGN.md` → `decisions_complete.md`

**AI agents starting a task:**

1. Skim **00** (North Star + this index)
2. Read **04** (don't rebuild what exists; don't assume broken things work)
3. Deep-dive **01** or **02** depending on whether the task is architectural or file-location work
4. Follow **03** for commits, conventions, and verification

---

## AI agent quick checklist

- [ ] Production changes go under **`web/`** only (unless explicitly asked otherwise)
- [ ] Import auth from **`@/lib/auth`**, never `@/auth` in feature code
- [ ] DB logic belongs in **`lib/data/`**, not page components
- [ ] Check **`decisions_complete.md`** before changing payments, revisions, or auth behavior
- [ ] Run **`npm run verify:tranche`** from `web/` before claiming core flows are done
- [ ] Update runbook files when adding routes, env vars, or conventions
- [ ] Do not modify **`whobrey-studios-app/`** (reference prototype only)

---

## Changelog

| Date | Change |
|------|--------|
| 2026-05-22 | Split monolithic runbook into 00–04 series |
