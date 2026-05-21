"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { QuoteStateError, approveQuoteForClient, declineQuoteForClient } from "@/lib/data/quotes";

export type ClientQuoteActionState = { error?: string };

export async function approveQuoteAction(
  _prev: ClientQuoteActionState | undefined,
  formData: FormData,
): Promise<ClientQuoteActionState> {
  const user = await requireRole(["client"]);
  const projectId = String(formData.get("projectId") ?? "");
  const quoteId = String(formData.get("quoteId") ?? "");
  if (!projectId || !quoteId) return { error: "Missing data." };

  try {
    await approveQuoteForClient(quoteId, { id: user.id, email: user.email });
  } catch (e) {
    if (e instanceof QuoteStateError) return { error: e.message };
    throw e;
  }

  revalidatePath(`/portal/projects/${projectId}`);
  revalidatePath(`/admin/projects/${projectId}`);
  return {};
}

export async function declineQuoteAction(
  _prev: ClientQuoteActionState | undefined,
  formData: FormData,
): Promise<ClientQuoteActionState> {
  const user = await requireRole(["client"]);
  const projectId = String(formData.get("projectId") ?? "");
  const quoteId = String(formData.get("quoteId") ?? "");
  if (!projectId || !quoteId) return { error: "Missing data." };

  try {
    await declineQuoteForClient(quoteId, { id: user.id, email: user.email });
  } catch (e) {
    if (e instanceof QuoteStateError) return { error: e.message };
    throw e;
  }

  revalidatePath(`/portal/projects/${projectId}`);
  revalidatePath(`/admin/projects/${projectId}`);
  return {};
}
