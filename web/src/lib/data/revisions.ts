import "server-only";

import { getPrisma } from "@/lib/prisma";
import { getIncludedRevisionsDefault } from "@/lib/data/workspace-settings";

export type RevisionUsage = {
  included: number;
  delivered: number;
  remaining: number;
  isNearLimit: boolean;
  isOverLimit: boolean;
};

export function buildRevisionUsage(included: number, delivered: number): RevisionUsage {
  const remaining = included - delivered;
  return {
    included,
    delivered,
    remaining,
    isNearLimit: remaining <= 1,
    isOverLimit: remaining < 0,
  };
}

export async function getDeliveredDraftRevisionCount(projectId: string): Promise<number> {
  const agg = await getPrisma().fileAsset.aggregate({
    where: { projectId, kind: "draft", source: "revision" },
    _max: { revisionNumber: true },
  });
  return agg._max.revisionNumber ?? 0;
}

export async function getProjectRevisionUsage(
  projectId: string,
  quoteIncludedOverride: number | null | undefined,
): Promise<RevisionUsage> {
  const [includedDefault, delivered] = await Promise.all([
    getIncludedRevisionsDefault(),
    getDeliveredDraftRevisionCount(projectId),
  ]);
  const included = quoteIncludedOverride ?? includedDefault;
  return buildRevisionUsage(included, delivered);
}
