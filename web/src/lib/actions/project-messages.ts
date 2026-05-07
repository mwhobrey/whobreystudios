"use server";

import { revalidatePath } from "next/cache";
import { requireAppUser } from "@/lib/auth";
import {
  insertProjectMessage,
  ProjectMessageError,
} from "@/lib/data/messages";
import { createMessageBodySchema } from "@/lib/schemas/message";

export type ProjectMessageActionState = { error?: string };

export async function postProjectMessageAction(
  _prev: ProjectMessageActionState | undefined,
  formData: FormData,
): Promise<ProjectMessageActionState> {
  const user = await requireAppUser();
  const projectId = String(formData.get("projectId") ?? "").trim();
  const bodyRaw = formData.get("body");
  const parentRaw = formData.get("parentId");
  const parentId =
    typeof parentRaw === "string" && parentRaw.trim() !== "" ? parentRaw.trim() : undefined;

  const parsed = createMessageBodySchema.safeParse({
    body: typeof bodyRaw === "string" ? bodyRaw : "",
    parentId,
  });
  if (!parsed.success) {
    return { error: parsed.error.flatten().formErrors.join(" ") || "Invalid message." };
  }

  try {
    await insertProjectMessage(projectId, { id: user.id, role: user.role }, parsed.data);
  } catch (e) {
    if (e instanceof ProjectMessageError) {
      if (e.code === "forbidden") return { error: "You can't post on this project." };
      return { error: e.message };
    }
    if (e instanceof Error) return { error: e.message };
    throw e;
  }

  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath(`/portal/projects/${projectId}`);
  return {};
}
