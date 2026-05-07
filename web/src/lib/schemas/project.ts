import { z } from "zod";

const optionalCuid = z
  .union([z.string().cuid(), z.literal(""), z.null(), z.undefined()])
  .transform((v) => (v && v !== "" ? v : undefined));

/** Intake payload for POST /api/projects (aligned with DESIGN.md / overview form). */
export const createProjectBodySchema = z
  .object({
    fullName: z.string().trim().min(1, "Full name is required"),
    businessName: z.string().trim().optional().nullable(),
    phone: z.string().trim().min(1, "Phone is required"),
    contactEmail: z.string().trim().email("Valid email required"),
    preferredContactMethod: z.string().trim().min(1, "Preferred contact method is required"),
    /** Snapshot label; required when `serviceTypeId` is absent (custom “Other” text). */
    projectType: z.string().trim().optional().default(""),
    /** When set, must reference an active catalog row; `projectType` is overwritten from catalog name. */
    serviceTypeId: optionalCuid,
    deadline: z.coerce.date().optional().nullable(),
    notes: z.string().trim().optional().nullable(),
  })
  .refine(
    (d) => {
      if (d.serviceTypeId) return true;
      return d.projectType.trim().length > 0;
    },
    { message: "Choose a service type or enter a custom type.", path: ["projectType"] },
  );

export type CreateProjectBody = z.infer<typeof createProjectBodySchema>;
