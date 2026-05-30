import Link from "next/link";
import { ArrowRight, FilePlus, Inbox } from "lucide-react";
import { requireAppUser } from "@/lib/auth";
import { listProjectsForClient } from "@/lib/data/projects";
import { getUnreadNotificationCountsByProject } from "@/lib/data/notifications";
import { formatEnumLabel, statusGuidanceCopy, statusNextAction } from "@/lib/format";
import { AppButton } from "@/components/ui/app-button";
import { AppShell } from "@/components/ui/app-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { cx, pipelinePosition } from "@/lib/ui";

const ATTENTION_STATUSES = new Set([
  "quote_sent",
  "awaiting_final_payment",
  "awaiting_final_approval",
  "proof_sent",
  "revision_requested",
]);

export default async function PortalHome() {
  const user = await requireAppUser();
  const projects = await listProjectsForClient({ id: user.id, email: user.email });
  const unreadByProject = await getUnreadNotificationCountsByProject(
    user.id,
    projects.map((p) => p.id),
  );

  // Pick the most pressing project for the hero guidance
  const headlineProject =
    projects.find((p) => ATTENTION_STATUSES.has(p.status)) ??
    projects.find((p) => !["completed", "cancelled", "declined"].includes(p.status)) ??
    projects[0] ??
    null;

  const headlineNext = headlineProject ? statusNextAction(headlineProject.status) : null;

  return (
    <AppShell
      variant="portal"
      eyebrow="Your projects"
      title={
        headlineProject
          ? statusGuidanceCopy(headlineProject.status)
          : "Welcome back. Your projects are all here."
      }
      subtitle={
        headlineProject ? (
          <>
            Project:{" "}
            <Link
              href={`/portal/projects/${headlineProject.id}`}
              className="ws-focus-ring rounded font-medium text-text-secondary underline-offset-4 hover:underline"
            >
              {headlineProject.projectType}
            </Link>
            {headlineNext ? (
              <>
                {" · "}
                <span className="text-[color:var(--brand-primary)]">{headlineNext.label}</span>
              </>
            ) : null}
          </>
        ) : (
          <>Submit your first project below to start working with the studio.</>
        )
      }
      actions={
        <Link href="/projects/new">
          <AppButton roleVariant="portal" iconRight={<ArrowRight className="h-4 w-4" />}>
            New request
          </AppButton>
        </Link>
      }
    >
      {projects.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No projects yet."
          description="Start a new project request and the studio will receive it instantly."
          action={
            <Link href="/projects/new">
              <AppButton
                roleVariant="portal"
                iconLeft={<FilePlus className="h-3.5 w-3.5" />}
              >
                New project request
              </AppButton>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((p) => {
            const unread = unreadByProject.get(p.id) ?? 0;
            const pipeline = pipelinePosition(p.status);
            const guidance = statusGuidanceCopy(p.status);
            const nextAction = statusNextAction(p.status);
            const needsAttention = ATTENTION_STATUSES.has(p.status);

            return (
              <Link
                key={p.id}
                href={`/portal/projects/${p.id}`}
                className={cx(
                  "ws-focus-ring group relative block overflow-hidden rounded-2xl border p-5",
                  "bg-[color:var(--surface-raised)] transition",
                  "ws-hover-lift",
                  needsAttention
                    ? "border-[color:var(--brand-primary)]/40 shadow-[0_0_60px_-30px_var(--brand-primary-glow)]"
                    : "border-[color:var(--border-default)]",
                )}
              >
                {needsAttention ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-[2px] bg-[image:var(--role-portal-grad)]"
                  />
                ) : null}

                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="ws-mono text-[10px] uppercase tracking-[0.22em] text-text-faint">
                      {p.createdAt.toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <h3 className="mt-1 truncate text-lg font-semibold text-text-primary">
                      {p.projectType}
                    </h3>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={p.status} size="sm">
                      {formatEnumLabel(p.status)}
                    </StatusBadge>
                    {unread > 0 ? (
                      <span className="inline-flex items-center gap-1 ws-mono text-[10px] uppercase tracking-wider text-[color:var(--status-danger-fg)]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--status-danger-ring)]" />
                        {unread} update{unread === 1 ? "" : "s"}
                      </span>
                    ) : null}
                  </div>
                </div>

                <p className="mt-4 text-sm text-text-secondary">{guidance}</p>

                {nextAction ? (
                  <p className="mt-2 text-xs font-medium text-[color:var(--brand-primary)]">
                    {nextAction.label}
                  </p>
                ) : null}

                {pipeline.index >= 0 ? (
                  <div className="mt-5">
                    <div className="ws-pipeline">
                      {pipeline.states.map((s, i) => (
                        <span
                          key={i}
                          data-state={s.state === "done" || s.state === "active" ? s.state : undefined}
                        />
                      ))}
                    </div>
                    <p className="ws-mono mt-2 text-[10px] uppercase tracking-[0.22em] text-text-faint">
                      Step {pipeline.index + 1} of {pipeline.total}
                    </p>
                  </div>
                ) : null}

                <div className="mt-5 flex items-center justify-end text-xs text-text-faint transition group-hover:text-text-primary">
                  Open
                  <ArrowRight className="ml-1 h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
