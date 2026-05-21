import { AlertTriangle, FileSignature } from "lucide-react";
import { formatEnumLabel, formatUsd } from "@/lib/format";
import { computeQuotePaymentBreakdown } from "@/lib/payments/amounts";
import { DeclineDecisionForm, QuoteBuilder, StartQuoteButton } from "./quote-builder";
import { QuoteAddonForm } from "./quote-addon-form";
import type { RevisionUsage } from "@/lib/data/revisions";
import { AlertBanner } from "@/components/ui/alert-banner";
import { EmptyState } from "@/components/ui/empty-state";
import { cx } from "@/lib/ui";

type QuoteLite = {
  id: string;
  version: number;
  status: string;
  includedRevisions: number | null;
  depositPercent: number | null;
  totalCents: number;
  lineItems: { id: string; description: string; quantity: number; unitAmountCents: number }[];
};

type Props = {
  projectId: string;
  projectStatus: string;
  revisionUsage: RevisionUsage;
  quotes: QuoteLite[];
  defaultDepositPercent: number;
};

export async function AdminQuoteSection({
  projectId,
  projectStatus,
  revisionUsage,
  quotes,
  defaultDepositPercent,
}: Props) {
  const latest = quotes[0];
  const paymentBreakdown =
    latest && (latest.status === "sent" || latest.status === "approved")
      ? await computeQuotePaymentBreakdown(latest)
      : null;

  return (
    <div className="space-y-5">
      <div className="ws-panel flex flex-wrap items-center justify-between gap-4 p-4">
        <div className="flex flex-col gap-1">
          <span className="ws-eyebrow">Project status</span>
          <span className="text-sm font-medium text-text-primary">
            {formatEnumLabel(projectStatus)}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="ws-eyebrow">Revisions</span>
          <span className="ws-mono text-sm tabular-nums text-text-secondary">
            {revisionUsage.delivered}/{revisionUsage.included} delivered
            {revisionUsage.remaining >= 0
              ? ` · ${revisionUsage.remaining} left`
              : " · over limit"}
          </span>
        </div>
      </div>

      {revisionUsage.isNearLimit ? (
        <AlertBanner tone="warning" icon={AlertTriangle}>
          {revisionUsage.isOverLimit
            ? "Revision allowance exceeded. Consider change-order terms before additional rounds."
            : "Revision limit is nearly reached. The next client change may consume the final included round."}
        </AlertBanner>
      ) : null}

      {!latest && projectStatus === "new_request" ? (
        <EmptyState
          icon={FileSignature}
          title="No quote yet."
          description="Start a draft to add line items and send to the client."
          action={<StartQuoteButton projectId={projectId} />}
        />
      ) : null}

      {!latest && projectStatus !== "new_request" ? (
        <p className="text-sm text-text-muted">No quote on file for this project state.</p>
      ) : null}

      {latest?.status === "draft" ? (
        <QuoteBuilder
          projectId={projectId}
          quoteId={latest.id}
          initialIncludedRevisions={latest.includedRevisions ?? revisionUsage.included}
          initialDepositPercent={latest.depositPercent ?? defaultDepositPercent}
          initialLines={latest.lineItems.map((l) => ({
            description: l.description,
            quantity: l.quantity,
            unitAmountCents: l.unitAmountCents,
          }))}
        />
      ) : null}

      {latest?.status === "sent" && paymentBreakdown ? (
        <SentQuoteCard quote={latest} breakdown={paymentBreakdown} />
      ) : null}

      {latest?.status === "approved" && paymentBreakdown ? (
        <div className="space-y-4">
          <AlertBanner tone="success">
            Quote v{latest.version} was{" "}
            <strong className="font-semibold">approved</strong>. Total{" "}
            <span className="ws-mono">{formatUsd(latest.totalCents)}</span>
            {" · "}Deposit {paymentBreakdown.depositPercent}% (
            {formatUsd(paymentBreakdown.depositCents)})
          </AlertBanner>
          {(projectStatus === "in_progress" || projectStatus === "awaiting_final_payment") ? (
            <QuoteAddonForm projectId={projectId} quoteId={latest.id} />
          ) : null}
        </div>
      ) : null}

      {latest?.status === "declined" ? (
        <div className="space-y-3">
          <AlertBanner tone="error">
            Quote v{latest.version} was{" "}
            <strong className="font-semibold">declined</strong>. Choose how to proceed.
          </AlertBanner>
          <DeclineDecisionForm projectId={projectId} />
        </div>
      ) : null}
    </div>
  );
}

function SentQuoteCard({
  quote,
  breakdown,
}: {
  quote: QuoteLite;
  breakdown: { depositCents: number; balanceCents: number; depositPercent: number };
}) {
  return (
    <div
      className={cx(
        "rounded-2xl border border-[color:var(--status-attention-ring)]/40 bg-[color:var(--surface-raised)] p-5",
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <span className="ws-eyebrow">Quote v{quote.version}</span>
          <p className="mt-1 text-sm font-semibold text-text-primary">
            Sent — waiting on client response
          </p>
        </div>
        <span className="ws-mono text-2xl font-semibold tabular-nums tracking-tight text-text-primary">
          {formatUsd(quote.totalCents)}
        </span>
      </div>

      <ul className="mt-4 divide-y divide-[color:var(--border-subtle)] rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-sunken)]">
        {quote.lineItems.map((l) => (
          <li
            key={l.id}
            className="flex items-baseline justify-between gap-2 px-3 py-2 text-sm"
          >
            <span className="text-text-secondary">{l.description}</span>
            <span className="ws-mono text-text-muted tabular-nums">
              {l.quantity} × {formatUsd(l.unitAmountCents)}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-text-muted">
        Deposit {breakdown.depositPercent}%:{" "}
        <span className="ws-mono text-text-secondary">{formatUsd(breakdown.depositCents)}</span>
        {" · "}Balance:{" "}
        <span className="ws-mono text-text-secondary">{formatUsd(breakdown.balanceCents)}</span>
      </p>
    </div>
  );
}
