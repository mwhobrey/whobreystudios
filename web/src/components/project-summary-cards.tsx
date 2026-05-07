import { formatEnumLabel } from "@/lib/format";
import { StatusBadge } from "@/components/ui/status-badge";
import { cx } from "@/lib/ui";

type ProjectSummary = {
  id: string;
  status: string;
  createdAt: Date;
  serviceType?: { name: string } | null;
  projectType: string;
  fullName: string;
  businessName?: string | null;
  phone: string;
  contactEmail: string;
  preferredContactMethod: string;
  deadline?: Date | null;
  notes?: string | null;
  clientUser?: { email?: string | null; name?: string | null } | null;
};

type Props = {
  project: ProjectSummary;
  showClient: boolean;
  /** "stack" = single column compact (sidebar); "grid" = two-column wide. */
  layout?: "stack" | "grid";
};

export function ProjectSummaryCards({ project, showClient, layout = "stack" }: Props) {
  const isGrid = layout === "grid";

  return (
    <dl
      className={cx(
        "ws-panel divide-y divide-[color:var(--border-subtle)] p-0",
        isGrid && "grid divide-y-0 sm:grid-cols-2 sm:divide-x sm:[&>*]:border-b",
      )}
    >
      <Field label="Status">
        <StatusBadge status={project.status} size="sm">
          {formatEnumLabel(project.status)}
        </StatusBadge>
      </Field>
      <Field label="Submitted">
        <span className="ws-mono text-xs text-text-secondary">
          {project.createdAt.toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </span>
      </Field>
      {showClient ? (
        <Field label="Client account">
          <span className="text-text-primary">{project.clientUser?.email ?? "—"}</span>
          {project.clientUser?.name ? (
            <span className="block text-xs text-text-muted">{project.clientUser.name}</span>
          ) : null}
        </Field>
      ) : null}
      <Field label="Project type">
        <span className="text-text-primary">{project.serviceType?.name ?? project.projectType}</span>
      </Field>
      <Field label="Full name">
        <span className="text-text-primary">{project.fullName}</span>
      </Field>
      {project.businessName ? (
        <Field label="Business">
          <span className="text-text-primary">{project.businessName}</span>
        </Field>
      ) : null}
      <Field label="Phone">
        <span className="ws-mono text-text-primary">{project.phone}</span>
      </Field>
      <Field label="Contact email">
        <span className="ws-mono text-text-primary">{project.contactEmail}</span>
      </Field>
      <Field label="Preferred contact">
        <span className="text-text-primary">{formatEnumLabel(project.preferredContactMethod)}</span>
      </Field>
      {project.deadline ? (
        <Field label="Deadline">
          <span className="text-text-primary">
            {project.deadline.toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </span>
        </Field>
      ) : null}
      {project.notes ? (
        <Field label="Notes" wide>
          <span className="block whitespace-pre-wrap text-text-secondary">{project.notes}</span>
        </Field>
      ) : null}
    </dl>
  );
}

function Field({
  label,
  children,
  wide,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={cx("flex flex-col gap-1 px-4 py-3", wide && "sm:col-span-2")}>
      <dt className="ws-eyebrow text-text-faint">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}
