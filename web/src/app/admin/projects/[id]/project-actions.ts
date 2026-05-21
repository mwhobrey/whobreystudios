"use server";

import { revalidatePath } from "next/cache";
import type { ProjectStatus } from "@/generated/prisma/enums";
import { requireRole } from "@/lib/auth";
import { promoteFileToFinal, FileUploadError } from "@/lib/data/file-assets";
import {
  ProjectTransitionError,
  transitionProjectStatus,
} from "@/lib/data/projects";

export type ProjectActionState = { error?: string };

export async function transitionProjectStatusAction(
  _prev: ProjectActionState | undefined,
  formData: FormData,
): Promise<ProjectActionState> {
  const user = await requireRole(["admin"]);
  const projectId = String(formData.get("projectId") ?? "");
  const to = String(formData.get("to") ?? "") as ProjectStatus;
  const reason = String(formData.get("reason") ?? "").trim();
  if (!projectId || !to) return { error: "Missing project or status." };

  try {
    await transitionProjectStatus({
      projectId,
      to,
      actorUserId: user.id,
      notifyClient: true,
      reason: reason || null,
    });
  } catch (e) {
    if (e instanceof ProjectTransitionError) return { error: e.message };
    throw e;
  }

  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath(`/portal/projects/${projectId}`);
  revalidatePath("/admin");
  return {};
}

export async function promoteFileToFinalAction(
  _prev: ProjectActionState | undefined,
  formData: FormData,
): Promise<ProjectActionState> {
  const user = await requireRole(["admin"]);
  const projectId = String(formData.get("projectId") ?? "");
  const fileId = String(formData.get("fileId") ?? "");
  if (!projectId || !fileId) return { error: "Missing project or file." };

  try {
    await promoteFileToFinal({
      projectId,
      fileId,
      viewer: { id: user.id, role: user.role },
    });
  } catch (e) {
    if (e instanceof FileUploadError) return { error: e.message };
    throw e;
  }

  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath(`/portal/projects/${projectId}`);
  return {};
}
