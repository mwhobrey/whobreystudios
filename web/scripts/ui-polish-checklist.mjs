#!/usr/bin/env node

const sections = [
  {
    title: "Theme system (Atelier OS)",
    checks: [
      "Tokens in src/app/globals.css render: surface scale, status palette (10+), brand chartreuse + magenta, role gradients (admin warm / portal cool).",
      "Body shows the layered radial mesh + film-grain overlay; reduced-motion preference disables animations.",
      "Wordmark renders on landing, login brand panel, and chrome — monogram inherits currentColor; brand stripe stays var(--brand-primary).",
      "Geist Sans + Geist Mono + Instrument Serif (display) all load via next/font; Instrument Serif is used only on display moments (.ws-display).",
    ],
  },
  {
    title: "Marquee surfaces",
    checks: [
      "Landing (`/`): hero wordmark + tagline + glass project artifact, 3-up capability tiles, CTA strip with both role gradients, footer.",
      "Login: split brand panel + glass auth card, seeded accounts panel, alert states render with new tokens.",
      "Admin dashboard: KPI strip (5 cards), Today's queue with priority sorting, quick-jump tile grid.",
      "Admin projects list: filter pill row (All / Active / status-specific), card-row hybrid with unread accent stripe, empty state surface.",
      "Admin project detail: two-column split with sticky left rail (summary + StatusTimeline + section-jump nav) and stacked work area (Quote / Files / Messages).",
      "Portal dashboard: guidance hero (current statusGuidanceCopy + nextAction), project cards with horizontal pipeline meter, attention glow on cards needing client action.",
      "Portal project detail: hero guidance card, mirrored split layout, locked padlock badge on Files when payment gate engaged.",
      "Portal new request: sectioned cards (Contact / Project / Attachments), drag-drop zone with file chips, FormField primitive everywhere.",
    ],
  },
  {
    title: "Primitives",
    checks: [
      "AppShell renders global chrome (wordmark + role nav + notification bell + sign-out) on every authenticated page.",
      "AppButton supports primary/secondary/danger/ghost, sizes, loading spinner, iconLeft/iconRight, role gradients on primary.",
      "SurfaceCard supports tone variants (default/glass/elevated/sunken) and accent stripe for role-tinted cards.",
      "StatusBadge renders semantic icon + label for all 10 production statuses + 6 forward-compatible aliases.",
      "FormField primitive is the single labeled-input pattern (label + required mark + hint or error).",
      "AlertBanner has tone-based icon, slide-in animation, and uses status tokens (no zinc literals).",
      "EmptyState replaces ad-hoc empty-list copy across portal, admin, files, messages, settings.",
      "StatusTimeline replaces the bullet-list status transition rendering on the admin project detail.",
    ],
  },
  {
    title: "Coherent UX behaviors",
    checks: [
      "Notification bell: glass dropdown with pop-in animation, day grouping (Today/Yesterday/Earlier), per-type icon, click-outside close, unread count chip with brand-primary halo.",
      "Pipeline progress meter (`.ws-pipeline`) lights done/active steps with brand-primary glow on portal cards and project detail hero.",
      "Loading and pending states: AppButton spinner, ws-shimmer skeleton primitive available for future async work.",
      "Sign-out is in the global chrome only — pages do not double-render it via the actions slot.",
      "Focus rings (.ws-focus-ring) are visible and consistent across links, buttons, inputs, and dropdown items.",
    ],
  },
  {
    title: "Token-driven palette swap",
    checks: [
      "All brand-mutable values flow through CSS variables in :root — components reference --brand-*, --role-*-tint, --surface-*, --status-*, never hex literals.",
      "Swapping --brand-primary, --brand-secondary, --role-admin-tint, and --role-portal-tint repaints the entire app without touching components.",
      "Status tones (--status-*) stay independent of brand palette — replacing brand colors must not affect badge readability.",
    ],
  },
];

console.log("[verify:ui-polish] Atelier OS demo theme — manual checklist");
console.log("");
let n = 1;
for (const section of sections) {
  console.log(`### ${section.title}`);
  for (const check of section.checks) {
    console.log(`${n}. ${check}`);
    n += 1;
  }
  console.log("");
}
console.log("Run sequence: npm run lint && npm run build && npm run verify:ui-polish");
