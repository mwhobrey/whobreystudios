import "server-only";

import type {
  PaymentAccessCheckInput,
  PaymentAdapter,
  PaymentInvoiceIntent,
  PaymentInvoiceStatus,
} from "@/lib/payments/adapter";
import {
  findLatestFinalPayment,
  hasPaidFinalPayment,
} from "@/lib/data/payments";
import { createProjectCheckoutSession } from "@/lib/payments/checkout";
import { getPrisma } from "@/lib/prisma";

function mapPaymentStatus(status: string): PaymentInvoiceStatus {
  switch (status) {
    case "paid":
      return "paid";
    case "pending":
      return "pending";
    case "failed":
      return "failed";
    case "cancelled":
      return "cancelled";
    default:
      return "none";
  }
}

export class StripePaymentAdapter implements PaymentAdapter {
  async hasClearedFinalPayment(input: PaymentAccessCheckInput): Promise<boolean> {
    return hasPaidFinalPayment(input.projectId);
  }

  async getInvoiceStatus(input: PaymentAccessCheckInput): Promise<PaymentInvoiceStatus> {
    const row = await findLatestFinalPayment(input.projectId);
    if (!row) return "none";
    return mapPaymentStatus(row.status);
  }

  async ensureInvoiceIntent(input: PaymentInvoiceIntent): Promise<{ providerRef: string | null }> {
    const user = await getPrisma().user.findUnique({
      where: { id: input.customerUserId },
      select: { id: true, email: true },
    });
    if (!user?.email) {
      throw new Error("Client email is required for Stripe Checkout.");
    }

    const type = input.reason === "deposit" ? "deposit" : "final";
    const { url } = await createProjectCheckoutSession({
      projectId: input.projectId,
      clientUserId: input.customerUserId,
      clientEmail: user.email,
      type,
    });
    return { providerRef: url };
  }
}
