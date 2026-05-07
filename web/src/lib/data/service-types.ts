import "server-only";

import { getPrisma } from "@/lib/prisma";

export async function listActiveServiceTypes() {
  return getPrisma().serviceType.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true },
  });
}

export async function listAllServiceTypesAdmin() {
  return getPrisma().serviceType.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      _count: { select: { projects: true } },
    },
  });
}
