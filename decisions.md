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
| Merchant (C3) | Still TBD. | Payment integration remains blocked on processor selection/API docs. |
| Decline flow (D1) | On quote decline, admin wants to choose next step. | Add explicit admin decision: close project or reopen/re-quote. |
| Project type UX (D2) | Fixed list + easy “add item” without code. | Admin-managed `ServiceType` catalog is the right pattern. |
| Revisions policy (D3/D3b) | Include revisions by default; default count = **2**. | Add global default = 2 and per-quote override. |
| File size (E1) | Cap client uploads at **50 MB**. | Keep `MAX_UPLOAD_BYTES` default 50MB. |
| File types (E2) | No extra restrictions requested. | Keep current allowlist strategy; no additional blocks now. |
| Intake attachments (E3) | Yes, allow files on initial request. | Add attachments to project intake form/flow. |
| Notifications (F1) | Wants text/SMS and/or push to phone quickly. | Build in-app bell now; external push/SMS adapter pending provider. |
| Messaging UX (F2) | Threaded messages are fine; wants notification bell with unread indicator. | No real-time chat required for MVP. |
| Shop scope (G1/G2) | Shop is later and likely a separate website/shop page; shipping TBD later. | Do not build ecommerce in MVP; provide optional link-out later. |
| Branding assets (H1-H4) | Icon/logo/colors will be provided/iterated by client; shop images later. | Keep placeholders and theme hooks; no blocker for core MVP. |
| Legal/docs (I1) | Terms/privacy/refund docs will be provided later. | Add placeholder links/settings field now; wire final URLs later. |
| Sales tax (I2) | Yes, sales tax required for shop once built. | Track for future shop scope; not blocking portal MVP. |

## Outstanding Inputs (Still Needed)

1. **Payment processor details:** provider name, checkout flow, webhook events, sandbox credentials.
2. **Client login provider timing:** whether “Google login later” should be phase 1.5 or post-MVP.
3. **Notification vendor choices:** SMS provider and push provider specifics (or confirmation to ship bell-only first).
4. **Domain strategy:** single domain path prefixes (`/admin`, `/portal`) vs subdomains.
5. **Legal URLs:** final links for terms, privacy, and refund policy.
6. **Shop handoff model:** exact external shop URL and when to add link in portal/nav.

## Immediate Build Priorities (Now Unblocked)

1. Revision policy defaults (global 2, per-quote override, counters/warnings).
2. Intake attachments on first project request.
3. In-app notification bell + unread indicator for new messages/events.

## Notes

- `decisions_answers.md` remains the raw client response artifact.
- This file (`decisions.md`) is the normalized implementation source of truth.
