"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { updateWorkspacePolicy } from "@/lib/data/workspace-settings";

function cleanUrl(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s === "" ? null : s;
}

export async function savePolicySettingsAction(formData: FormData) {
  await requireRole(["admin"]);
  const includedRevisionsDefault = Number.parseInt(
    String(formData.get("includedRevisionsDefault") ?? "2"),
    10,
  );
  const finalFilesRequirePayment = String(formData.get("finalFilesRequirePayment") ?? "") === "on";

  await updateWorkspacePolicy({
    includedRevisionsDefault: Number.isNaN(includedRevisionsDefault)
      ? 2
      : Math.min(20, Math.max(1, includedRevisionsDefault)),
    finalFilesRequirePayment,
    termsUrl: cleanUrl(formData.get("termsUrl")),
    privacyUrl: cleanUrl(formData.get("privacyUrl")),
    refundPolicyUrl: cleanUrl(formData.get("refundPolicyUrl")),
  });

  revalidatePath("/admin/settings/policies");
  revalidatePath("/admin");
}
