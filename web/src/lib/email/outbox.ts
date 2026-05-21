import "server-only";

import type { EmailOutboxStatus } from "@/generated/prisma/enums";
import { getPrisma } from "@/lib/prisma";

const MAX_ATTEMPTS = 5;

export type EnqueueEmailInput = {
  toEmail: string;
  templateKey: string;
  payload: Record<string, unknown>;
  idempotencyKey?: string;
};

/**
 * Insert a pending outbox row. Never throws to callers — logs on failure.
 * WHO-22 adds `processEmailOutbox`; WHO-23 adds template rendering before send.
 */
export async function enqueueEmail(input: EnqueueEmailInput): Promise<{ id: string } | null> {
  const toEmail = input.toEmail.trim().toLowerCase();
  if (!toEmail) return null;

  try {
    const row = await getPrisma().emailOutbox.create({
      data: {
        toEmail,
        templateKey: input.templateKey,
        payloadJson: JSON.stringify(input.payload),
        idempotencyKey: input.idempotencyKey ?? null,
      },
      select: { id: true },
    });
    return row;
  } catch (error) {
    // Unique violation on idempotencyKey — treat as success (already queued).
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return null;
    }
    console.error("[email-outbox] enqueue failed", {
      templateKey: input.templateKey,
      toEmail,
      error: error instanceof Error ? error.message : "unknown_error",
    });
    return null;
  }
}

export type ProcessOutboxResult = {
  processed: number;
  sent: number;
  failed: number;
  skipped: number;
};

/**
 * Drain pending rows. Full send logic completed in WHO-22 (Resend + retry).
 * Phase 0: stub returns zero until processor is wired.
 */
export async function processEmailOutbox(_batchSize = 20): Promise<ProcessOutboxResult> {
  return { processed: 0, sent: 0, failed: 0, skipped: 0 };
}

export async function countPendingOutbox(): Promise<number> {
  return getPrisma().emailOutbox.count({
    where: { status: "pending" as EmailOutboxStatus },
  });
}
