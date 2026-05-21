import "server-only";

import type { Quote } from "@/generated/prisma/client";
import { getWorkspaceSettings } from "@/lib/data/workspace-settings";

export function resolveDepositPercent(quote: Pick<Quote, "depositPercent">, defaultPercent: number) {
  const pct = quote.depositPercent ?? defaultPercent;
  return Math.min(99, Math.max(1, pct));
}

export function computeDepositAndBalanceCents(totalCents: number, depositPercent: number) {
  const depositCents = Math.round((totalCents * depositPercent) / 100);
  const balanceCents = Math.max(0, totalCents - depositCents);
  return { depositCents, balanceCents, depositPercent };
}

export async function computeQuotePaymentBreakdown(quote: Pick<Quote, "totalCents" | "depositPercent">) {
  const settings = await getWorkspaceSettings();
  const depositPercent = resolveDepositPercent(quote, settings.defaultDepositPercent);
  return {
    ...computeDepositAndBalanceCents(quote.totalCents, depositPercent),
    totalCents: quote.totalCents,
  };
}

/** Final checkout: total minus any paid deposit on this project. */
export function computeFinalCheckoutCents(totalCents: number, depositPaidCents: number) {
  return Math.max(0, totalCents - depositPaidCents);
}
