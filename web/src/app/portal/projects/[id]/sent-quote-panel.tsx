"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
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
  depositPercent: number;
  depositCents: number;
  balanceCents: number;
  lines: Line[];
};

export function SentQuotePanel({
  projectId,
  quoteId,
  version,
  totalCents,
  depositPercent,
  depositCents,
  balanceCents,
  lines,
}: Props) {
  const [approveState, approveAct, approvePending] = useActionState(approveQuoteAction, {} as ClientQuoteActionState);
  const [declineState, declineAct, declinePending] = useActionState(declineQuoteAction, {} as ClientQuoteActionState);

  const [acceptedTerms, setAcceptedTerms] = useState(false);
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

        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div>
            <span className="ws-eyebrow">Deposit ({depositPercent}%)</span>
            <p className="ws-mono mt-1 tabular-nums text-text-primary">
              {formatUsd(depositCents)}
            </p>
          </div>
          <div>
            <span className="ws-eyebrow">Balance due</span>
            <p className="ws-mono mt-1 tabular-nums text-text-primary">
              {formatUsd(balanceCents)}
            </p>
          </div>
        </div>

        {err ? (
          <div className="mt-4">
            <AlertBanner tone="error">{err}</AlertBanner>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap items-end gap-3">
          <form action={approveAct} className="flex min-w-[min(100%,20rem)] flex-1 flex-col gap-4">
            <input type="hidden" name="projectId" value={projectId} />
            <input type="hidden" name="quoteId" value={quoteId} />
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-sunken)] px-4 py-3 text-sm text-text-secondary">
              <input
                type="checkbox"
                name="acceptedTerms"
                value="on"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[color:var(--brand-primary)]"
              />
              <span>
                I agree to the{" "}
                <Link
                  href="/legal/terms"
                  target="_blank"
                  className="font-medium text-[color:var(--brand-primary)] underline-offset-2 hover:underline"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/legal/refund"
                  target="_blank"
                  className="font-medium text-[color:var(--brand-primary)] underline-offset-2 hover:underline"
                >
                  Refund &amp; Cancellation Policy
                </Link>
                .
              </span>
            </label>
            <AppButton
              type="submit"
              disabled={busy || !acceptedTerms}
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
