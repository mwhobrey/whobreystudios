import { NextResponse } from "next/server";
import { getAppUser } from "./session";
import type { AppUser } from "./types";
import type { UserRole } from "./types";

/**
 * API Route Handlers cannot use `redirect()` from `requireRole`; use this instead.
 * Returns the `AppUser` or a ready-to-return `NextResponse` (401 / 403).
 */
export async function requireApiRoles(
  roles: UserRole[],
): Promise<AppUser | NextResponse> {
  const user = await getAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!roles.includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return user;
}
