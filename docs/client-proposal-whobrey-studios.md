# Whobrey Studios Client Portal — Project Proposal

**Prepared for:** Whobrey Studios (client)  
**Prepared by:** Mike Whobrey (development)  
**Date:** May 19, 2026  
**Document version:** 1.0

---

## Introduction

This proposal describes the **Whobrey Studios client portal** — a web application where your clients can request design work, review quotes, exchange messages, and receive files, while you manage everything from an admin dashboard.

It includes two price columns on every line:

| Column | Meaning |
|--------|---------|
| **Fair market value (FMV)** | What a comparable custom build would typically cost from a US boutique studio or senior contractor at market rates. Useful for insurance, taxes, or understanding full replacement cost. |
| **Family rate** | A reduced **“little brother”** rate — same scope and quality, priced as a family project, not a commercial agency engagement. |

Nothing in the family column is “free work”; it reflects a deliberate discount on labor, not a downgrade in what gets delivered.

---

## What you asked for (from your decisions)

Your answers in `decisions_answers.md` and the product overview shaped this build:

- **Web-first** on phones (installable later as a PWA; App Store apps only if you outgrow the website).
- **Clients:** email magic link when we finish auth (password login works today for demos).
- **You (admin):** password login now; stronger security (MFA) when you’re ready.
- **Quotes:** per-job line items, ~**40% deposit** (adjustable per quote when payments go live), **2 included revisions** by default (overridable per quote).
- **Messages:** simple thread per project + **notification bell** (not live chat).
- **Alerts:** you want **text/push** eventually; **in-app + email** are the near-term path.
- **Shop** (decals/merch): **after** the custom project workflow is solid — can link to a shop page on your main site at first.
- **Payments:** waiting on your card processor — architecture is ready; checkout is the next major integration.

---

## What’s already built (Phase 0 — delivered)

The following is **in place today** and demo-ready (local dev + documented production deploy on Vercel / Neon / Cloudflare R2).

| Area | What you get |
|------|----------------|
| **Sign-in** | Separate admin and client experiences; secure role-based access. |
| **New project requests** | Client form (contact info, project type, deadline, notes, optional attachments). |
| **Your dashboard** | KPIs, priority queue, quick links to projects needing attention. |
| **Projects** | List and detail for you and clients; status tracking with history. |
| **Quotes** | Build line items, save draft, send to client; client approve / decline; revised quotes after decline. |
| **Messages** | Threaded discussion on each project. |
| **Files** | Upload drafts and finals; revision counting; rules so clients only download finals when policy allows (payment hook ready). |
| **Notifications** | In-app bell with unread count; alerts when requests, quotes, messages, and files change. |
| **Settings** | Manage project types (service list), default revision count, policy link placeholders. |
| **Look & feel** | Custom branded UI (“Atelier OS”) — not a generic template. |
| **Documentation** | Technical design, deployment runbook, and your decisions on file. |

### Phase 0 — pricing summary

| | FMV | Family rate |
|---|-----|-------------|
| Discovery, design, and build (as-delivered above) | **$70,000 – $105,000** | **$35,000 – $52,500** |
| *Typical midpoint for planning* | *~$88,000* | *~$44,000* |

**Family discount on Phase 0:** approximately **50%** off fair market value.

> **Note:** Phase 0 is largely complete. If you treat this as a formal engagement, Phase 0 can be invoiced as a single milestone (as-built) or amortized across later phases — whatever we agree on.

---

## Recommended next steps (Phase 1 — MVP complete)

Finishes the portal against your decisions and the technical design: real money flow, client-friendly login, and outbound email.

| Deliverable | FMV | Family rate |
|-------------|-----|-------------|
| Payment integration (deposit + final, webhook-confirmed, unlocks work/downloads) | $7,200 – $12,000 | $3,600 – $6,000 |
| Per-quote deposit % and invoice fields (e.g. 40%, adjustable) | $1,200 – $2,400 | $600 – $1,200 |
| Client magic-link sign-in (email) | $2,400 – $4,200 | $1,200 – $2,100 |
| Transactional email (quote sent, payment received, key updates) | $3,600 – $6,000 | $1,800 – $3,000 |
| PWA basics (install on phone, icons, shell) | $1,200 – $2,400 | $600 – $1,200 |
| Revision-limit warning + decline flow polish | $1,800 – $3,600 | $900 – $1,800 |
| Security pass (rate limits, production checklist, optional MFA later) | $2,400 – $4,800 | $1,200 – $2,400 |
| Core automated tests on critical paths | $3,600 – $7,200 | $1,800 – $3,600 |
| **Phase 1 subtotal** | **$23,400 – $42,600** | **$11,700 – $21,300** |
| *Typical midpoint* | *~$33,000* | *~$16,500* |

### Phase 1 — pricing summary

| | FMV | Family rate |
|---|-----|-------------|
| **Phase 1 only** | **$23,400 – $42,600** | **$11,700 – $21,300** |
| **Phase 0 + Phase 1 (full custom-job MVP)** | **$93,600 – $147,600** | **$46,800 – $73,800** |
| *Full MVP midpoint* | *~$121,000* | *~$60,500* |

**Family discount on Phase 1:** approximately **50%** off FMV.

**Blocked until you provide:** merchant/processor name, API access, and test mode — payments cannot go live without it.

---

## Later phases (optional)

### Phase 2 — Online shop (decals / merch)

Built-in catalog, cart, checkout, order tracking, and admin fulfillment — if you want shop **inside** the portal instead of only linking to your main website.

| | FMV | Family rate |
|---|-----|-------------|
| Phase 2 | **$26,400 – $40,800** | **$13,200 – $20,400** |
| *Midpoint* | *~$33,600* | *~$16,800* |

Sales tax collection rules depend on your accountant; we can integrate a provider when you’re ready (EIN in place per your notes).

### Phase 3 — Text, push, and optional native app

SMS and/or push for urgent alerts; optional App Store path later if the PWA isn’t enough.

| | FMV | Family rate |
|---|-----|-------------|
| Phase 3 | **$18,000 – $34,000** | **$9,000 – $17,000** |
| *Midpoint* | *~$26,000* | *~$13,000* |

---

## All-in vision (everything in the original overview)

| Scope | FMV | Family rate |
|-------|-----|-------------|
| Phase 0 + 1 + 2 + 3 | **$137,000 – $223,000** | **$68,500 – $111,500** |
| *Midpoint* | *~$180,000* | *~$90,000* |

You do **not** need to commit to Phases 2–3 now. Most studios ship Phase 0 → 1 first, then decide on shop and mobile based on real usage.

---

## Deployment (one-time)

Getting the app live on your domain (hosting, database, file storage, SSL, seeded accounts, smoke test).

| | FMV | Family rate |
|---|-----|-------------|
| Initial production / demo deploy | **$1,500 – $4,000** | **$750 – $2,000** |

**You pay vendors directly** (typical small-business traffic):

| Service | Rough monthly cost |
|---------|-------------------|
| App hosting (e.g. Vercel) | $0 – $20+ |
| Database (e.g. Neon) | $0 – $25+ |
| File storage (e.g. Cloudflare R2) | Usually under $5 |
| Email / SMS (when added) | Usage-based |
| Payment processor | Per their fee schedule |

---

## Ongoing maintenance (annual)

Keeps dependencies current, fixes bugs, and handles small tweaks after launch.

| Plan | What’s included | FMV / year | Family rate / year |
|------|-----------------|------------|-------------------|
| **Essential** | Security patches, dependency updates, hosting health | $3,600 – $6,000 | $1,800 – $3,000 |
| **Standard** *(recommended)* | Essential + bugfixes, minor UX, framework upgrades | $9,000 – $18,000 | $4,500 – $9,000 |
| **Active** | Standard + small features (payment tweaks, shop changes) | $18,000 – $36,000 | $9,000 – $18,000 |

Family maintenance is roughly **50%** of FMV. Many engagements use **Standard** after go-live.

---

## Suggested payment milestones (family rate, Phase 0 + 1)

Example structure if you want predictable cash flow — we can adjust:

| Milestone | Trigger | Family rate (midpoint planning) |
|-----------|---------|----------------------------------|
| **M1 — As-built** | Phase 0 accepted / demo walkthrough | ~$22,000 (50% of ~$44k Phase 0 midpoint) |
| **M2 — Payments live** | Deposit + final checkout working in test, then prod | ~$8,000 |
| **M3 — MVP launch** | Magic link, email, PWA shell, hardening, handoff | ~$8,500 |
| **M4 — Retainer** | Optional; monthly or annual maintenance | Per plan above |

**Total family midpoint (Phase 0 + 1):** ~**$60,500** (vs ~$121,000 FMV).

---

## What family rate does and doesn’t mean

**Includes (same as FMV scope):**

- Production-quality code, security-minded patterns, and documentation you can hand to another developer later.
- Honest scoping — we don’t hide “shop” or “payments” as surprise add-ons; they’re listed above.
- Deployment guidance and a path to your own domain.

**Does not include:**

- Legal documents (terms, privacy, refund policy) — you provide text or URLs; we link them in the app.
- Merchant account setup, business insurance, or tax advice.
- Unlimited feature requests outside agreed phases — those roll into maintenance or a new phase.
- 24/7 on-call — family rate assumes reasonable async turnaround, not enterprise SLA.

**If scope grows materially** (e.g. full shop + custom ERP + five integrations), we re-quote before building — no silent scope creep.

---

## Comparison at a glance

| Package | FMV (range) | Family rate (range) | You save (approx.) |
|---------|-------------|---------------------|--------------------|
| **Delivered today (Phase 0)** | $70k – $105k | $35k – $52.5k | ~50% |
| **Finish MVP (Phase 1 add-on)** | +$23k – $43k | +$12k – $21k | ~50% |
| **Full custom portal MVP (0+1)** | $94k – $148k | $47k – $74k | ~$47k – $74k |
| **+ Shop (Phase 2)** | +$26k – $41k | +$13k – $20k | ~50% |
| **+ SMS / push / native (Phase 3)** | +$18k – $34k | +$9k – $17k | ~50% |
| **All-in vision** | $137k – $223k | $69k – $112k | ~$68k – $111k |
| **Deploy (one-time)** | $1.5k – $4k | $0.75k – $2k | ~50% |
| **Maintenance (year, standard)** | $9k – $18k | $4.5k – $9k | ~50% |

---

## Recommended path

1. **Accept Phase 0** as the foundation (already built) — align on family-rate settlement if you want this on the books.
2. **Phase 1** when your **payment processor** is chosen — that’s the critical path.
3. **Run on the live demo** with real-ish projects; collect feedback before shop or SMS.
4. **Phase 2** only if you want checkout inside the portal vs. a link to your existing website shop.
5. **Standard maintenance** starting the month after MVP launch.

---

## Acceptance

| | |
|---|---|
| Client name | _________________________________ |
| Signature | _________________________________ |
| Date | _________________________________ |
| Agreed package | ☐ Phase 0 settlement  ☐ Phase 1  ☐ Phase 2  ☐ Phase 3  ☐ Maintenance: _______ |
| Agreed family total (if fixed) | $ ______________ |

---

## Questions?

Reply with changes to scope, milestone preferences, or “start with Phase 1 only.” This document is a starting point for a conversation between brothers — not a corporate wall of legalese.

*Figures are estimates based on US custom software market rates (2025–2026) and the current codebase scope. Actual invoices can be fixed-price per milestone or hourly at the agreed family rate with a not-to-exceed cap.*
