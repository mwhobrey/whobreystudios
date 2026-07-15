import "server-only";

import type Stripe from "stripe";
import { fanOutEventBestEffort, listAdminUserIds } from "@/lib/data/notifications";
import {
  findPaymentByStripeSessionId,
  markPaymentCancelled,
  markPaymentPaidFromWebhook,
} from "@/lib/data/payments";
import { transitionProjectStatus } from "@/lib/data/projects";
import { getStripeClient } from "@/lib/payments/stripe-client";

export async function handleStripeWebhookEvent(event: Stripe.Event) {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await handleCheckoutSessionCompleted(session, event.id);
    return;
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const payment = session.id
      ? await findPaymentByStripeSessionId(session.id)
      : null;
    if (payment?.status === "pending") {
      await markPaymentCancelled(payment.id);
    }
  }
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
  stripeEventId: string,
) {
  if (!session.id) return;

  const payment = await findPaymentByStripeSessionId(session.id);
  if (!payment) {
    return;
  }

  if (payment.status === "paid") {
    return;
  }

  const { getPrisma } = await import("@/lib/prisma");
  const existingByEvent = await getPrisma().paymentRecord.findUnique({
    where: { stripeEventId },
  });
  if (existingByEvent) return;

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  const paidRecord = await markPaymentPaidFromWebhook({
    paymentId: payment.id,
    stripeEventId,
    stripePaymentIntentId: paymentIntentId,
  });

  const project = paidRecord.project;
  if (!project) return;

  if (paidRecord.type === "deposit") {
    if (project.status === "awaiting_deposit") {
      await transitionProjectStatus({
        projectId: project.id,
        to: "in_progress",
        notifyClient: true,
        title: "Deposit received",
        body: "Your deposit cleared. Work is underway.",
      });
    }
  } else if (paidRecord.type === "final") {
    if (project.status === "awaiting_final_payment") {
      await transitionProjectStatus({
        projectId: project.id,
        to: "completed",
        notifyClient: true,
        title: "Final payment received",
        body: "Thank you. Your final files are now available to download.",
      });
    } else if (project.status !== "completed" && project.status !== "cancelled") {
      await transitionProjectStatus({
        projectId: project.id,
        to: "completed",
        notifyClient: true,
        title: "Payment received",
        body: "Thank you. Your payment was received.",
      });
    }
  }

  const adminIds = await listAdminUserIds();
  const paymentEvent = {
    actorUserId: null,
    projectId: project.id,
    type: "project_status_changed" as const,
    title: paidRecord.type === "deposit" ? "Deposit paid" : "Final payment paid",
    body: `Stripe confirmed ${paidRecord.type} payment for ${project.projectType}.`,
  };

  await fanOutEventBestEffort(adminIds, paymentEvent, {
    forAdmin: true,
    paymentType: paidRecord.type,
  });

  const clientRecipients = project.clientUserId ? [project.clientUserId] : [];
  const extraEmails =
    !project.clientUserId && project.contactEmail ? [project.contactEmail] : undefined;
  await fanOutEventBestEffort(clientRecipients, paymentEvent, {
    extraEmails,
    paymentType: paidRecord.type,
  });
}

export function constructStripeEvent(payload: string, signature: string) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured.");
  }
  return getStripeClient().webhooks.constructEvent(payload, signature, secret);
}
