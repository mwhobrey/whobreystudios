/**
 * WHO-31 — offline checks for deposit/balance math (no Stripe API).
 */
import assert from "node:assert/strict";

function computeDepositAndBalanceCents(totalCents, depositPercent) {
  const depositCents = Math.round((totalCents * depositPercent) / 100);
  const balanceCents = Math.max(0, totalCents - depositCents);
  return { depositCents, balanceCents };
}

function computeFinalCheckoutCents(totalCents, depositPaidCents) {
  return Math.max(0, totalCents - depositPaidCents);
}

const forty = computeDepositAndBalanceCents(150_000, 40);
assert.equal(forty.depositCents, 60_000);
assert.equal(forty.balanceCents, 90_000);

const addon = computeFinalCheckoutCents(175_000, 60_000);
assert.equal(addon, 115_000);

console.log("payment-amounts-check: ok");
