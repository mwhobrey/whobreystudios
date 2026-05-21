"use client";

import { useActionState } from "react";
import type { ProjectStatus } from "@/generated/prisma/enums";
import { formatEnumLabel } from "@/lib/format";
import { transitionProjectStatusAction, type ProjectActionState } from "./project-actions";
import { AppButton } from "@/components/ui/app-button";
import { AlertBanner } from "@/components/ui/alert-banner";
import { FormField } from "@/components/ui/form-field";

const STATUS_HINTS: Partial<Record<ProjectStatus, string>> = {
  awaiting_final_payment: "Client can pay the remaining balance (files stay locked until paid).",
  completed: "Mark delivered — project complete.",
  in_progress: "Work is actively underway.",
  on_hold: "Pause work until you resume.",
  cancelled: "Close the project.",
  final_revision: "Client requested revisions.",
};

type Props = {
  projectId: string;
  currentStatus: ProjectStatus;
  nextStatuses: ProjectStatus[];
};

export function ProjectStatusControls({ projectId, currentStatus, nextStatuses }: Props) {
  const [state, action, pending] = useActionState(
    transitionProjectStatusAction,
    {} as ProjectActionState,
  );

  if (nextStatuses.length === 0) {
    return (
      <p className="text-sm text-text-muted">
        Status is <strong className="text-text-primary">{formatEnumLabel(currentStatus)}</strong>
        {" — "}no further transitions from here.
      </p>
    );
  }

  return (
    <div className="ws-panel space-y-3 p-4">
      <div>
        <span className="ws-eyebrow">Update status</span>
        <p className="mt-1 text-sm text-text-muted">
          Move the project forward when work or payment milestones change.
        </p>
      </div>

      {state.error ? <AlertBanner tone="error">{state.error}</AlertBanner> : null}

      <form action={action} className="space-y-3">
        <input type="hidden" name="projectId" value={projectId} />
        <FormField label="Next status">
          <select name="to" defaultValue={nextStatuses[0]} className="ws-input">
            {nextStatuses.map((s) => (
              <option key={s} value={s}>
                {formatEnumLabel(s)}
              </option>
            ))}
          </select>
        </FormField>
        <p className="text-xs text-text-faint">
          {STATUS_HINTS[nextStatuses[0]] ?? "Updates the client-visible project state."}
        </p>
        <FormField label="Note for timeline (optional)">
          <input name="reason" className="ws-input" placeholder="e.g. Final files uploaded" />
        </FormField>
        <AppButton type="submit" loading={pending} roleVariant="admin">
          {pending ? "Updating" : "Update status"}
        </AppButton>
      </form>
    </div>
  );
}
