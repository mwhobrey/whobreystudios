# WHO-8 / WHO-30 — Ops: decisions sync + on-site legal

**Epic:** [WHO-8](https://linear.app/whobrey-studios/issue/WHO-8)  
**Task:** [WHO-30](https://linear.app/whobrey-studios/issue/WHO-30)

## Decision: on-site policies (not “pull from URL”)

| Approach | Verdict |
|----------|---------|
| Link to client OneDrive | **No** — login wall, link rot, off-brand, bad for PWA |
| Auto-scrape external URL | **No** — unreliable; legal text should be versioned in git |
| **Markdown in repo → `/legal/*`** | **Yes** — same origin, deploy with app, auditable diffs |

Client source: [OneDrive folder](https://1drv.ms/f/c/6c6e66a8a109a410/IgDMCQkpm5lqSp1XOwR3XchoARg1KvwUJ9hypUoHjjE7GTA?e=s1SSE6) (export manually).

## Content paths

| Page | File |
|------|------|
| `/legal/terms` | `web/content/legal/terms.md` |
| `/legal/privacy` | `web/content/legal/privacy.md` |
| `/legal/refund` | `web/content/legal/refund.md` |

## Surfaces

- `/login`, `/request`, portal project detail — `PolicyLinks` → `/legal/*`
- Admin → Policies — optional URL override redirects **only while** markdown still contains `**Placeholder**`

## WHO-30 doc sync

- `decisions.md` — I1 + WHO-8 table
- `DESIGN.md` §8 — close resolved items; list legal copy as content-only remaining work

## Import workflow (DOCX → markdown)

Client files live in `web/content/legal/*.docx`. Regenerate pages:

```bash
cd web && npm run import:legal-docx
```

## Before prod

1. ~~Replace placeholder `.md` files~~ — imported from client DOCX (May 2026).
2. Clear admin URL overrides if any OneDrive links were set.
3. Spot-check `/legal/terms`, `/legal/privacy`, `/legal/refund` on mobile (PWA).
