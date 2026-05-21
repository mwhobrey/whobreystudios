#!/usr/bin/env node
/**
 * WHO-29 — offline assertions for quote → payment → file-gate logic.
 * Full E2E still requires Stripe CLI + browser (see docs/demo-deployment-runbook.md).
 */
import assert from "node:assert/strict";

function computeDepositAndBalanceCents(totalCents, depositPercent) {
  const depositCents = Math.round((totalCents * depositPercent) / 100);
  return { depositCents, balanceCents: Math.max(0, totalCents - depositCents) };
}

function computeFinalCheckoutCents(totalCents, depositPaidCents) {
  return Math.max(0, totalCents - depositPaidCents);
}

/** Mirror of key transitions after WHO-6/14. */
const allowed = {
  new_request: ["quote_sent", "cancelled"],
  quote_sent: ["approved", "declined", "on_hold", "cancelled"],
  approved: ["awaiting_deposit", "on_hold", "cancelled"],
  awaiting_deposit: ["in_progress", "on_hold", "cancelled"],
  in_progress: [
    "final_revision",
    "awaiting_final_payment",
    "completed",
    "on_hold",
    "cancelled",
  ],
  awaiting_final_payment: ["completed", "on_hold", "cancelled"],
  completed: [],
  declined: ["quote_sent", "cancelled"],
};

function canTransition(from, to) {
  return (allowed[from] ?? []).includes(to);
}

assert.ok(canTransition("approved", "awaiting_deposit"));
assert.ok(canTransition("awaiting_deposit", "in_progress"));
assert.ok(canTransition("in_progress", "completed"));
assert.equal(canTransition("new_request", "in_progress"), false);

const pay = computeDepositAndBalanceCents(100_00, 40);
assert.equal(pay.depositCents, 40_00);
assert.equal(computeFinalCheckoutCents(100_00, 40_00), 60_00);

console.log("verify-critical-path: ok");
console.log("");
console.log("Manual E2E (Stripe sandbox + Resend):");
console.log("  1. /request → admin quote → client magic link → approve → deposit");
console.log("  2. Admin upload final → client pay balance → download final file");
console.log("  3. stripe listen --forward-to localhost:3000/api/webhooks/stripe");
