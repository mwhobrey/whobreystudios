# WHO-9 — P1 Ship polish — implementation plan

**Epic:** [WHO-9](https://linear.app/whobrey-studios/issue/WHO-9)  
**Milestone:** P1-T3 — Ship polish

## Child issues (order)

| Issue | Scope |
|-------|--------|
| [WHO-28](https://linear.app/whobrey-studios/issue/WHO-28) | Auth rate limits (magic link + studio login) |
| [WHO-25](https://linear.app/whobrey-studios/issue/WHO-25) | Brand assets drop zone + manifest icons |
| [WHO-24](https://linear.app/whobrey-studios/issue/WHO-24) | PWA manifest + install metadata |
| [WHO-26](https://linear.app/whobrey-studios/issue/WHO-26) | Legal URLs in policies (terms/privacy/refund) |
| [WHO-27](https://linear.app/whobrey-studios/issue/WHO-27) | `shopUrl` + external Shop nav link |
| [WHO-29](https://linear.app/whobrey-studios/issue/WHO-29) | Critical-path verify scripts + checklist |

## Brand assets (WHO-25)

Drop client files into `web/public/brand/`:

- `logo.svg` or `logo.png` — optional header override
- `icon-192.png`, `icon-512.png` — PWA install (or use SVG favicon fallback in manifest)

## Prod checklist (WHO-28 + go-live)

- Rate limits active on `/login` and `/login/studio`
- Legal URLs set in admin → Policies (prefer stable hosted URLs, not OneDrive)
- Shop URL set if linking to main-site shop page
- Vercel cron + Resend + Stripe prod (from WHO-6/7)
