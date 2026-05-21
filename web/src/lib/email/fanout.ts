import "server-only";

import type { NotificationType } from "@/generated/prisma/enums";
import { isEmailConfigured } from "@/lib/email/resend";
import { enqueueEmail } from "@/lib/email/outbox";
import { getPrisma } from "@/lib/prisma";

type EventInput = {
  actorUserId?: string | null;
  projectId?: string | null;
  title: string;
  body?: string | null;
  type: NotificationType;
  payload?: unknown;
};

export type EmailFanOutOptions = {
  /** Guest or extra recipients (e.g. project.contactEmail before account link). */
  extraEmails?: string[];
  /** Resolve admin portal links in templates. */
  forAdmin?: boolean;
  quoteVersion?: number;
  paymentType?: "deposit" | "final";
  amountLabel?: string;
};

const EMAIL_ENABLED_TYPES = new Set<NotificationType>([
  "project_created",
  "quote_sent",
  "quote_approved",
  "quote_declined",
  "message_posted",
  "file_uploaded",
  "project_status_changed",
]);

function notificationTypeToTemplateKey(
  type: NotificationType,
  options?: EmailFanOutOptions,
): string {
  if (type === "project_status_changed" && options?.paymentType) return "payment_received";
  return type;
}

async function resolveUserEmails(userIds: string[]): Promise<Map<string, string>> {
  const unique = [...new Set(userIds)].filter(Boolean);
  if (unique.length === 0) return new Map();
  const rows = await getPrisma().user.findMany({
    where: { id: { in: unique } },
    select: { id: true, email: true },
  });
  const map = new Map<string, string>();
  for (const row of rows) {
    if (row.email) map.set(row.id, row.email.trim().toLowerCase());
  }
  return map;
}

async function loadProjectEmailContext(projectId: string | null | undefined) {
  if (!projectId) return null;
  return getPrisma().project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      projectType: true,
      contactEmail: true,
      fullName: true,
      clientUserId: true,
    },
  });
}

async function loadActorName(actorUserId: string | null | undefined) {
  if (!actorUserId) return null;
  const user = await getPrisma().user.findUnique({
    where: { id: actorUserId },
    select: { name: true, email: true },
  });
  return user?.name ?? user?.email ?? null;
}

/**
 * Enqueue transactional emails for a notification event (WHO-23).
 * Call after or alongside in-app notifications.
 */
export async function enqueueEmailsForEventBestEffort(
  recipientUserIds: string[],
  event: EventInput,
  options?: EmailFanOutOptions,
): Promise<void> {
  if (!isEmailConfigured()) return;
  if (!EMAIL_ENABLED_TYPES.has(event.type)) return;

  try {
    const userEmails = await resolveUserEmails(recipientUserIds);
    const addresses = new Set<string>();

    for (const id of recipientUserIds) {
      const email = userEmails.get(id);
      if (email) addresses.add(email);
    }

    for (const raw of options?.extraEmails ?? []) {
      const email = raw.trim().toLowerCase();
      if (email) addresses.add(email);
    }

    if (event.actorUserId) {
      const actorEmail = userEmails.get(event.actorUserId);
      if (actorEmail) addresses.delete(actorEmail);
      if (!actorEmail) {
        const actor = await getPrisma().user.findUnique({
          where: { id: event.actorUserId },
          select: { email: true },
        });
        if (actor?.email) addresses.delete(actor.email.trim().toLowerCase());
      }
    }

    if (addresses.size === 0) return;

    const project = await loadProjectEmailContext(event.projectId);
    const actorName = await loadActorName(event.actorUserId);
    const templateKey = notificationTypeToTemplateKey(event.type, options);

    const payload = {
      title: event.title,
      body: event.body ?? null,
      projectId: event.projectId ?? project?.id ?? null,
      projectType: project?.projectType ?? null,
      actorName,
      quoteVersion: options?.quoteVersion ?? null,
      paymentType: options?.paymentType ?? null,
      amountLabel: options?.amountLabel ?? null,
      forAdmin: options?.forAdmin ?? false,
    };

    for (const toEmail of addresses) {
      const idempotencyKey = [
        templateKey,
        event.projectId ?? "no-project",
        toEmail,
        event.title.slice(0, 80),
        options?.quoteVersion ?? "",
        options?.paymentType ?? "",
      ].join(":");

      await enqueueEmail({
        toEmail,
        templateKey,
        payload,
        idempotencyKey,
      });
    }
  } catch (error) {
    console.error("[email-fanout] enqueue failed", {
      type: event.type,
      projectId: event.projectId ?? null,
      error: error instanceof Error ? error.message : "unknown_error",
    });
  }
}
