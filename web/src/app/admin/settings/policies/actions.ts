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
  const defaultDepositPercent = Number.parseInt(
    String(formData.get("defaultDepositPercent") ?? "40"),
    10,
  );

  await updateWorkspacePolicy({
    includedRevisionsDefault: Number.isNaN(includedRevisionsDefault)
      ? 2
      : Math.min(20, Math.max(1, includedRevisionsDefault)),
    defaultDepositPercent: Number.isNaN(defaultDepositPercent)
      ? 40
      : Math.min(99, Math.max(1, defaultDepositPercent)),
    finalFilesRequirePayment,
    termsUrl: cleanUrl(formData.get("termsUrl")),
    privacyUrl: cleanUrl(formData.get("privacyUrl")),
    refundPolicyUrl: cleanUrl(formData.get("refundPolicyUrl")),
    shopUrl: cleanUrl(formData.get("shopUrl")),
  });

  revalidatePath("/admin/settings/policies");
  revalidatePath("/admin");
  revalidatePath("/portal");
}
