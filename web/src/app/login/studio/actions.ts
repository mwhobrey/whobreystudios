"use server";

import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { signIn } from "@/auth";
import { assertAuthRateLimit, getRequestIp } from "@/lib/auth/rate-limit";
import { getPrisma } from "@/lib/prisma";

export type StudioLoginActionState = { error?: string };

export async function studioLoginAction(
  _prev: StudioLoginActionState | undefined,
  formData: FormData,
): Promise<StudioLoginActionState> {
  const email = formData.get("email");
  const password = formData.get("password");
  const safeEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

  if (safeEmail) {
    const ip = await getRequestIp();
    const emailLimit = await assertAuthRateLimit("studio:email", safeEmail);
    if (!emailLimit.ok) return { error: emailLimit.message };
    const ipLimit = await assertAuthRateLimit("studio:ip", ip);
    if (!ipLimit.ok) return { error: ipLimit.message };
  }

  const existingUser = safeEmail
    ? await getPrisma().user.findUnique({
        where: { email: safeEmail },
        select: { role: true },
      })
    : null;
  const redirectTo = existingUser?.role === "admin" ? "/admin" : "/portal";

  try {
    await signIn("credentials", {
      email: safeEmail,
      password: typeof password === "string" ? password : "",
      redirectTo,
    });
  } catch (err) {
    if (isRedirectError(err)) throw err;
    if (err instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    return { error: "Something went wrong. Try again." };
  }

  return {};
}
