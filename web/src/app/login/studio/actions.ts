"use server";

import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { signIn } from "@/auth";
import { getPrisma } from "@/lib/prisma";

export type StudioLoginActionState = { error?: string };

export async function studioLoginAction(
  _prev: StudioLoginActionState | undefined,
  formData: FormData,
): Promise<StudioLoginActionState> {
  const email = formData.get("email");
  const password = formData.get("password");
  const safeEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

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
