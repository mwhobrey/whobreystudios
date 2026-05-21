"use server";

import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { signIn } from "@/auth";
import { assertAuthRateLimit, getRequestIp } from "@/lib/auth/rate-limit";
import { isEmailConfigured } from "@/lib/email/resend";
import { getPrisma } from "@/lib/prisma";

export type MagicLinkActionState = { error?: string };

function isMagicLinkBlocked(role: string | undefined, passwordHash: string | null | undefined) {
  return role === "admin" || Boolean(passwordHash);
}

export async function magicLinkAction(
  _prev: MagicLinkActionState | undefined,
  formData: FormData,
): Promise<MagicLinkActionState> {
  if (!isEmailConfigured()) {
    return { error: "Email sign-in is not configured yet. Contact the studio." };
  }

  const email = formData.get("email");
  const safeEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (!safeEmail) return { error: "Enter a valid email address." };

  const ip = await getRequestIp();
  const emailLimit = await assertAuthRateLimit("magic:email", safeEmail);
  if (!emailLimit.ok) return { error: emailLimit.message };
  const ipLimit = await assertAuthRateLimit("magic:ip", ip);
  if (!ipLimit.ok) return { error: ipLimit.message };

  const existing = await getPrisma().user.findUnique({
    where: { email: safeEmail },
    select: { role: true, passwordHash: true },
  });
  if (isMagicLinkBlocked(existing?.role, existing?.passwordHash)) {
    return {
      error:
        existing?.role === "admin"
          ? "Studio staff must sign in at the studio login page."
          : "This account uses password sign-in. Use the credentials provided by the studio.",
    };
  }

  try {
    await signIn("email", {
      email: safeEmail,
      redirectTo: "/post-login",
    });
  } catch (err) {
    if (isRedirectError(err)) throw err;
    if (err instanceof AuthError) {
      return { error: "Could not send a sign-in link. Try again in a moment." };
    }
    return { error: "Something went wrong. Try again." };
  }

  return {};
}
