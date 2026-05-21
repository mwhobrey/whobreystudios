import "server-only";

import type { PaymentType } from "@/generated/prisma/enums";
import { clientProjectAccessWhere } from "@/lib/data/projects";
import { getLatestQuoteForProject } from "@/lib/data/quotes";
import { cancelPendingPaymentsForProject, createPendingPaymentRecord } from "@/lib/data/payments";
import { getPrisma } from "@/lib/prisma";
import { getAppBaseUrl, getStripeClient } from "@/lib/payments/stripe-client";

export class CheckoutError extends Error {
  constructor(
    public readonly code: "NOT_FOUND" | "FORBIDDEN" | "INVALID" | "CONFIG",
    message: string,
  ) {
    super(message);
    this.name = "CheckoutError";
  }
}

export async function createProjectCheckoutSession(input: {
  projectId: string;
  clientUserId: string;
  clientEmail: string;
  type: PaymentType;
}) {
  const project = await getPrisma().project.findFirst({
    where: {
      id: input.projectId,
      ...clientProjectAccessWhere({
        id: input.clientUserId,
        email: input.clientEmail,
      }),
    },
    select: { id: true, status: true, projectType: true },
  });
  if (!project) {
    throw new CheckoutError("NOT_FOUND", "Project not found.");
  }

  const quote = await getLatestQuoteForProject(input.projectId);
  if (!quote || quote.status !== "approved") {
    throw new CheckoutError("INVALID", "An approved quote is required before payment.");
  }

  const { getProjectPaymentState } = await import("@/lib/data/project-payment-state");
  const paymentState = await getProjectPaymentState(input.projectId);

  if (input.type === "deposit") {
    if (!paymentState.canPayDeposit) {
      throw new CheckoutError("INVALID", "Deposit is not available for this project right now.");
    }
  } else if (!paymentState.canPayBalance) {
    throw new CheckoutError("INVALID", "No balance is due on this project right now.");
  }

  const amountCents =
    input.type === "deposit" ? paymentState.depositCents : paymentState.balanceDueCents;
  if (amountCents < 50) {
    throw new CheckoutError("INVALID", "Payment amount is too small to charge.");
  }

  await cancelPendingPaymentsForProject(input.projectId, input.type);

  const base = getAppBaseUrl();
  const stripe = getStripeClient();
  const returnPath = `/portal/projects/${input.projectId}`;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: input.clientEmail,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: amountCents,
          product_data: {
            name:
              input.type === "deposit"
                ? `Deposit — ${project.projectType}`
                : `Final payment — ${project.projectType}`,
          },
        },
      },
    ],
    metadata: {
      projectId: input.projectId,
      quoteId: quote.id,
      paymentType: input.type,
    },
    success_url: `${base}${returnPath}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}${returnPath}?payment=cancelled`,
  });

  if (!session.url) {
    throw new CheckoutError("CONFIG", "Stripe did not return a checkout URL.");
  }

  await createPendingPaymentRecord({
    projectId: input.projectId,
    quoteId: quote.id,
    type: input.type,
    amountCents,
    stripeSessionId: session.id,
    metadata: { paymentType: input.type },
  });

  return { url: session.url, sessionId: session.id };
}
