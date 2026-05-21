"use client";

import { useActionState, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { appendQuoteAddonAction, type QuoteActionState } from "./quote-actions";
import { AppButton } from "@/components/ui/app-button";
import { AlertBanner } from "@/components/ui/alert-banner";
import { FormField } from "@/components/ui/form-field";

type LineRow = { description: string; quantity: number; unitDollars: string };

type Props = { projectId: string; quoteId: string };

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

export function QuoteAddonForm({ projectId, quoteId }: Props) {
  const [rows, setRows] = useState<LineRow[]>([
    { description: "", quantity: 1, unitDollars: "" },
  ]);
  const linesJson = useMemo(() => JSON.stringify(toPayload(rows)), [rows]);
  const [state, action, pending] = useActionState(appendQuoteAddonAction, {} as QuoteActionState);

  return (
    <div className="ws-panel space-y-4 p-4">
      <div>
        <span className="ws-eyebrow">Invoice add-ons</span>
        <p className="mt-1 text-sm text-text-muted">
          Add line items after deposit is paid. Client pays the updated balance at final checkout
          (no second deposit).
        </p>
      </div>

      {state.error ? <AlertBanner tone="error">{state.error}</AlertBanner> : null}

      {rows.map((row, idx) => (
        <div
          key={idx}
          className="grid items-end gap-3 rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-raised)]/70 p-3 sm:grid-cols-[1fr_5rem_7rem]"
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
              placeholder="Add-on description"
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
            />
          </FormField>
        </div>
      ))}

      <button
        type="button"
        className="ws-focus-ring inline-flex items-center gap-1.5 text-xs font-medium text-text-muted"
        onClick={() => setRows([...rows, { description: "", quantity: 1, unitDollars: "" }])}
      >
        <Plus className="h-3 w-3" />
        Add line
      </button>

      <form action={action}>
        <input type="hidden" name="projectId" value={projectId} />
        <input type="hidden" name="quoteId" value={quoteId} />
        <input type="hidden" name="linesJson" value={linesJson} readOnly />
        <AppButton type="submit" loading={pending} roleVariant="admin">
          {pending ? "Adding" : "Add to invoice"}
        </AppButton>
      </form>
    </div>
  );
}
