"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { signOut } from "@/auth";

export async function signOutAction() {
  try {
    await signOut({ redirectTo: "/" });
  } catch (err) {
    if (isRedirectError(err)) throw err;
    throw err;
  }
}
