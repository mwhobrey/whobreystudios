import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import type { CreateProjectBody } from "@/lib/schemas/project";
import { createProjectBodySchema } from "@/lib/schemas/project";
import { getPrisma } from "@/lib/prisma";
import type { UserRole } from "@/generated/prisma/enums";
import type { ProjectStatus } from "@/generated/prisma/enums";
import { fanOutEventBestEffort, listAdminUserIds } from "@/lib/data/notifications";

const clientUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
} as const;

export const projectWithClient = {
  include: { clientUser: { select: clientUserSelect } },
} as const;

const quotesInclude = {
  orderBy: { version: "desc" as const },
  include: {
    lineItems: { orderBy: { sortOrder: "asc" as const } },
  },
};

export const projectDetailInclude = {
  include: {
    clientUser: { select: clientUserSelect },
    serviceType: { select: { id: true, name: true } },
    quotes: quotesInclude,
  },
} satisfies Prisma.ProjectDefaultArgs;

export function parseCreateProjectJson(json: unknown) {
  return createProjectBodySchema.safeParse(json);
}

export function parseCreateProjectFormData(formData: FormData) {
  const deadlineRaw = formData.get("deadline");
  const deadline =
    typeof deadlineRaw === "string" && deadlineRaw.trim() !== "" ? deadlineRaw : null;

  const stRaw = formData.get("serviceTypeId");
  let serviceTypeId: string | undefined = undefined;
  if (typeof stRaw === "string" && stRaw.trim() !== "" && stRaw !== "__other__") {
    serviceTypeId = stRaw.trim();
  }

  return createProjectBodySchema.safeParse({
    fullName: formData.get("fullName"),
    businessName: emptyToNull(formData.get("businessName")),
    phone: formData.get("phone"),
    contactEmail: formData.get("contactEmail"),
    preferredContactMethod: formData.get("preferredContactMethod"),
    projectType: formData.get("projectType"),
    serviceTypeId,
    deadline,
    notes: emptyToNull(formData.get("notes")),
  });
}

function emptyToNull(value: FormDataEntryValue | null): string | null {
  if (value == null || value === "") return null;
  return String(value);
}

/** Viewer identity for project read/write authorization. */
export type ProjectViewer = {
  id: string;
  role: UserRole;
  /** Required for client contactEmail matching on unlinked projects. */
  email?: string;
};

/** Prisma filter: client owns the row or unlinked row matches their email. */
export function clientProjectAccessWhere(viewer: {
  id: string;
  email: string;
}): Prisma.ProjectWhereInput {
  const email = viewer.email.trim();
  return {
    OR: [
      { clientUserId: viewer.id },
      {
        clientUserId: null,
        contactEmail: { equals: email, mode: "insensitive" },
      },
    ],
  };
}

export async function linkProjectsByContactEmail(userId: string, email: string) {
  const normalized = email.trim();
  if (!normalized) return { count: 0 };
  const result = await getPrisma().project.updateMany({
    where: {
      clientUserId: null,
      contactEmail: { equals: normalized, mode: "insensitive" },
    },
    data: { clientUserId: userId },
  });
  return result;
}

export async function insertProject(clientUserId: string | null, data: CreateProjectBody) {
  let projectTypeLabel = data.projectType.trim();
  const serviceTypeId: string | null = data.serviceTypeId ?? null;

  if (serviceTypeId) {
    const st = await getPrisma().serviceType.findFirst({
      where: { id: serviceTypeId, isActive: true },
      select: { id: true, name: true },
    });
    if (!st) {
      throw new Error("INVALID_SERVICE_TYPE");
    }
    projectTypeLabel = st.name;
  }

  const created = await getPrisma().project.create({
    data: {
      clientUserId,
      serviceTypeId,
      fullName: data.fullName,
      businessName: data.businessName ?? null,
      phone: data.phone,
      contactEmail: data.contactEmail,
      preferredContactMethod: data.preferredContactMethod,
      projectType: projectTypeLabel,
      deadline: data.deadline ?? null,
      notes: data.notes ?? null,
    },
    ...projectWithClient,
  });

  const adminIds = await listAdminUserIds();
  await fanOutEventBestEffort(
    adminIds,
    {
      actorUserId: clientUserId,
      projectId: created.id,
      type: "project_created",
      title: "New project request",
      body: `${created.fullName} submitted ${created.projectType}.`,
    },
    { forAdmin: true },
  );

  return created;
}

export async function listProjectsAdminPaginated(page: number, limit: number) {
  const skip = (page - 1) * limit;
  const [projects, total] = await Promise.all([
    getPrisma().project.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
      ...projectWithClient,
    }),
    getPrisma().project.count(),
  ]);
  return {
    projects,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function listProjectsForClient(
  viewer: { id: string; email: string },
  take = 50,
) {
  return getPrisma().project.findMany({
    where: clientProjectAccessWhere(viewer),
    orderBy: { createdAt: "desc" },
    take,
    ...projectWithClient,
  });
}

export async function getProjectForViewer(projectId: string, viewer: ProjectViewer) {
  return getPrisma().project.findFirst({
    where: {
      id: projectId,
      ...(viewer.role === "client" && viewer.email
        ? clientProjectAccessWhere({ id: viewer.id, email: viewer.email })
        : viewer.role === "client"
          ? { clientUserId: viewer.id }
          : {}),
    },
    ...projectDetailInclude,
  });
}

/** Whether this viewer may read or post on the project (admin: any; client: own or email match). */
export async function userCanAccessProject(
  projectId: string,
  viewer: ProjectViewer,
): Promise<boolean> {
  const row = await getPrisma().project.findFirst({
    where: {
      id: projectId,
      ...(viewer.role === "client" && viewer.email
        ? clientProjectAccessWhere({ id: viewer.id, email: viewer.email })
        : viewer.role === "client"
          ? { clientUserId: viewer.id }
          : {}),
    },
    select: { id: true },
  });
  return !!row;
}

export class ProjectTransitionError extends Error {
  constructor(
    public readonly code: "not_found" | "invalid_transition",
    message: string,
  ) {
    super(message);
    this.name = "ProjectTransitionError";
  }
}

const allowedTransitions: Record<ProjectStatus, ProjectStatus[]> = {
  new_request: ["quote_sent", "on_hold", "cancelled"],
  quote_sent: ["approved", "awaiting_deposit", "declined", "on_hold", "cancelled"],
  approved: ["awaiting_deposit", "on_hold", "cancelled"],
  awaiting_deposit: ["in_progress", "on_hold", "cancelled"],
  in_progress: ["final_revision", "awaiting_final_payment", "completed", "on_hold", "cancelled"],
  final_revision: ["awaiting_final_payment", "in_progress", "on_hold", "cancelled"],
  awaiting_final_payment: ["completed", "on_hold", "cancelled"],
  completed: [],
  declined: ["new_request", "cancelled", "on_hold"],
  on_hold: ["new_request", "in_progress", "cancelled"],
  cancelled: [],
};

export function canTransitionProjectStatus(from: ProjectStatus, to: ProjectStatus): boolean {
  if (from === to) return true;
  return allowedTransitions[from].includes(to);
}

export function listNextProjectStatuses(from: ProjectStatus): ProjectStatus[] {
  return allowedTransitions[from] ?? [];
}

export async function transitionProjectStatus(input: {
  projectId: string;
  to: ProjectStatus;
  actorUserId?: string | null;
  notifyClient?: boolean;
  title?: string;
  body?: string | null;
  reason?: string | null;
  metadata?: unknown;
}) {
  const project = await getPrisma().project.findUnique({
    where: { id: input.projectId },
    select: {
      id: true,
      status: true,
      clientUserId: true,
      projectType: true,
      contactEmail: true,
    },
  });
  if (!project) throw new ProjectTransitionError("not_found", "Project not found.");
  if (!canTransitionProjectStatus(project.status, input.to)) {
    throw new ProjectTransitionError(
      "invalid_transition",
      `Cannot move project from ${project.status} to ${input.to}.`,
    );
  }

  const updated = await getPrisma().$transaction(async (tx) => {
    const res = await tx.project.updateMany({
      where: { id: project.id, status: project.status },
      data: { status: input.to },
    });
    if (res.count !== 1) {
      throw new ProjectTransitionError(
        "invalid_transition",
        "Project status changed during update. Refresh and try again.",
      );
    }
    await tx.projectStatusTransition.create({
      data: {
        projectId: project.id,
        fromStatus: project.status,
        toStatus: input.to,
        actorUserId: input.actorUserId ?? null,
        reason: input.reason ?? null,
        metadataJson: input.metadata ? JSON.stringify(input.metadata) : null,
      },
    });
    return tx.project.findUniqueOrThrow({ where: { id: project.id } });
  });

  const adminIds = await listAdminUserIds();
  const event = {
    actorUserId: input.actorUserId ?? null,
    projectId: project.id,
    type: "project_status_changed" as const,
    title: input.title ?? "Project status updated",
    body: input.body ?? `${project.projectType}: ${project.status} -> ${input.to}`,
    payload: { from: project.status, to: input.to, reason: input.reason ?? null },
  };

  await fanOutEventBestEffort(adminIds, event, { forAdmin: true });

  if (input.notifyClient) {
    const clientRecipients = project.clientUserId ? [project.clientUserId] : [];
    const extraEmails =
      !project.clientUserId && project.contactEmail ? [project.contactEmail] : undefined;
    await fanOutEventBestEffort(clientRecipients, event, { extraEmails });
  }

  return updated;
}

export async function listProjectStatusTransitions(projectId: string) {
  return getPrisma().projectStatusTransition.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    include: {
      actorUser: { select: { id: true, name: true, email: true } },
    },
    take: 30,
  });
}
