import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { fanOutEventBestEffort, listAdminUserIds } from "@/lib/data/notifications";
import { getPrisma } from "@/lib/prisma";
import { getIncludedRevisionsDefault } from "@/lib/data/workspace-settings";
import { quoteLinesPayloadSchema } from "@/lib/schemas/quote";
import { findPaidDepositForProject } from "@/lib/data/payments";
import {
  clientProjectAccessWhere,
  ProjectTransitionError,
  transitionProjectStatus,
} from "@/lib/data/projects";

export class QuoteStateError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "QuoteStateError";
  }
}

function asQuoteStateError(err: unknown): QuoteStateError {
  if (err instanceof QuoteStateError) return err;
  if (err instanceof ProjectTransitionError) {
    return new QuoteStateError("INVALID", err.message);
  }
  throw err;
}

const quoteWithLines = {
  include: {
    lineItems: { orderBy: { sortOrder: "asc" as const } },
  },
} satisfies Prisma.QuoteDefaultArgs;

export type QuoteWithLines = Prisma.QuoteGetPayload<typeof quoteWithLines>;

function sumLinesCents(lines: { quantity: number; unitAmountCents: number }[]) {
  return lines.reduce((sum, l) => sum + l.quantity * l.unitAmountCents, 0);
}

/** Latest quote by version (include line items). */
export async function getLatestQuoteForProject(projectId: string): Promise<QuoteWithLines | null> {
  return getPrisma().quote.findFirst({
    where: { projectId },
    orderBy: { version: "desc" },
    ...quoteWithLines,
  });
}

/** Create next draft when allowed; return existing draft if present. */
export async function ensureOrCreateDraftQuote(projectId: string): Promise<QuoteWithLines> {
  const project = await getPrisma().project.findUnique({
    where: { id: projectId },
    include: {
      quotes: { orderBy: { version: "desc" }, take: 1 },
    },
  });

  if (!project) {
    throw new QuoteStateError("NOT_FOUND", "Project not found.");
  }

  const latest = project.quotes[0];

  if (latest?.status === "draft") {
    const full = await getPrisma().quote.findUnique({
      where: { id: latest.id },
      ...quoteWithLines,
    });
    if (!full) throw new QuoteStateError("NOT_FOUND", "Quote not found.");
    return full;
  }

  if (latest?.status === "sent") {
    throw new QuoteStateError("WAITING", "A quote is already sent. Wait for the client to respond.");
  }

  if (latest?.status === "approved") {
    throw new QuoteStateError("LOCKED", "This project already has an approved quote.");
  }

  if (latest?.status === "declined") {
    const includedRevisionsDefault = await getIncludedRevisionsDefault();
    return getPrisma().quote.create({
      data: {
        projectId,
        version: latest.version + 1,
        status: "draft",
        includedRevisions: includedRevisionsDefault,
        totalCents: 0,
      },
      ...quoteWithLines,
    });
  }

  if (!latest) {
    if (project.status !== "new_request") {
      throw new QuoteStateError(
        "INVALID",
        "You can only start the first quote while the project is a new request.",
      );
    }
    const includedRevisionsDefault = await getIncludedRevisionsDefault();
    return getPrisma().quote.create({
      data: {
        projectId,
        version: 1,
        status: "draft",
        includedRevisions: includedRevisionsDefault,
        totalCents: 0,
      },
      ...quoteWithLines,
    });
  }

  throw new QuoteStateError("INVALID", "Cannot create a quote in the current state.");
}

export function parseQuoteLinesPayload(json: unknown) {
  return quoteLinesPayloadSchema.safeParse(json);
}

export async function replaceQuoteLineItems(
  quoteId: string,
  lines: { description: string; quantity: number; unitAmountCents: number }[],
  includedRevisions?: number | null,
  depositPercent?: number | null,
) {
  const quote = await getPrisma().quote.findUnique({ where: { id: quoteId } });
  if (!quote) throw new QuoteStateError("NOT_FOUND", "Quote not found.");
  if (quote.status !== "draft") {
    throw new QuoteStateError("INVALID", "Only draft quotes can be edited.");
  }

  const totalCents = sumLinesCents(lines);

  await getPrisma().$transaction(async (tx) => {
    await tx.quoteLineItem.deleteMany({ where: { quoteId } });
    if (lines.length > 0) {
      await tx.quoteLineItem.createMany({
        data: lines.map((l, i) => ({
          quoteId,
          description: l.description,
          quantity: l.quantity,
          unitAmountCents: l.unitAmountCents,
          sortOrder: i,
        })),
      });
    }
    const updated = await tx.quote.updateMany({
      where: { id: quoteId, status: "draft", updatedAt: quote.updatedAt },
      data: {
        totalCents,
        ...(includedRevisions === undefined ? {} : { includedRevisions }),
        ...(depositPercent === undefined ? {} : { depositPercent }),
      },
    });
    if (updated.count !== 1) {
      throw new QuoteStateError("CONFLICT", "Quote changed while editing. Refresh and retry.");
    }
  });

  return getPrisma().quote.findUniqueOrThrow({
    where: { id: quoteId },
    ...quoteWithLines,
  });
}

/** Append line items to an approved quote (post-deposit add-ons, WHO-19). */
export async function appendQuoteLineItemsForApprovedQuote(
  quoteId: string,
  lines: { description: string; quantity: number; unitAmountCents: number }[],
) {
  const quote = await getPrisma().quote.findUnique({
    where: { id: quoteId },
    include: { lineItems: true, project: true },
  });
  if (!quote) throw new QuoteStateError("NOT_FOUND", "Quote not found.");
  if (quote.status !== "approved") {
    throw new QuoteStateError("INVALID", "Only approved quotes can receive add-on line items.");
  }
  if (quote.project.status !== "in_progress" && quote.project.status !== "awaiting_final_payment") {
    throw new QuoteStateError(
      "INVALID",
      "Add-ons are only allowed while work is in progress or awaiting final payment.",
    );
  }

  const parsed = quoteLinesPayloadSchema.safeParse(lines);
  if (!parsed.success) {
    throw new QuoteStateError("VALIDATION", "Add at least one valid line item.");
  }

  const depositPaid = await findPaidDepositForProject(quote.projectId);
  if (!depositPaid) {
    throw new QuoteStateError("INVALID", "Deposit must be paid before adding invoice add-ons.");
  }

  const maxSort = quote.lineItems.reduce((m, l) => Math.max(m, l.sortOrder), -1);
  const newLines = parsed.data;
  const addedCents = sumLinesCents(newLines);

  await getPrisma().$transaction(async (tx) => {
    await tx.quoteLineItem.createMany({
      data: newLines.map((l, i) => ({
        quoteId,
        description: l.description,
        quantity: l.quantity,
        unitAmountCents: l.unitAmountCents,
        sortOrder: maxSort + 1 + i,
      })),
    });
    await tx.quote.update({
      where: { id: quoteId },
      data: { totalCents: quote.totalCents + addedCents },
    });
  });

  return getPrisma().quote.findUniqueOrThrow({
    where: { id: quoteId },
    ...quoteWithLines,
  });
}

export async function setQuoteIncludedRevisions(quoteId: string, includedRevisions: number | null) {
  const quote = await getPrisma().quote.findUnique({ where: { id: quoteId } });
  if (!quote) throw new QuoteStateError("NOT_FOUND", "Quote not found.");
  if (quote.status !== "draft") {
    throw new QuoteStateError("INVALID", "Only draft quotes can change included revisions.");
  }
  await getPrisma().quote.update({
    where: { id: quoteId },
    data: { includedRevisions },
  });
}

export async function sendQuote(quoteId: string, actorUserId?: string) {
  const quote = await getPrisma().quote.findUnique({
    where: { id: quoteId },
    include: { lineItems: true, project: true },
  });

  if (!quote) throw new QuoteStateError("NOT_FOUND", "Quote not found.");
  if (quote.status !== "draft") {
    throw new QuoteStateError("INVALID", "Only a draft quote can be sent.");
  }

  const parsed = quoteLinesPayloadSchema.safeParse(
    quote.lineItems.map((l) => ({
      description: l.description,
      quantity: l.quantity,
      unitAmountCents: l.unitAmountCents,
    })),
  );
  if (!parsed.success) {
    throw new QuoteStateError("VALIDATION", "Add at least one valid line item before sending.");
  }

  const totalCents = sumLinesCents(parsed.data);
  if (totalCents <= 0) {
    throw new QuoteStateError("VALIDATION", "Total must be greater than $0.00 to send.");
  }

  const sent = await getPrisma().quote.updateMany({
    where: { id: quoteId, status: "draft" },
    data: {
      status: "sent",
      sentAt: new Date(),
      totalCents,
    },
  });
  if (sent.count !== 1) {
    throw new QuoteStateError("INVALID", "Only a draft quote can be sent.");
  }
  await transitionProjectStatus({
    projectId: quote.projectId,
    to: "quote_sent",
    actorUserId: actorUserId ?? null,
    notifyClient: false,
  });

  const clientRecipients = quote.project.clientUserId ? [quote.project.clientUserId] : [];
  await fanOutEventBestEffort(
    clientRecipients,
    {
      actorUserId: actorUserId ?? null,
      projectId: quote.projectId,
      type: "quote_sent",
      title: "Quote sent",
      body: `Quote v${quote.version} is ready for review.`,
    },
    {
      extraEmails: [quote.project.contactEmail],
      quoteVersion: quote.version,
    },
  );

  return getPrisma().quote.findUniqueOrThrow({
    where: { id: quoteId },
    ...quoteWithLines,
  });
}

export async function approveQuoteForClient(
  quoteId: string,
  client: { id: string; email: string },
) {
  const quote = await getPrisma().quote.findFirst({
    where: {
      id: quoteId,
      status: "sent",
      project: clientProjectAccessWhere(client),
    },
    include: { project: true },
  });

  if (!quote) {
    throw new QuoteStateError("NOT_FOUND", "Quote not found or not available to approve.");
  }

  try {
    const updated = await getPrisma().quote.updateMany({
      where: { id: quoteId, status: "sent" },
      data: { status: "approved" },
    });
    if (updated.count !== 1) {
      throw new QuoteStateError("INVALID", "Quote is no longer in sent state.");
    }
    // Quote is approved; project waits for deposit before work starts.
    await transitionProjectStatus({
      projectId: quote.projectId,
      to: "awaiting_deposit",
      actorUserId: client.id,
      notifyClient: false,
    });
  } catch (e) {
    throw asQuoteStateError(e);
  }

  const adminIds = await listAdminUserIds();
  await fanOutEventBestEffort(
    adminIds,
    {
      actorUserId: client.id,
      projectId: quote.projectId,
      type: "quote_approved",
      title: "Quote approved",
      body: `Quote v${quote.version} was approved by client.`,
    },
    { forAdmin: true, quoteVersion: quote.version },
  );
}

export async function declineQuoteForClient(
  quoteId: string,
  client: { id: string; email: string },
) {
  const quote = await getPrisma().quote.findFirst({
    where: {
      id: quoteId,
      status: "sent",
      project: clientProjectAccessWhere(client),
    },
    include: { project: true },
  });

  if (!quote) {
    throw new QuoteStateError("NOT_FOUND", "Quote not found or not available to decline.");
  }

  try {
    const updated = await getPrisma().quote.updateMany({
      where: { id: quoteId, status: "sent" },
      data: { status: "declined" },
    });
    if (updated.count !== 1) {
      throw new QuoteStateError("INVALID", "Quote is no longer in sent state.");
    }
    await transitionProjectStatus({
      projectId: quote.projectId,
      to: "declined",
      actorUserId: client.id,
      notifyClient: false,
    });
  } catch (e) {
    throw asQuoteStateError(e);
  }

  const adminIds = await listAdminUserIds();
  await fanOutEventBestEffort(
    adminIds,
    {
      actorUserId: client.id,
      projectId: quote.projectId,
      type: "quote_declined",
      title: "Quote declined",
      body: `Quote v${quote.version} was declined by client.`,
    },
    { forAdmin: true, quoteVersion: quote.version },
  );
}

export async function resolveDeclinedQuote(input: {
  projectId: string;
  actorUserId: string;
  decision: "close" | "revise";
  reason?: string | null;
}) {
  const latest = await getLatestQuoteForProject(input.projectId);
  if (!latest || latest.status !== "declined") {
    throw new QuoteStateError("INVALID", "Only declined quotes can be resolved.");
  }

  if (input.decision === "close") {
    await transitionProjectStatus({
      projectId: input.projectId,
      to: "cancelled",
      actorUserId: input.actorUserId,
      notifyClient: true,
      title: "Project closed after quote decline",
      body: input.reason?.trim() || "The studio has closed this request after quote decline.",
      reason: input.reason?.trim() || null,
    });
    return;
  }

  await ensureOrCreateDraftQuote(input.projectId);
  await transitionProjectStatus({
    projectId: input.projectId,
    to: "new_request",
    actorUserId: input.actorUserId,
    notifyClient: true,
    title: "Project reopened for revised quote",
    body: input.reason?.trim() || "The studio is preparing a revised quote.",
    reason: input.reason?.trim() || null,
  });
}
