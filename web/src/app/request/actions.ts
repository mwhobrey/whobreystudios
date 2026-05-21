"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { insertProject, parseCreateProjectFormData } from "@/lib/data/projects";

export type GuestRequestFormState = {
  error?: string;
  submitted?: boolean;
  contactEmail?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function guestRequestFormAction(
  _prev: GuestRequestFormState | undefined,
  formData: FormData,
): Promise<GuestRequestFormState> {
  const parsed = parseCreateProjectFormData(formData);
  if (!parsed.success) {
    return {
      error: "Fix the fields below and submit again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await insertProject(null, parsed.data);
    return {
      submitted: true,
      contactEmail: parsed.data.contactEmail,
    };
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
