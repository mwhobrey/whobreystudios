"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { serviceTypeCreateSchema } from "@/lib/schemas/service-type";

function bounce(message: string): never {
  redirect(`/admin/settings/service-types?err=${encodeURIComponent(message)}`);
}

export async function createServiceTypeAction(formData: FormData) {
  await requireRole(["admin"]);
  const parsed = serviceTypeCreateSchema.safeParse({
    name: formData.get("name"),
    sortOrder: formData.get("sortOrder") || undefined,
  });
  if (!parsed.success) {
    bounce(parsed.error.flatten().formErrors.join(" ") || "Invalid.");
  }

  const { name, sortOrder } = parsed.data;
  const maxRow = await getPrisma().serviceType.aggregate({ _max: { sortOrder: true } });
  const nextOrder = sortOrder ?? (maxRow._max.sortOrder ?? 0) + 10;

  try {
    await getPrisma().serviceType.create({
      data: { name, sortOrder: nextOrder, isActive: true },
    });
  } catch {
    bounce("That name may already exist.");
  }

  revalidatePath("/admin/settings/service-types");
}

export async function updateServiceTypeAction(formData: FormData) {
  await requireRole(["admin"]);
  const id = String(formData.get("id") ?? "").trim();
  if (!/^c[a-z0-9]{24,}$/i.test(id)) {
    bounce("Invalid row.");
  }

  const nameRaw = formData.get("name");
  const sortRaw = formData.get("sortOrder");
  const activeRaw = formData.get("isActive");

  const data: { name?: string; sortOrder?: number; isActive?: boolean } = {};
  if (typeof nameRaw === "string" && nameRaw.trim().length > 0) {
    if (nameRaw.trim().length > 120) bounce("Name too long.");
    data.name = nameRaw.trim();
  }
  if (typeof sortRaw === "string" && sortRaw.trim() !== "") {
    const n = Number.parseInt(sortRaw, 10);
    if (Number.isNaN(n) || n < 0 || n > 9999) bounce("Sort must be 0–9999.");
    data.sortOrder = n;
  }
  if (activeRaw === "true" || activeRaw === "false") {
    data.isActive = activeRaw === "true";
  }

  if (Object.keys(data).length === 0) {
    return;
  }

  try {
    await getPrisma().serviceType.update({
      where: { id },
      data,
    });
  } catch {
    bounce("Could not update (duplicate name?).");
  }

  revalidatePath("/admin/settings/service-types");
}
