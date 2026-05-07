import { z } from "zod";

export const serviceTypeCreateSchema = z.object({
  name: z.string().trim().min(1, "Name required").max(120),
  sortOrder: z.coerce.number().int().min(0).max(9999).optional(),
});

export const serviceTypeUpdateSchema = z.object({
  id: z.string().cuid(),
  name: z.string().trim().min(1).max(120).optional(),
  sortOrder: z.coerce.number().int().min(0).max(9999).optional(),
  isActive: z.coerce.boolean().optional(),
});
