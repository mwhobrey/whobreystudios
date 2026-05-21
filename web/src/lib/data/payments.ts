import "server-only";

import type { PaymentType } from "@/generated/prisma/enums";
import { getPrisma } from "@/lib/prisma";

export async function findPaymentByStripeSessionId(sessionId: string) {
  return getPrisma().paymentRecord.findUnique({
    where: { stripeSessionId: sessionId },
    include: { project: true, quote: true },
  });
}

export async function findPaidDepositForProject(projectId: string) {
  return getPrisma().paymentRecord.findFirst({
    where: { projectId, type: "deposit", status: "paid" },
    orderBy: { paidAt: "desc" },
  });
}

export async function sumPaidDepositCents(projectId: string) {
  const row = await findPaidDepositForProject(projectId);
  return row?.amountCents ?? 0;
}

export async function findLatestFinalPayment(projectId: string) {
  return getPrisma().paymentRecord.findFirst({
    where: { projectId, type: "final" },
    orderBy: { createdAt: "desc" },
  });
}

export async function hasPaidFinalPayment(projectId: string) {
  const row = await getPrisma().paymentRecord.findFirst({
    where: { projectId, type: "final", status: "paid" },
    select: { id: true },
  });
  return Boolean(row);
}

export async function createPendingPaymentRecord(input: {
  projectId: string;
  quoteId?: string | null;
  type: PaymentType;
  amountCents: number;
  stripeSessionId: string;
  metadata?: unknown;
}) {
  return getPrisma().paymentRecord.create({
    data: {
      projectId: input.projectId,
      quoteId: input.quoteId ?? null,
      type: input.type,
      status: "pending",
      amountCents: input.amountCents,
      stripeSessionId: input.stripeSessionId,
      metadataJson: input.metadata ? JSON.stringify(input.metadata) : null,
    },
  });
}

const paymentWithProject = {
  include: { project: true, quote: true },
} as const;

export async function markPaymentPaidFromWebhook(input: {
  paymentId: string;
  stripeEventId: string;
  stripePaymentIntentId?: string | null;
}) {
  const existing = await getPrisma().paymentRecord.findUnique({
    where: { stripeEventId: input.stripeEventId },
    ...paymentWithProject,
  });
  if (existing) return existing;

  try {
    await getPrisma().paymentRecord.update({
      where: { id: input.paymentId },
      data: {
        status: "paid",
        paidAt: new Date(),
        stripeEventId: input.stripeEventId,
        stripePaymentIntentId: input.stripePaymentIntentId ?? undefined,
      },
    });
  } catch (e) {
    const dup = await getPrisma().paymentRecord.findUnique({
      where: { id: input.paymentId },
      include: { project: true, quote: true },
    });
    if (dup?.status === "paid") return dup;
    throw e;
  }

  return getPrisma().paymentRecord.findUniqueOrThrow({
    where: { id: input.paymentId },
    ...paymentWithProject,
  });
}

export async function markPaymentCancelled(paymentId: string) {
  return getPrisma().paymentRecord.updateMany({
    where: { id: paymentId, status: "pending" },
    data: { status: "cancelled" },
  });
}

export async function cancelPendingPaymentsForProject(
  projectId: string,
  type: PaymentType,
) {
  return getPrisma().paymentRecord.updateMany({
    where: { projectId, type, status: "pending" },
    data: { status: "cancelled" },
  });
}

export type PaymentRecordRow = Awaited<ReturnType<typeof findPaymentByStripeSessionId>>;
