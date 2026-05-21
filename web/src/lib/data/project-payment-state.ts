import "server-only";

import { findPaidDepositForProject, hasPaidFinalPayment } from "@/lib/data/payments";
import { getLatestQuoteForProject } from "@/lib/data/quotes";
import {
  computeFinalCheckoutCents,
  computeQuotePaymentBreakdown,
} from "@/lib/payments/amounts";

export type ProjectPaymentState = {
  hasApprovedQuote: boolean;
  canPayDeposit: boolean;
  canPayBalance: boolean;
  depositCents: number;
  balanceDueCents: number;
  depositPercent: number;
  totalCents: number;
  depositPaid: boolean;
  finalPaid: boolean;
};

export async function getProjectPaymentState(projectId: string): Promise<ProjectPaymentState> {
  const quote = await getLatestQuoteForProject(projectId);
  if (!quote || quote.status !== "approved") {
    return {
      hasApprovedQuote: false,
      canPayDeposit: false,
      canPayBalance: false,
      depositCents: 0,
      balanceDueCents: 0,
      depositPercent: 0,
      totalCents: 0,
      depositPaid: false,
      finalPaid: false,
    };
  }

  const breakdown = await computeQuotePaymentBreakdown(quote);
  const depositPaidRow = await findPaidDepositForProject(projectId);
  const depositPaid = Boolean(depositPaidRow);
  const finalPaid = await hasPaidFinalPayment(projectId);
  const balanceDueCents = computeFinalCheckoutCents(
    quote.totalCents,
    depositPaidRow?.amountCents ?? 0,
  );

  return {
    hasApprovedQuote: true,
    canPayDeposit: !depositPaid && breakdown.depositCents >= 50,
    canPayBalance: depositPaid && !finalPaid && balanceDueCents >= 50,
    depositCents: breakdown.depositCents,
    balanceDueCents,
    depositPercent: breakdown.depositPercent,
    totalCents: quote.totalCents,
    depositPaid,
    finalPaid,
  };
}
