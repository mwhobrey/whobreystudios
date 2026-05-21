# Linear workspace — Whobrey Studios

**Team:** `WHO` (Whobrey-studios)  
**Project:** [Whobrey Studios Client Portal](https://linear.app/whobrey-studios/project/whobrey-studios-client-portal-9106c69d7dcc)  
**MCP server:** `linear-whobrey-studios` (Cursor)

## MCP configuration

In `~/.cursor/mcp.json`, the default team **must** match the Linear team key:

```json
"LINEAR_DEFAULT_TEAM": "WHO"
```

Previously set to `whobrey-studio` (nonexistent), which caused `list_projects` / `list_issues` to fail until `set_active_team` was called.

After changing `mcp.json`, restart Cursor or reload MCP servers.

## Label taxonomy (grouped)

| Group | Child labels |
|-------|----------------|
| **Type** | `epic`, `task`, `chore`, `blocked` |
| **Phase** | `phase-0` … `phase-3` |
| **Area** | `payments`, `auth`, `email`, `files`, `quotes`, `notifications`, `branding`, `infra`, `docs`, `shop`, `ops` |

Linear’s built-in **Feature** label exists (duplicate name blocked custom `feature`).

## Milestones (project)

| Milestone | Scope |
|-----------|--------|
| Phase 0 — Delivered | As-built portal |
| P1-T1 — Payments (Stripe) | Deposit/final, webhooks |
| P1-T2 — Auth & email | Magic link, transactional email |
| P1-T3 — Ship polish | PWA, brand, legal, hardening |
| Phase 2 — Shop (deferred) | External shop link |
| Phase 3 — SMS / Push (deferred) | F1 beyond in-app bell |

## Epics (issue map)

| Issue | Title |
|-------|--------|
| WHO-5 | Phase 0 — As-built |
| WHO-6 | P1 Stripe payments |
| WHO-7 | P1 Auth & email |
| WHO-9 | P1 Ship polish |
| WHO-8 | Ops — decisions & client inputs |
| WHO-10 | Phase 2 Shop |
| WHO-11 | Phase 3 SMS/Push |

Sub-issues WHO-12–31 are nested under epics WHO-6, WHO-7, WHO-8, WHO-9 via `save_issue` `parentId`.

## Source docs

- Client decisions: `decisions_complete.md`
- Normalized decisions: `decisions.md` (sync via WHO-30)
- Technical design: `DESIGN.md`
- Proposal / phases: `docs/client-proposal-whobrey-studios.md`
- WHO-7 plan: `docs/who-7-implementation-plan.md`

## MCP notes (mcp-utils)

- `archive_issue_label` / `delete_issue_label` — remove bad labels before recreating groups.
- Label **groups**: `add_issue_label` + `isGroup: true`, then `save_issue_label` + `parentId`.
- Sub-issues: `save_issue` + `parentId: "WHO-6"` (identifier or UUID).
- Project state: `save_project` + `state: "In Progress"` (resolves to `statusId`).
