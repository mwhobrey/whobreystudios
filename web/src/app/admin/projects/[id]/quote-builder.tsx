"use client";

import { useActionState, useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
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
  initialDepositPercent: number;
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

function validateRowsForSend(rows: LineRow[]): string | null {
  const active = rows.filter((r) => r.description.trim() || r.unitDollars.trim());
  if (active.length === 0) return "Add at least one line item before sending.";

  for (let i = 0; i < active.length; i++) {
    const row = active[i];
    const n = i + 1;
    if (!row.description.trim()) return `Line ${n}: description is required.`;
    if (!row.unitDollars.trim() || Number.parseFloat(row.unitDollars) <= 0) {
      return `Line ${n}: enter a unit price greater than $0.`;
    }
    if ((Number.parseFloat(row.unitDollars) || 0) * 100 < 1) {
      return `Line ${n}: unit price is too small.`;
    }
  }
  return null;
}

async function runSaveDraft(input: {
  projectId: string;
  quoteId: string;
  linesJson: string;
  includedRevisions: number;
  depositPercent: number;
}): Promise<QuoteActionState> {
  const fd = new FormData();
  fd.set("projectId", input.projectId);
  fd.set("quoteId", input.quoteId);
  fd.set("linesJson", input.linesJson);
  fd.set("includedRevisions", String(input.includedRevisions));
  fd.set("depositPercent", String(input.depositPercent));
  return saveQuoteDraftAction(undefined, fd);
}

export function QuoteBuilder({
  projectId,
  quoteId,
  initialIncludedRevisions,
  initialDepositPercent,
  initialLines,
}: Props) {
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
  const [depositPercent, setDepositPercent] = useState<number>(initialDepositPercent);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [isSending, startSendTransition] = useTransition();

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveGenRef = useRef(0);

  const linesJson = useMemo(() => JSON.stringify(toPayload(rows)), [rows]);
  const previewCents = useMemo(
    () => toPayload(rows).reduce((s, l) => s + l.quantity * l.unitAmountCents, 0),
    [rows],
  );

  const persistDraft = useCallback(async () => {
    const payload = toPayload(rows);
    if (payload.length === 0) return;

    const gen = ++saveGenRef.current;
    setSaveStatus("saving");
    setSaveError(null);

    const result = await runSaveDraft({
      projectId,
      quoteId,
      linesJson: JSON.stringify(payload),
      includedRevisions,
      depositPercent,
    });

    if (gen !== saveGenRef.current) return;
    if (result.error) {
      setSaveStatus("error");
      setSaveError(result.error);
    } else {
      setSaveStatus("saved");
      setSaveError(null);
    }
  }, [rows, projectId, quoteId, includedRevisions, depositPercent]);

  const scheduleAutosave = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void persistDraft();
    }, 600);
  }, [persistDraft]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function handleFieldBlur() {
    scheduleAutosave();
  }

  function handleMetaBlur() {
    scheduleAutosave();
  }

  function handleSend() {
    setSendError(null);
    const validationError = validateRowsForSend(rows);
    if (validationError) {
      setSendError(validationError);
      return;
    }

    startSendTransition(async () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }

      const saveResult = await runSaveDraft({
        projectId,
        quoteId,
        linesJson,
        includedRevisions,
        depositPercent,
      });
      if (saveResult.error) {
        setSendError(saveResult.error);
        setSaveStatus("error");
        setSaveError(saveResult.error);
        return;
      }

      const fd = new FormData();
      fd.set("projectId", projectId);
      fd.set("quoteId", quoteId);
      const sendResult = await sendQuoteAction(undefined, fd);
      if (sendResult.error) {
        setSendError(sendResult.error);
      }
    });
  }

  return (
    <div className="space-y-5">
      <div className="ws-panel flex flex-wrap items-end justify-between gap-4 p-4">
        <div>
          <span className="ws-eyebrow">Quote draft</span>
          <p className="mt-1 text-sm text-text-muted">
            Line items autosave when you leave a field. Send when everything looks right.
          </p>
          <p className="mt-1 text-xs text-text-faint">
            {saveStatus === "saving"
              ? "Saving…"
              : saveStatus === "saved"
                ? "Draft saved"
                : saveStatus === "error"
                  ? "Save failed"
                  : " "}
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
              onBlur={handleMetaBlur}
              className="ws-input w-20 tabular-nums"
            />
          </FormField>
          <FormField label="Deposit %" inline hint="Of quote total">
            <input
              type="number"
              min={1}
              max={99}
              value={depositPercent}
              onChange={(e) =>
                setDepositPercent(Math.min(99, Math.max(1, Number(e.target.value) || 1)))
              }
              onBlur={handleMetaBlur}
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

      {(saveError ?? sendError) ? (
        <AlertBanner tone="error">{sendError ?? saveError}</AlertBanner>
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
                onBlur={handleFieldBlur}
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
                onBlur={handleFieldBlur}
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
                onBlur={handleFieldBlur}
                className="ws-input tabular-nums"
                placeholder="0.00"
              />
            </FormField>
            <button
              type="button"
              aria-label="Remove line"
              className="ws-focus-ring inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[color:var(--border-subtle)] text-text-faint transition hover:border-[color:var(--status-danger-ring)] hover:text-[color:var(--status-danger-fg)] disabled:cursor-not-allowed disabled:opacity-30"
              disabled={rows.length <= 1}
              onClick={() => {
                setRows(rows.filter((_, i) => i !== idx));
                scheduleAutosave();
              }}
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

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[color:var(--border-subtle)] pt-5">
        <AppButton
          type="button"
          variant="secondary"
          loading={saveStatus === "saving"}
          onClick={() => void persistDraft()}
        >
          {saveStatus === "saving" ? "Saving" : "Save now"}
        </AppButton>
        <AppButton
          type="button"
          loading={isSending}
          roleVariant="admin"
          iconRight={!isSending ? <Send className="h-3.5 w-3.5" /> : undefined}
          onClick={handleSend}
        >
          {isSending ? "Sending" : "Send quote"}
        </AppButton>
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
