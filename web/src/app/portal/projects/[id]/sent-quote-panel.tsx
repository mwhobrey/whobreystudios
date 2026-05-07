"use client";

import { useActionState } from "react";
import { Check, X } from "lucide-react";
import { approveQuoteAction, declineQuoteAction, type ClientQuoteActionState } from "./quote-actions";
import { formatUsd } from "@/lib/format";
import { AppButton } from "@/components/ui/app-button";
import { AlertBanner } from "@/components/ui/alert-banner";

type Line = { id: string; description: string; quantity: number; unitAmountCents: number };

type Props = {
  projectId: string;
  quoteId: string;
  version: number;
  totalCents: number;
  lines: Line[];
};

export function SentQuotePanel({ projectId, quoteId, version, totalCents, lines }: Props) {
  const [approveState, approveAct, approvePending] = useActionState(approveQuoteAction, {} as ClientQuoteActionState);
  const [declineState, declineAct, declinePending] = useActionState(declineQuoteAction, {} as ClientQuoteActionState);

  const err = approveState.error ?? declineState.error;
  const busy = approvePending || declinePending;

  return (
    <div className="ws-elevated relative overflow-hidden p-6">
      <div aria-hidden="true" className="ws-mesh-soft" />
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="ws-eyebrow">Quote v{version} · Sent</span>
            <p className="mt-2 text-sm text-text-muted">
              Review the line items below and respond.
            </p>
          </div>
          <span className="ws-mono text-3xl font-semibold tabular-nums tracking-tight text-text-primary">
            {formatUsd(totalCents)}
          </span>
        </div>

        <ul className="mt-5 divide-y divide-[color:var(--border-subtle)] rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-sunken)]">
          {lines.map((l) => (
            <li
              key={l.id}
              className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3 text-sm"
            >
              <span className="text-text-secondary">{l.description}</span>
              <span className="ws-mono tabular-nums text-text-muted">
                {l.quantity} × {formatUsd(l.unitAmountCents)}
              </span>
            </li>
          ))}
        </ul>

        {err ? (
          <div className="mt-4">
            <AlertBanner tone="error">{err}</AlertBanner>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <form action={approveAct}>
            <input type="hidden" name="projectId" value={projectId} />
            <input type="hidden" name="quoteId" value={quoteId} />
            <AppButton
              type="submit"
              disabled={busy}
              loading={approvePending}
              roleVariant="portal"
              iconLeft={!approvePending ? <Check className="h-4 w-4" /> : undefined}
            >
              {approvePending ? "Approving" : "Approve quote"}
            </AppButton>
          </form>
          <form action={declineAct}>
            <input type="hidden" name="projectId" value={projectId} />
            <input type="hidden" name="quoteId" value={quoteId} />
            <AppButton
              type="submit"
              disabled={busy}
              loading={declinePending}
              variant="secondary"
              iconLeft={!declinePending ? <X className="h-4 w-4" /> : undefined}
            >
              {declinePending ? "Declining" : "Decline"}
            </AppButton>
          </form>
        </div>
      </div>
    </div>
  );
}
