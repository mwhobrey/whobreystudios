/**
 * Auth façade: routes, server actions, and data loaders should depend on these helpers,
 * not on `auth()` / `signIn` from Auth.js directly. Replacing Auth.js with another
 * provider later means reimplementing this module (and deleting `src/auth.ts`) while
 * keeping call sites on `getAppUser` / `requireRole` unchanged.
 */
import type { Session } from "next-auth";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { AppUser, UserRole } from "./types";

function sessionToAppUser(session: Session): AppUser | null {
  const u = session.user;
  if (!u?.id || !u.email || u.role == null) return null;
  return {
    id: u.id,
    email: u.email,
    name: u.name ?? null,
    role: u.role,
  };
}

export async function getAppUser(): Promise<AppUser | null> {
  // `auth` is overloaded (middleware vs session); cast to Session for server usage.
  const session = (await auth()) as Session | null;
  if (!session) return null;
  return sessionToAppUser(session);
}

export async function requireAppUser(): Promise<AppUser> {
  const user = await getAppUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(roles: UserRole[]): Promise<AppUser> {
  const user = await getAppUser();
  if (!user) {
    redirect(roles.includes("admin") ? "/login/studio" : "/login");
  }
  if (!roles.includes(user.role)) redirect("/");
  return user;
}
