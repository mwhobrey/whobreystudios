import "server-only";

import { getPrisma } from "@/lib/prisma";

export async function getWorkspaceSettings() {
  return getPrisma().workspaceSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      includedRevisionsDefault: 2,
      defaultDepositPercent: 40,
      finalFilesRequirePayment: true,
    },
  });
}

export async function getIncludedRevisionsDefault() {
  const row = await getWorkspaceSettings();
  return row.includedRevisionsDefault;
}

export async function getDefaultDepositPercent() {
  const row = await getWorkspaceSettings();
  return row.defaultDepositPercent;
}

export async function updateWorkspacePolicy(input: {
  includedRevisionsDefault: number;
  defaultDepositPercent?: number;
  finalFilesRequirePayment: boolean;
  termsUrl?: string | null;
  privacyUrl?: string | null;
  refundPolicyUrl?: string | null;
}) {
  return getPrisma().workspaceSettings.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      ...input,
    },
    update: input,
  });
}
