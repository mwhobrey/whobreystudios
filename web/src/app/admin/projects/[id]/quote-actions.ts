"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import {
  QuoteStateError,
  ensureOrCreateDraftQuote,
  replaceQuoteLineItems,
  resolveDeclinedQuote,
  sendQuote,
} from "@/lib/data/quotes";
import { quoteLinesDraftSchema } from "@/lib/schemas/quote";

export type QuoteActionState = { error?: string };

export async function startQuoteAction(
  _prev: QuoteActionState | undefined,
  formData: FormData,
): Promise<QuoteActionState> {
  await requireRole(["admin"]);
  const projectId = String(formData.get("projectId") ?? "");
  if (!projectId) return { error: "Missing project." };

  try {
    await ensureOrCreateDraftQuote(projectId);
  } catch (e) {
    if (e instanceof QuoteStateError) return { error: e.message };
    throw e;
  }

  revalidatePath(`/admin/projects/${projectId}`);
  return {};
}

export async function saveQuoteDraftAction(
  _prev: QuoteActionState | undefined,
  formData: FormData,
): Promise<QuoteActionState> {
  await requireRole(["admin"]);
  const projectId = String(formData.get("projectId") ?? "");
  const quoteId = String(formData.get("quoteId") ?? "");
  const raw = formData.get("linesJson");
  const includedRaw = String(formData.get("includedRevisions") ?? "").trim();
  if (!projectId || !quoteId) return { error: "Missing project or quote." };

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(typeof raw === "string" ? raw : "[]");
  } catch {
    return { error: "Invalid line data." };
  }

  const parsed = quoteLinesDraftSchema.safeParse(parsedJson);
  if (!parsed.success) {
    return { error: "Fix line items (description, quantity, and price)." };
  }

  let includedRevisions: number | null | undefined = undefined;
  if (includedRaw !== "") {
    const n = Number.parseInt(includedRaw, 10);
    if (Number.isNaN(n) || n < 1 || n > 20) {
      return { error: "Included revisions must be 1-20." };
    }
    includedRevisions = n;
  }

  try {
    await replaceQuoteLineItems(quoteId, parsed.data, includedRevisions);
  } catch (e) {
    if (e instanceof QuoteStateError) return { error: e.message };
    throw e;
  }

  revalidatePath(`/admin/projects/${projectId}`);
  return {};
}

export async function sendQuoteAction(
  _prev: QuoteActionState | undefined,
  formData: FormData,
): Promise<QuoteActionState> {
  const user = await requireRole(["admin"]);
  const projectId = String(formData.get("projectId") ?? "");
  const quoteId = String(formData.get("quoteId") ?? "");
  if (!projectId || !quoteId) return { error: "Missing project or quote." };

  try {
    await sendQuote(quoteId, user.id);
  } catch (e) {
    if (e instanceof QuoteStateError) return { error: e.message };
    throw e;
  }

  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath(`/portal/projects/${projectId}`);
  return {};
}

export async function resolveDeclinedQuoteAction(
  _prev: QuoteActionState | undefined,
  formData: FormData,
): Promise<QuoteActionState> {
  const user = await requireRole(["admin"]);
  const projectId = String(formData.get("projectId") ?? "");
  const decisionRaw = String(formData.get("decision") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (!projectId) return { error: "Missing project." };
  if (decisionRaw !== "close" && decisionRaw !== "revise") {
    return { error: "Invalid decision." };
  }

  try {
    await resolveDeclinedQuote({
      projectId,
      actorUserId: user.id,
      decision: decisionRaw,
      reason: reason || null,
    });
  } catch (e) {
    if (e instanceof QuoteStateError) return { error: e.message };
    throw e;
  }

  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath(`/portal/projects/${projectId}`);
  return {};
}
