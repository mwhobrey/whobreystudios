"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { requireRole } from "@/lib/auth";
import { insertProject, parseCreateProjectFormData } from "@/lib/data/projects";

export type CreateProjectFormState = {
  error?: string;
  projectId?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function createProjectFormAction(
  _prev: CreateProjectFormState | undefined,
  formData: FormData,
): Promise<CreateProjectFormState> {
  const user = await requireRole(["client"]);

  const parsed = parseCreateProjectFormData(formData);
  if (!parsed.success) {
    return {
      error: "Fix the fields below and submit again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const project = await insertProject(user.id, parsed.data);
    return { projectId: project.id };
  } catch (e) {
    if (isRedirectError(e)) throw e;
    if (e instanceof Error && e.message === "INVALID_SERVICE_TYPE") {
      return {
        error: "That project type is no longer available. Refresh the page and choose again.",
      };
    }
    console.error(e);
    return { error: "Could not save your request. Try again." };
  }
}
