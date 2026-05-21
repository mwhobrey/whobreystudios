import "server-only";

import { linkProjectsByContactEmail } from "@/lib/data/projects";

/**
 * WHO-21: Link guest intake projects to the client account on sign-in.
 *
 * Import from Auth.js after first client sign-in (magic link `events.signIn` or
 * `jwt` callback when `user` is present). Safe to call on every sign-in — only
 * updates rows where `clientUserId` is still null.
 *
 * ```ts
 * import { linkClientProjectsOnSignIn } from "@/lib/auth/link-client-projects";
 * // inside signIn / jwt when role === "client":
 * await linkClientProjectsOnSignIn(user.id, user.email);
 * ```
 */
export async function linkClientProjectsOnSignIn(
  userId: string,
  email: string | null | undefined,
): Promise<void> {
  if (!email?.trim()) return;
  await linkProjectsByContactEmail(userId, email);
}
