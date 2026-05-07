import "server-only";

import type { FileAssetKind } from "@/generated/prisma/enums";
import { paymentAdapter, type PaymentInvoiceStatus } from "@/lib/payments/adapter";
import { getWorkspaceSettings } from "@/lib/data/workspace-settings";

export type FinalFileAccessDecision = {
  allowed: boolean;
  invoiceStatus: PaymentInvoiceStatus;
  reason:
    | "admin_override"
    | "not_final_asset"
    | "policy_disabled"
    | "project_completed"
    | "payment_required";
};

export async function canDownloadProjectFile(input: {
  fileKind: FileAssetKind;
  projectId: string;
  projectStatus: string;
  userId: string;
  userRole: "admin" | "client";
}): Promise<boolean> {
  const decision = await getFinalFileAccessDecision(input);
  return decision.allowed;
}

export async function getFinalFileAccessDecision(input: {
  fileKind: FileAssetKind;
  projectId: string;
  projectStatus: string;
  userId: string;
  userRole: "admin" | "client";
}): Promise<FinalFileAccessDecision> {
  if (input.userRole === "admin") {
    return { allowed: true, invoiceStatus: "none", reason: "admin_override" };
  }
  if (input.fileKind !== "final") {
    return { allowed: true, invoiceStatus: "none", reason: "not_final_asset" };
  }

  const settings = await getWorkspaceSettings();
  if (!settings.finalFilesRequirePayment) {
    return { allowed: true, invoiceStatus: "none", reason: "policy_disabled" };
  }
  if (input.projectStatus === "completed") {
    return { allowed: true, invoiceStatus: "none", reason: "project_completed" };
  }

  const invoiceStatus = await paymentAdapter.getInvoiceStatus({
    projectId: input.projectId,
    userId: input.userId,
  });
  const paid = await paymentAdapter.hasClearedFinalPayment({
    projectId: input.projectId,
    userId: input.userId,
  });
  if (paid || invoiceStatus === "paid") {
    return { allowed: true, invoiceStatus, reason: "project_completed" };
  }

  return { allowed: false, invoiceStatus, reason: "payment_required" };
}
