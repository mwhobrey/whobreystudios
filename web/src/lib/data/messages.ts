import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";
import type { CreateMessageBody } from "@/lib/schemas/message";
import { createMessageBodySchema } from "@/lib/schemas/message";
import { fanOutEventBestEffort, getProjectAudience } from "@/lib/data/notifications";
import { userCanAccessProject, type ProjectViewer } from "@/lib/data/projects";

const messageAuthorSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
} as const;

export const messageInclude = {
  author: { select: messageAuthorSelect },
  parent: {
    select: {
      id: true,
      body: true,
      author: { select: { name: true, email: true } },
    },
  },
} satisfies Prisma.MessageInclude;

export type MessageWithThread = Prisma.MessageGetPayload<{ include: typeof messageInclude }>;

export class ProjectMessageError extends Error {
  constructor(
    message: string,
    public readonly code: "forbidden" | "invalid_parent",
  ) {
    super(message);
    this.name = "ProjectMessageError";
  }
}

export async function listMessagesForProject(projectId: string, viewer: ProjectViewer) {
  const ok = await userCanAccessProject(projectId, viewer);
  if (!ok) return [];

  return getPrisma().message.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
    include: messageInclude,
  });
}

export async function insertProjectMessage(
  projectId: string,
  viewer: ProjectViewer,
  raw: CreateMessageBody,
) {
  const parsed = createMessageBodySchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.flatten().formErrors.join(" ") || "Invalid message.");
  }

  const ok = await userCanAccessProject(projectId, viewer);
  if (!ok) throw new ProjectMessageError("Forbidden", "forbidden");

  const { body, parentId } = parsed.data;
  if (parentId) {
    const parent = await getPrisma().message.findFirst({
      where: { id: parentId, projectId },
      select: { id: true },
    });
    if (!parent) {
      throw new ProjectMessageError("Reply target not found on this project.", "invalid_parent");
    }
  }

  const created = await getPrisma().message.create({
    data: {
      projectId,
      authorId: viewer.id,
      body,
      parentId: parentId ?? null,
    },
    include: messageInclude,
  });

  const audience = await getProjectAudience(projectId);
  if (audience) {
    const recipients =
      viewer.role === "admin"
        ? audience.clientUserId
          ? [audience.clientUserId]
          : []
        : audience.adminUserIds;
    const extraEmails =
      viewer.role === "admin" && !audience.clientUserId
        ? [audience.contactEmail]
        : undefined;
    await fanOutEventBestEffort(recipients, {
      actorUserId: viewer.id,
      projectId,
      type: "message_posted",
      title: "New project message",
      body: created.body.slice(0, 180),
      payload: { parentId: created.parentId },
    }, extraEmails ? { extraEmails } : undefined);
  }

  return created;
}
