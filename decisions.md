# Client Decisions — Locked Snapshot

Last updated from client response in `decisions_answers.md` (received overnight).

## Confirmed Decisions

| Area | Decision | Build impact |
|---|---|---|
| Mobile (A1/A2/A3) | Start web-first/PWA; native app can come later if growth justifies it. | Keep responsive web + PWA path; no native app work in MVP. |
| Client auth (B1) | Magic link by email now; possible Google account support later. | Prioritize magic-link UX for clients; design auth abstraction for Google provider later. |
| Admin auth (B2) | Password now; revisit stronger security later. | Keep credentials login for admin; leave room for MFA later. |
| Deposit (C1) | Default deposit should be **40%**; adjustable later. | Set system default to 40%; keep per-quote override capability. |
| Final payment (C2) | Remaining 100% at final invoice; add-ons billed via invoice updates. | Keep final-balance calculation simple; support additional line items. |
| Merchant (C3) | **Stripe** (sandbox + webhooks shipped — WHO-6). | Production keys + deployed webhook still ops. |
| Decline flow (D1) | On quote decline, admin wants to choose next step. | Add explicit admin decision: close project or reopen/re-quote. |
| Project type UX (D2) | Fixed list + easy “add item” without code. | Admin-managed `ServiceType` catalog is the right pattern. |
| Revisions policy (D3/D3b) | Include revisions by default; default count = **2**. | Add global default = 2 and per-quote override. |
| File size (E1) | Cap client uploads at **50 MB**. | Keep `MAX_UPLOAD_BYTES` default 50MB. |
| File types (E2) | No extra restrictions requested. | Keep current allowlist strategy; no additional blocks now. |
| Intake attachments (E3) | Yes, allow files on initial request. | Add attachments to project intake form/flow. |
| Notifications (F1) | Client note: SMS/push; **doc default for v1: email + in-app**. | WHO-7: Resend transactional email; in-app bell done (Phase 0). SMS/push → WHO-11. |
| Messaging UX (F2) | Threaded messages are fine; wants notification bell with unread indicator. | No real-time chat required for MVP. |
| Shop scope (G1/G2) | Shop is later and likely a separate website/shop page; shipping TBD later. | Do not build ecommerce in MVP; provide optional link-out later. |
| Branding assets (H1-H4) | Icon/logo/colors will be provided/iterated by client; shop images later. | Keep placeholders and theme hooks; no blocker for core MVP. |
| Legal/docs (I1) | Terms/privacy/refund docs will be provided later. | Add placeholder links/settings field now; wire final URLs later. |
| Sales tax (I2) | Yes, sales tax required for shop once built. | Track for future shop scope; not blocking portal MVP. |

## WHO-7 implementation defaults (dev — locked 2026-05-21)

Not asked in `decisions_complete.md`; recorded for build + Linear [WHO-7](https://linear.app/whobrey-studios/issue/WHO-7). Full plan: `docs/who-7-implementation-plan.md`.

| Area | Choice |
|------|--------|
| Transactional email | **Resend** |
| From address | **`@whobrey-studios.llc`** (e.g. `portal@whobrey-studios.llc`) |
| Client intake | **Guest intake** + link projects by `contactEmail` on first magic-link sign-in (WHO-21) |
| Login UX | `/login` (client magic link) · `/login/studio` (admin password) |
| Email worker | **Postgres outbox + cron** (not Inngest v1) |
| Inngest later | Scheduled reminders, digests, SMS/push (WHO-11), heavy async fan-out |

## Outstanding Inputs (Still Needed)

1. **Google login timing:** phase 1.5 or post-MVP (B1 “later”).
2. **SMS/push vendors:** WHO-11 (client wants; not blocking WHO-7).
3. **Domain strategy:** single domain path prefixes (`/admin`, `/portal`) vs subdomains.
4. **Legal URLs:** stable hosted URLs for terms/privacy/refund (client OneDrive link is interim).
5. **Shop handoff model:** exact external shop URL (WHO-27).

## Immediate Build Priorities (Now Unblocked)

1. Revision policy defaults (global 2, per-quote override, counters/warnings).
2. Intake attachments on first project request.
3. In-app notification bell + unread indicator for new messages/events.

## Notes

- `decisions_answers.md` remains the raw client response artifact.
- This file (`decisions.md`) is the normalized implementation source of truth.
