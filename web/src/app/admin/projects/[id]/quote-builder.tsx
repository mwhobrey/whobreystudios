"use client";

import { useActionState, useMemo, useState } from "react";
import { Plus, Send, Trash2 } from "lucide-react";
import {
  resolveDeclinedQuoteAction,
  saveQuoteDraftAction,
  sendQuoteAction,
  startQuoteAction,
  type QuoteActionState,
} from "./quote-actions";
import { formatUsd } from "@/lib/format";
import { AppButton } from "@/components/ui/app-button";
import { AlertBanner } from "@/components/ui/alert-banner";
import { FormField } from "@/components/ui/form-field";

type LineRow = {
  description: string;
  quantity: number;
  unitDollars: string;
};

type Props = {
  projectId: string;
  quoteId: string;
  initialIncludedRevisions: number;
  initialLines: { description: string; quantity: number; unitAmountCents: number }[];
};

function dollarsFromCents(cents: number) {
  return (cents / 100).toFixed(2);
}

function toPayload(lines: LineRow[]) {
  return lines
    .filter((l) => l.description.trim() !== "")
    .map((l) => ({
      description: l.description.trim(),
      quantity: Math.max(1, Math.floor(l.quantity) || 1),
      unitAmountCents: Math.max(
        0,
        Math.round((Number.parseFloat(l.unitDollars) || 0) * 100),
      ),
    }));
}

export function QuoteBuilder({ projectId, quoteId, initialIncludedRevisions, initialLines }: Props) {
  const [rows, setRows] = useState<LineRow[]>(() =>
    initialLines.length > 0
      ? initialLines.map((l) => ({
          description: l.description,
          quantity: l.quantity,
          unitDollars: dollarsFromCents(l.unitAmountCents),
        }))
      : [{ description: "", quantity: 1, unitDollars: "" }],
  );
  const [includedRevisions, setIncludedRevisions] = useState<number>(initialIncludedRevisions);

  const linesJson = useMemo(() => JSON.stringify(toPayload(rows)), [rows]);
  const previewCents = useMemo(
    () => toPayload(rows).reduce((s, l) => s + l.quantity * l.unitAmountCents, 0),
    [rows],
  );

  const [saveState, saveAction, savePending] = useActionState(saveQuoteDraftAction, {} as QuoteActionState);
  const [sendState, sendAction, sendPending] = useActionState(sendQuoteAction, {} as QuoteActionState);

  return (
    <div className="space-y-5">
      <div className="ws-panel flex flex-wrap items-end justify-between gap-4 p-4">
        <div>
          <span className="ws-eyebrow">Quote draft</span>
          <p className="mt-1 text-sm text-text-muted">
            Add line items below. Save before sending — send reads the last saved draft.
          </p>
        </div>
        <div className="flex items-end gap-5">
          <FormField label="Included revisions" inline>
            <input
              type="number"
              min={1}
              max={20}
              value={includedRevisions}
              onChange={(e) => setIncludedRevisions(Math.max(1, Number(e.target.value) || 1))}
              className="ws-input w-20 tabular-nums"
            />
          </FormField>
          <div className="flex flex-col items-end">
            <span className="ws-eyebrow">Preview total</span>
            <span className="ws-mono text-2xl font-semibold tabular-nums tracking-tight text-text-primary">
              {formatUsd(previewCents)}
            </span>
          </div>
        </div>
      </div>

      {(saveState.error ?? sendState.error) ? (
        <AlertBanner tone="error">{saveState.error ?? sendState.error}</AlertBanner>
      ) : null}

      <div className="space-y-2">
        {rows.map((row, idx) => (
          <div
            key={idx}
            className="grid items-end gap-3 rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-raised)]/70 p-3 sm:grid-cols-[1fr_5rem_7rem_auto]"
          >
            <FormField label="Description">
              <input
                value={row.description}
                onChange={(e) => {
                  const next = [...rows];
                  next[idx] = { ...row, description: e.target.value };
                  setRows(next);
                }}
                className="ws-input"
                placeholder="e.g. Logo design — 3 concepts"
              />
            </FormField>
            <FormField label="Qty">
              <input
                type="number"
                min={1}
                value={row.quantity}
                onChange={(e) => {
                  const next = [...rows];
                  next[idx] = { ...row, quantity: Number(e.target.value) || 1 };
                  setRows(next);
                }}
                className="ws-input tabular-nums"
              />
            </FormField>
            <FormField label="Unit ($)">
              <input
                inputMode="decimal"
                value={row.unitDollars}
                onChange={(e) => {
                  const next = [...rows];
                  next[idx] = { ...row, unitDollars: e.target.value };
                  setRows(next);
                }}
                className="ws-input tabular-nums"
                placeholder="0.00"
              />
            </FormField>
            <button
              type="button"
              aria-label="Remove line"
              className="ws-focus-ring inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[color:var(--border-subtle)] text-text-faint transition hover:border-[color:var(--status-danger-ring)] hover:text-[color:var(--status-danger-fg)] disabled:opacity-30 disabled:cursor-not-allowed"
              disabled={rows.length <= 1}
              onClick={() => setRows(rows.filter((_, i) => i !== idx))}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="ws-focus-ring inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[color:var(--border-default)] px-3 py-1.5 text-xs font-medium text-text-muted transition hover:border-[color:var(--brand-primary)]/50 hover:text-text-primary"
        onClick={() => setRows([...rows, { description: "", quantity: 1, unitDollars: "" }])}
      >
        <Plus className="h-3 w-3" />
        Add line
      </button>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--border-subtle)] pt-5">
        <p className="text-xs text-text-faint">
          <strong className="text-text-secondary">Save draft</strong> before{" "}
          <strong className="text-text-secondary">Send quote</strong> — send uses the last saved
          state.
        </p>
        <div className="flex flex-wrap gap-2">
          <form action={saveAction}>
            <input type="hidden" name="projectId" value={projectId} />
            <input type="hidden" name="quoteId" value={quoteId} />
            <input type="hidden" name="linesJson" value={linesJson} readOnly />
            <input
              type="hidden"
              name="includedRevisions"
              value={String(includedRevisions)}
              readOnly
            />
            <AppButton type="submit" loading={savePending} variant="secondary">
              {savePending ? "Saving" : "Save draft"}
            </AppButton>
          </form>

          <form action={sendAction}>
            <input type="hidden" name="projectId" value={projectId} />
            <input type="hidden" name="quoteId" value={quoteId} />
            <AppButton
              type="submit"
              loading={sendPending}
              roleVariant="admin"
              iconRight={!sendPending ? <Send className="h-3.5 w-3.5" /> : undefined}
            >
              {sendPending ? "Sending" : "Send quote"}
            </AppButton>
          </form>
        </div>
      </div>
    </div>
  );
}

export function StartQuoteButton({ projectId }: { projectId: string }) {
  const [state, action, pending] = useActionState(startQuoteAction, {} as QuoteActionState);

  return (
    <div className="flex flex-col items-center gap-2">
      {state.error ? <AlertBanner tone="error">{state.error}</AlertBanner> : null}
      <form action={action}>
        <input type="hidden" name="projectId" value={projectId} />
        <AppButton
          type="submit"
          loading={pending}
          roleVariant="admin"
          iconLeft={!pending ? <Plus className="h-3.5 w-3.5" /> : undefined}
        >
          {pending ? "Starting" : "Start quote"}
        </AppButton>
      </form>
    </div>
  );
}

export function DeclineDecisionForm({ projectId }: { projectId: string }) {
  const [state, action, pending] = useActionState(resolveDeclinedQuoteAction, {} as QuoteActionState);
  return (
    <div className="ws-panel space-y-3 p-4">
      {state.error ? <AlertBanner tone="error">{state.error}</AlertBanner> : null}
      <form action={action} className="space-y-3">
        <input type="hidden" name="projectId" value={projectId} />
        <FormField label="Decision">
          <select name="decision" defaultValue="revise" className="ws-input">
            <option value="revise">Revise and re-quote</option>
            <option value="close">Close project</option>
          </select>
        </FormField>
        <FormField
          label="Client note (optional)"
          hint="What should the client see for this decision?"
        >
          <textarea
            name="reason"
            rows={2}
            className="ws-input"
            placeholder="Optional context for the client"
          />
        </FormField>
        <AppButton type="submit" loading={pending} roleVariant="admin">
          {pending ? "Applying" : "Apply decision"}
        </AppButton>
      </form>
    </div>
  );
}
