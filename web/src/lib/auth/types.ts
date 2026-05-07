import type { UserRole } from "@/generated/prisma/enums";

export type { UserRole };

/** Stable app identity — use this instead of Auth.js `Session` in business logic. */
export type AppUser = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
};
