#!/usr/bin/env node

const checks = [
  "Double-submit quote send: second request must fail safely without corrupting status.",
  "Project status transitions appear in admin timeline with actor and timestamp.",
  "Notification write failures do not roll back successful business actions.",
  "Invalid file source/kind/revision combinations return clear 4xx errors.",
  "Client final-file download is blocked when payment policy requires it.",
  "Policy URLs are hidden when unset and shown when configured.",
];

console.log("[verify:tranche] Manual regression checklist");
for (const [index, check] of checks.entries()) {
  console.log(`${index + 1}. ${check}`);
}
console.log("");
console.log(
  "Run sequence: npm run lint && npm run build && npm run verify:tranche-checklist",
);
