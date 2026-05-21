import "server-only";

import type { EmailOutboxStatus } from "@/generated/prisma/enums";
import { getPrisma } from "@/lib/prisma";
import { renderEmailTemplate, type EmailTemplatePayload } from "@/lib/email/templates/render";
import { isEmailConfigured, sendEmail } from "@/lib/email/resend";

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

function parsePayloadJson(payloadJson: string): EmailTemplatePayload {
  try {
    const raw = JSON.parse(payloadJson) as Record<string, unknown>;
    return {
      title: typeof raw.title === "string" ? raw.title : "Whobrey Studios",
      body: typeof raw.body === "string" ? raw.body : null,
      projectId: typeof raw.projectId === "string" ? raw.projectId : null,
      projectType: typeof raw.projectType === "string" ? raw.projectType : null,
      actorName: typeof raw.actorName === "string" ? raw.actorName : null,
      quoteVersion: typeof raw.quoteVersion === "number" ? raw.quoteVersion : null,
      paymentType:
        raw.paymentType === "deposit" || raw.paymentType === "final"
          ? raw.paymentType
          : null,
      amountLabel: typeof raw.amountLabel === "string" ? raw.amountLabel : null,
      forAdmin: raw.forAdmin === true,
    };
  } catch {
    return { title: "Whobrey Studios", body: payloadJson };
  }
}

function buildOutboxMessage(
  templateKey: string,
  payloadJson: string,
): { subject: string; html: string; text: string } {
  const payload = parsePayloadJson(payloadJson);
  return renderEmailTemplate(templateKey, payload);
}

function truncateError(message: string, maxLen = 2000): string {
  return message.length <= maxLen ? message : `${message.slice(0, maxLen - 3)}...`;
}

/**
 * Drain pending rows oldest-first. Resend send + retry cap (WHO-22).
 * WHO-23 replaces placeholder subject/body with real templates.
 */
export async function processEmailOutbox(batchSize = 20): Promise<ProcessOutboxResult> {
  const result: ProcessOutboxResult = { processed: 0, sent: 0, failed: 0, skipped: 0 };

  const rows = await getPrisma().emailOutbox.findMany({
    where: { status: "pending" as EmailOutboxStatus },
    orderBy: { createdAt: "asc" },
    take: Math.max(1, Math.min(batchSize, 100)),
  });

  if (rows.length === 0) return result;

  if (!isEmailConfigured()) {
    result.skipped = rows.length;
    return result;
  }

  const prisma = getPrisma();

  for (const row of rows) {
    result.processed += 1;
    const attempts = row.attempts + 1;
    const { subject, html, text } = buildOutboxMessage(row.templateKey, row.payloadJson);

    try {
      await sendEmail({ to: row.toEmail, subject, html, text });
      await prisma.emailOutbox.update({
        where: { id: row.id },
        data: {
          status: "sent",
          attempts,
          lastError: null,
          sentAt: new Date(),
        },
      });
      result.sent += 1;
    } catch (error) {
      const message = truncateError(
        error instanceof Error ? error.message : "send_failed",
      );
      const isFinalFailure = attempts >= MAX_ATTEMPTS;

      await prisma.emailOutbox.update({
        where: { id: row.id },
        data: {
          status: isFinalFailure ? "failed" : "pending",
          attempts,
          lastError: message,
        },
      });

      if (isFinalFailure) {
        result.failed += 1;
      }
    }
  }

  return result;
}

export async function countPendingOutbox(): Promise<number> {
  return getPrisma().emailOutbox.count({
    where: { status: "pending" as EmailOutboxStatus },
  });
}
