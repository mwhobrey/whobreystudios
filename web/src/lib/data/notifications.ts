import "server-only";

import type { NotificationType, UserRole } from "@/generated/prisma/enums";
import {
  enqueueEmailsForEventBestEffort,
  type EmailFanOutOptions,
} from "@/lib/email/fanout";
import { getPrisma } from "@/lib/prisma";

type EventInput = {
  actorUserId?: string | null;
  projectId?: string | null;
  title: string;
  body?: string | null;
  type: NotificationType;
  payload?: unknown;
};

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function createManyWithRetry(
  rows: {
    recipientUserId: string;
    actorUserId: string | null;
    projectId: string | null;
    type: NotificationType;
    title: string;
    body: string | null;
    payloadJson: string | null;
  }[],
) {
  let lastErr: unknown = null;
  const delays = [0, 60, 180];
  for (const delay of delays) {
    if (delay > 0) await sleep(delay);
    try {
      await getPrisma().notification.createMany({ data: rows });
      return;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

export async function createNotifications(recipientUserIds: string[], event: EventInput) {
  const unique = [...new Set(recipientUserIds)].filter(Boolean);
  if (unique.length === 0) return;

  const rows = unique
    .filter((id) => id !== event.actorUserId)
    .map((recipientUserId) => ({
      recipientUserId,
      actorUserId: event.actorUserId ?? null,
      projectId: event.projectId ?? null,
      type: event.type,
      title: event.title,
      body: event.body ?? null,
      payloadJson: event.payload ? JSON.stringify(event.payload) : null,
    }));

  if (rows.length === 0) return;
  await createManyWithRetry(rows);
}

export async function createNotificationsBestEffort(recipientUserIds: string[], event: EventInput) {
  try {
    await createNotifications(recipientUserIds, event);
  } catch (error) {
    console.error("[notifications] fanout failed", {
      projectId: event.projectId ?? null,
      actorUserId: event.actorUserId ?? null,
      recipientCount: recipientUserIds.length,
      type: event.type,
      error: error instanceof Error ? error.message : "unknown_error",
    });
  }
}

/** In-app bell + transactional email outbox (WHO-23). */
export async function fanOutEventBestEffort(
  recipientUserIds: string[],
  event: EventInput,
  emailOptions?: EmailFanOutOptions,
) {
  await createNotificationsBestEffort(recipientUserIds, event);
  await enqueueEmailsForEventBestEffort(recipientUserIds, event, emailOptions);
}

export async function listRecentNotificationsForUser(userId: string, take = 20) {
  return getPrisma().notification.findMany({
    where: { recipientUserId: userId },
    orderBy: { createdAt: "desc" },
    take,
    include: {
      actorUser: { select: { id: true, name: true, email: true } },
      project: { select: { id: true, projectType: true } },
    },
  });
}

export async function getUnreadNotificationCount(userId: string) {
  return getPrisma().notification.count({
    where: { recipientUserId: userId, readAt: null },
  });
}

export async function markNotificationRead(userId: string, notificationId: string) {
  const res = await getPrisma().notification.updateMany({
    where: { id: notificationId, recipientUserId: userId, readAt: null },
    data: { readAt: new Date() },
  });
  return { changed: res.count > 0 };
}

export async function markAllNotificationsRead(userId: string) {
  const res = await getPrisma().notification.updateMany({
    where: { recipientUserId: userId, readAt: null },
    data: { readAt: new Date() },
  });
  return { changedCount: res.count };
}

export async function listAdminUserIds(): Promise<string[]> {
  const rows = await getPrisma().user.findMany({
    where: { role: "admin" as UserRole },
    select: { id: true },
  });
  return rows.map((r) => r.id);
}

export async function getProjectAudience(projectId: string) {
  const project = await getPrisma().project.findUnique({
    where: { id: projectId },
    select: { id: true, clientUserId: true, contactEmail: true },
  });
  if (!project) return null;

  const adminIds = await listAdminUserIds();
  return {
    projectId: project.id,
    clientUserId: project.clientUserId,
    contactEmail: project.contactEmail,
    adminUserIds: adminIds,
  };
}

export async function getUnreadNotificationCountsByProject(userId: string, projectIds: string[]) {
  const ids = [...new Set(projectIds)].filter(Boolean);
  if (ids.length === 0) return new Map<string, number>();
  const rows = await getPrisma().notification.groupBy({
    by: ["projectId"],
    where: {
      recipientUserId: userId,
      readAt: null,
      projectId: { in: ids },
    },
    _count: { _all: true },
  });
  const map = new Map<string, number>();
  for (const row of rows) {
    if (row.projectId) map.set(row.projectId, row._count._all);
  }
  return map;
}
