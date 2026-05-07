# Whobrey Studios — Technical Design Document

**Status:** Draft — implementation decisions recorded here supersede informal notes and AI-generated summaries where they conflict.

**Source context:** Product intent originated from client discussion captured in `overview.md` (Plaud-derived summary). That file is a **guide**, not a fixed contract. This document maps **wants → concrete decisions** and lists **open items** still requiring client or vendor input.

---

## 1. Purpose

Build a **project management and client portal** for a graphic design business: replace scattered text/email with a single workflow from **new request → quote → approval → work → revisions → final payment → file delivery**, plus a **physical product catalog** (e.g. decals) with checkout and order tracking.

**Primary users:** Business owner (Admin) and Clients.

---

## 2. Requirements traceability (wants → decisions)


| #   | Want (from product guide)                                          | Implementation decision                                                                                                                                                                                                                    | Open / verify                                                                                                            |
| --- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| W1  | Dual interface: Admin vs Client                                    | **Role-based access control (RBAC).** Two logical experiences: admin routes and client routes; shared components where safe. Roles stored on user record (`admin` | `client`).                                                             | Confirm: single login domain vs `admin.*` / `app.*` URLs.                                                                |
| W2  | Client submits new project request (form fields as in guide)       | **POST** creates `Project` with status `new_request` (or equivalent enum). All listed fields persisted; optional fields nullable.                                                                                                          | Confirm exact field list and required vs optional.                                                                       |
| W3  | Admin notified on new request                                      | **In-app notification record + unread bell indicator in MVP**, with push/SMS adapter integration after provider choice. Native later: FCM. See §6.3.                                                                                         | Confirm push/SMS provider and delivery rules (immediate vs digest).                                                      |
| W4  | Admin views request; quote outside app or in-app                   | **In-app Quote Builder** (line items, products, labor, materials, computed total).                                                                                                                                                         | None — in-app is the build target.                                                                                       |
| W5  | Send quote; status `quote_sent`                                    | Quote is versionable entity linked to project; “send” transitions status and timestamps `sent_at`.                                                                                                                                         | Confirm: can multiple quotes exist per project (revisions)? **Proposed:** yes, one `is_current` or highest version wins. |
| W6  | Client: approve / decline / message                                | Actions update quote + project state; message creates **threaded** `Message` under project. On decline, admin gets explicit follow-up choice (close project vs revise/re-quote).                                                            | Confirm exact copy/UX for post-decline admin decision.                                                                   |
| W7  | Approved → deposit payment                                         | **Payment provider TBD** (merchant in discussion). Integration via **checkout session + webhooks**; never trust client-only “paid” flags.                                                                                                  | **Blocked** on merchant API (hosted vs embedded, webhooks).                                                              |
| W8  | Strong project status tracking                                     | **Explicit state machine** in application layer (and/or DB check constraints). States align with guide: e.g. `new_request`, `quote_sent`, `approved`, `in_progress`, `final_revision`, `completed` (exact list in §4.2).                   | Client sign-off on final status names and allowed transitions.                                                           |
| W9  | Deposit received → in progress                                     | Webhook or async job sets status **after** verified payment event.                                                                                                                                                                         | Same as W7.                                                                                                              |
| W10 | Admin uploads versioned drafts                                     | **Object storage** (S3-compatible: AWS S3, R2, GCS) + **metadata table**: `file_id`, `project_id`, `kind` (draft|final), `revision_number`, `storage_key`, `mime`, `size`, `uploaded_by`, `created_at`.                                    | Client confirmed 50MB upload cap; keep extension policy configurable in app env.                                         |
| W11 | Client feedback on drafts                                          | **Messages** and/or structured “feedback” records attached to a revision — **Proposed:** message thread per project + optional `revision_id` link for clarity.                                                                             | Prefer structured feedback checklist or free text only? **Ask client.**                                                  |
| W12 | Revision limit + “final revision” warning                          | **Per-project (or per-quote) fields:** `included_revisions`, `revisions_delivered` (or count of draft uploads). UI compares counts and shows modal when client requests change on **second-to-last** included revision (per product spec). | Confirmed: global default + per-quote override, with client default at **2** included revisions.                        |
| W13 | Final payment before download                                      | **Final files** only served via **short-lived signed URLs** after `final_payment_status === paid` (verified via webhook). UI disables download until gate passes.                                                                          | None for pattern — amounts/timing with client.                                                                           |
| W14 | Admin uploads final assets (.ai, .png, .svg, etc.)                 | Same storage pattern as drafts; `kind = final`; optional separate prefix in bucket.                                                                                                                                                        | Virus scanning v1 or later? **Defer** unless client requires.                                                            |
| W15 | Physical product catalog, options, cart, checkout                  | **Separate domain / website shop page** is acceptable for later phase. Keep portal focused on custom project workflow in MVP.                                                                                                               | Capture final shop URL and integration timing when available.                                                             |
| W16 | Admin adds shipping/tracking; client sees status                   | Order detail API + client order list; notifications on status change (optional v1).                                                                                                                                                        | —                                                                                                                        |
| W17 | Relational data (users, projects, quotes, files, messages, orders) | **PostgreSQL** as system of record. Migrations via ORM (e.g. Prisma/Drizzle) or equivalent.                                                                                                                                                | Aligns with “relational” intent from guide; not Firestore-as-primary.                                                    |
| W18 | Secure login                                                       | **Client:** email magic link first (Google provider possible later). **Admin:** password login first, revisit MFA later. Session/JWT per standard framework.                                                                               | Confirm when Google login should be introduced (MVP+1 or later).                                                         |
| W19 | Web + mobile                                                       | **Web-first:** responsive web app; **PWA** installable on phones. **Native iOS/Android** explicitly deferred and optional later.                                                                                                          | None for MVP; revisit after product traction milestones.                                                                  |
| W20 | API for clients                                                    | **REST** (JSON) as default for predictability and webhook integration; GraphQL only if complexity justifies later.                                                                                                                         | —                                                                                                                        |
| W21 | Push notifications                                                 | **FCM** when native apps exist; **Web Push** + **email** for web v1 where needed. Notification **outbox** table + worker for reliability.                                                                                                  | —                                                                                                                        |


---

## 3. Recommended stack (default)

These choices satisfy the traceability table unless client decisions force a change.


| Layer                 | Choice                                                                   | Rationale                                                                                                     |
| --------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| **App / API**         | **Next.js** (App Router) + TypeScript                                    | One codebase for marketing site (optional), admin UI, client portal; API routes or co-deployed Node handlers. |
| **Database**          | **PostgreSQL** (managed: Neon, Supabase DB, RDS, etc.)                   | Relational model, constraints, reporting, clear audit story for money-adjacent data.                          |
| **ORM / migrations**  | **Prisma** or **Drizzle**                                                | Team preference; both support Postgres well.                                                                  |
| **Auth**              | **Auth.js v5** (client magic link + admin credentials; social later)     | Implemented in `web/src/auth.ts`; app code uses **`@/lib/auth`** (`getAppUser`, `requireRole`) so provider changes (e.g. Google) stay isolated. |
| **File storage**      | **S3-compatible bucket** + private objects, server-issued signed GET/PUT | Matches guide; portable across AWS/R2/GCS.                                                                    |
| **Payments**          | Merchant TBD                                                             | Stripe-like webhook pattern assumed; adapter interface if merchant changes.                                   |
| **Background / cron** | Queue worker (e.g. Inngest, BullMQ, or hosted equivalent)                | Webhook processing, emails, notification fan-out.                                                             |
| **Hosting**           | Vercel / Fly.io / Railway / AWS — **TBD** with budget and ops preference | Does not change domain model.                                                                                 |


**Firebase as a bundle:** Auth + Storage + FCM remain valid *à la carte* (e.g. FCM-only with Postgres). **Not** adopting Firestore as primary DB, to keep the relational model and reporting straightforward unless client explicitly prefers full Firebase and accepts NoSQL modeling.

---

## 4. Domain model (conceptual)

### 4.1 Core entities

- **User** — `id`, `email`, `role`, profile fields, auth provider linkage.
- **Project** — client reference, status, request fields (name, business, phone, contact preference, type, deadline, notes), timestamps.
- **ServiceType** (optional v1) — admin-managed catalog entries for “project type” and quote hints; better than hardcoded enums long-term.
- **Quote** — Implemented in DB: `Quote` + `QuoteLineItem`, `version`, `totalCents`, `sentAt`, `QuoteStatus` (draft / sent / approved / declined). UI on admin + portal project pages; API can be extended later.
- **Message** — `project_id`, `author_id`, body, `revision_id` optional, `created_at`, threading via `parent_message_id` or flat with `thread_key`.
- **FileAsset** — metadata + storage key; links to `project_id`, `revision_number`, `kind`.
- **PaymentRecord** — provider ids, amount, type (deposit | final), status, raw webhook reference (idempotency key).

### 4.2 Project status (draft — align with client)

Suggested states (expanded from client flow + reference prototype; adjust naming to DB enum style):

`new_request` → `consultation_scheduled` → `quote_sent` → `awaiting_authorization` → `awaiting_deposit` → `scheduled_to_start` → `in_progress` → `proof_sent` → `revision_requested` → `awaiting_final_approval` → `awaiting_final_payment` → `ready_for_delivery` → `delivered_or_shipped` → `completed`  
Branches: `declined`, `on_hold`, `cancelled` as needed.

**Rules:** transitions enforced in server logic; invalid transitions return 409.

### 4.3 E-commerce (phase 2 unless reprioritized)

- **Product** / **ProductVariant** (size, SKU, price).
- **Order** / **OrderLine** / payment linkage / fulfillment fields.

---

## 5. Security (non-negotiables)

- **Server-side authorization:** every mutation checks `user.role` and ownership (client sees only their projects; admin sees all).
- **Files:** no public bucket listing; downloads only through **signed URLs** after authz check.
- **Payments:** amounts and status from **webhook + idempotent processing**; replay-safe.
- **Secrets:** environment variables only; no keys in client bundles except public publishable keys (e.g. Stripe publishable).

---

## 6. Integrations

### 6.1 Payments

- Abstract **PaymentProvider** interface: `createCheckoutSession`, `handleWebhook`, `refund` (future).
- **Blocked** until merchant provides: hosted vs embedded checkout, webhook payload, test mode, and dispute semantics.

### 6.2 File storage

- Key layout **proposed:** `projects/{projectId}/drafts/r{revision}/{fileId}-{sanitizedName}` and `projects/{projectId}/final/{fileId}-{sanitizedName}`.
- Upload: client → **presigned PUT** or upload via server after size/type check.
- Client visibility policy (from validated prototype behavior): never expose internal-only assets; expose files only when explicitly client-visible (approved/final, or proof files during proof/revision windows).

### 6.3 Notifications

- **In-app:** `Notification` table + bell UI.
- **Email:** transactional provider (Resend, Postmark, SES, etc.) for quote sent, payment received, order shipped.
- **Push:** Web Push for PWA; FCM when native wrapper exists.

---

## 7. MVP vs later


| MVP (first shippable slice)                             | Later                                                      |
| ------------------------------------------------------- | ---------------------------------------------------------- |
| Auth + roles                                            | Native apps                                                |
| Project create (client) + admin list/detail             | Full analytics dashboard                                   |
| Quote builder + send + client approve/decline/message   | Shop + cart                                                |
| Deposit/final payment integration (once merchant known) | Virus scan pipeline                                        |
| Draft upload + revision counting + final gate           | Real-time WebSocket chat (if async messaging insufficient) |


---

## 8. Open questions (remaining)

1. **Merchant:** provider name, API docs, webhook event model, sandbox credentials, and checkout mode.
2. **Notifications delivery vendors:** choose SMS/push providers and escalation policy (immediate vs grouped).
3. **Quote decline UX detail:** exact admin-side copy and default choice after a client decline.
4. **Auth phase timing:** when to add Google login for clients (if at all in near-term roadmap).
5. **URLs:** single domain path prefixes (`/admin`, `/portal`) vs subdomains.
6. **Legal links:** final Terms, Privacy, and Refund/Cancellation URLs for footer/login screens.
7. **Shop handoff detail:** destination URL and placement for the eventual external shop link.

---

## 9. Document maintenance

- Update this file when architecture or domain rules change.
- Client-facing choices without deep technical detail live in `**decisions.md`**.

---

## 10. Reference prototype insights (`whobrey-studios-app`)

The client provided a Supabase prototype app. It is not the production architecture, but it captures useful product intent.

**Adopt into roadmap/design**

- Rich status progression (consultation, authorization, proof, revision, delivery checkpoints) reflected in §4.2.
- Clear client-facing file visibility gates (approved/final + controlled proof visibility) reflected in §6.2.
- Owner dashboard KPI ideas (active projects, awaiting deposit, urgent, outstanding, unpaid) as future admin dashboard slice.
- Client “next step” guidance copy by status as UX content source.

**Do not adopt as implementation pattern**

- Client-side authorization/filtering as source of truth. Production must enforce authz server-side on every read/mutation.
- Monolithic single-page data loading of all tables in browser.
- Direct table coupling in UI without app-layer policy boundaries.

