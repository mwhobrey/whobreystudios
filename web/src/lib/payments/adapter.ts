import "server-only";

import { isStripeConfigured } from "@/lib/payments/stripe-client";
import { StripePaymentAdapter } from "@/lib/payments/stripe-adapter";

export type PaymentAccessCheckInput = {
  projectId: string;
  userId: string;
};

export type PaymentInvoiceStatus = "none" | "pending" | "paid" | "failed" | "cancelled";

export type PaymentInvoiceIntent = {
  projectId: string;
  quoteId?: string;
  amountCents: number;
  currency: "usd";
  customerUserId: string;
  reason: "deposit" | "final_delivery";
};

export type PaymentAdapter = {
  hasClearedFinalPayment(input: PaymentAccessCheckInput): Promise<boolean>;
  getInvoiceStatus(input: PaymentAccessCheckInput): Promise<PaymentInvoiceStatus>;
  ensureInvoiceIntent(input: PaymentInvoiceIntent): Promise<{ providerRef: string | null }>;
};

export class NoopPaymentAdapter implements PaymentAdapter {
  async hasClearedFinalPayment(input: PaymentAccessCheckInput): Promise<boolean> {
    void input;
    return false;
  }

  async getInvoiceStatus(input: PaymentAccessCheckInput): Promise<PaymentInvoiceStatus> {
    void input;
    return "none";
  }

  async ensureInvoiceIntent(input: PaymentInvoiceIntent): Promise<{ providerRef: string | null }> {
    void input;
    return { providerRef: null };
  }
}

export const paymentAdapter: PaymentAdapter = isStripeConfigured()
  ? new StripePaymentAdapter()
  : new NoopPaymentAdapter();
