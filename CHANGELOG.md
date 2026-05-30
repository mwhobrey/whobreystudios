# Changelog

All notable changes to the Whobrey Studios client portal (`web/`) are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning uses [SemVer](https://semver.org/) on `web/package.json`.

## [0.2.0] - 2026-05-30

### Added

- **Landing page Option A cards** — My Project, New Project, and Shop as the primary home navigation (`LandingNavCards`).
- **`/faq`** — Expanded workflow FAQ (quotes, revisions, file delivery, shop, accounts) migrated from the former landing capability strip.
- **Two-step project intake** — Service picker at `/projects/new`, details form at `/projects/new/details?category=…`.
- **Marketing chrome** — `MarketingHeader` (hamburger menu) on the home page; `IntakeShell` on intake routes.
- **`lib/project-intake/categories.ts`** — Static intake categories aligned with the client wireframe (Digital, 3D Printing, Vinyl, Photo, Aerial, Something Else).

### Changed

- Home page hero retained; capability strip and bottom CTA replaced by nav cards and FAQ link.
- Guest and signed-in client intake unified through the new flow (clients retain attachment upload on step 2).
- Portal nav **Start project** and portal empty-state CTAs point to `/projects/new`.
- `/request` and `/portal/projects/new` redirect to `/projects/new` for bookmarks and old links.

### Removed

- Monolithic guest request form (`app/request/form.tsx`) and portal new-project form (`app/portal/projects/new/form.tsx`) — replaced by `IntakeDetailsForm`.

## [0.1.0] - 2026-05-22

Initial shipped MVP: auth, guest/client intake, quotes, Stripe payments, files, revisions, notifications, admin settings, marketing landing, and demo deployment runbook.

[0.2.0]: https://github.com/mwhobrey/whobreystudios/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/mwhobrey/whobreystudios/releases/tag/v0.1.0
