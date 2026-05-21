#!/usr/bin/env node

const checks = [
  "Double-submit quote send: second request must fail safely without corrupting status.",
  "Project status transitions appear in admin timeline with actor and timestamp.",
  "Notification write failures do not roll back successful business actions.",
  "Invalid file source/kind/revision combinations return clear 4xx errors.",
  "Client final-file download is blocked when payment policy requires it.",
  "Policy URLs are hidden when unset and shown when configured.",
  "Quote approve moves project to awaiting_deposit; deposit Checkout only in that status.",
  "Stripe webhook (checkout.session.completed) moves deposit paid to in_progress and final to completed.",
  "Replay same Stripe event id: no duplicate PaymentRecord or status transition.",
  "Post-deposit add-on line items increase final balance without a second deposit session.",
];

console.log("[verify:tranche] Manual regression checklist");
for (const [index, check] of checks.entries()) {
  console.log(`${index + 1}. ${check}`);
}
console.log("");
console.log(
  "Run sequence: npm run lint && npm run build && npm run verify:payment-amounts && npm run verify:tranche-checklist",
);
