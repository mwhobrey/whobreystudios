import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, FolderOpen } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getUnreadNotificationCountsByProject } from "@/lib/data/notifications";
import { listProjectsAdminPaginated } from "@/lib/data/projects";
import { formatEnumLabel } from "@/lib/format";
import { AppShell } from "@/components/ui/app-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { AppButton } from "@/components/ui/app-button";
import { cx } from "@/lib/ui";

type PageProps = {
  searchParams: Promise<{ page?: string; status?: string }>;
};

const FILTER_TABS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Active" },
  { value: "new_request", label: "New" },
  { value: "quote_sent", label: "Quote sent" },
  { value: "in_progress", label: "In progress" },
  { value: "final_revision", label: "Final revision" },
  { value: "awaiting_final_payment", label: "Awaiting payment" },
  { value: "completed", label: "Completed" },
];

export default async function AdminProjectsPage({ searchParams }: PageProps) {
  const user = await requireRole(["admin"]);
  const { page: rawPage, status: rawStatus } = await searchParams;
  const page = Math.max(1, Number.parseInt(rawPage ?? "1", 10) || 1);
  const limit = 50;
  const filter = rawStatus ?? "all";

  const { projects, total, totalPages } = await listProjectsAdminPaginated(page, limit);
  const unreadByProject = await getUnreadNotificationCountsByProject(
    user.id,
    projects.map((p) => p.id),
  );

  const filtered = applyFilter(projects, filter);

  return (
    <AppShell
      variant="admin"
      eyebrow="Admin · Projects"
      title="All projects"
      subtitle={
        <>
          {total} project{total === 1 ? "" : "s"} on file · Page {page} of{" "}
          {Math.max(1, totalPages)}
        </>
      }
    >
      {/* Filter pill row */}
      <div className="ws-fade-up flex flex-wrap gap-1.5">
        {FILTER_TABS.map((t) => {
          const active = filter === t.value;
          const href = t.value === "all" ? "/admin/projects" : `/admin/projects?status=${t.value}`;
          return (
            <Link
              key={t.value}
              href={href}
              className={cx(
                "ws-focus-ring rounded-full border px-3 py-1.5 text-xs font-medium transition",
                active
                  ? "border-[color:var(--brand-primary)]/50 bg-[color:var(--brand-primary)]/10 text-[color:var(--brand-primary)]"
                  : "border-[color:var(--border-default)] bg-[color:var(--surface-raised)] text-text-muted hover:border-[color:var(--border-strong)] hover:text-text-primary",
              )}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      {/* List */}
      <div className="mt-8">
        {filtered.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title={
              filter === "all"
                ? "No projects yet."
                : `No projects matching "${formatEnumLabel(filter)}".`
            }
            description="When clients submit new requests they will appear here."
          />
        ) : (
          <ul className="overflow-hidden rounded-2xl border border-[color:var(--border-default)] bg-[color:var(--surface-raised)]">
            {filtered.map((p, idx) => {
              const unread = unreadByProject.get(p.id) ?? 0;
              return (
                <li
                  key={p.id}
                  className={cx(
                    idx > 0 && "border-t border-[color:var(--border-subtle)]",
                  )}
                >
                  <Link
                    href={`/admin/projects/${p.id}`}
                    className="ws-focus-ring relative flex flex-col gap-3 px-5 py-4 transition hover:bg-[color:var(--surface-overlay)] sm:flex-row sm:items-center"
                  >
                    {unread > 0 ? (
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full bg-[image:var(--role-admin-grad)]"
                      />
                    ) : null}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-text-primary">
                          {p.projectType}
                        </p>
                        {unread > 0 ? (
                          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[color:var(--status-danger-ring)] px-1.5 text-[10px] font-semibold text-white">
                            {unread > 99 ? "99+" : unread}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-0.5 truncate text-xs text-text-muted">
                        {p.clientUser?.name ?? p.clientUser?.email ?? "—"}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-5">
                      <p className="ws-mono w-24 shrink-0 text-[11px] uppercase tracking-[0.18em] text-text-faint">
                        {p.createdAt.toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "2-digit",
                        })}
                      </p>
                      <StatusBadge status={p.status} size="sm">
                        {formatEnumLabel(p.status)}
                      </StatusBadge>
                      <ArrowRight className="hidden h-4 w-4 text-text-faint transition group-hover:translate-x-0.5 sm:inline-block" />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 ? (
        <nav className="mt-6 flex items-center justify-center gap-2 text-sm">
          {page > 1 ? (
            <Link href={paginationHref(page - 1, filter)}>
              <AppButton
                variant="secondary"
                size="sm"
                iconLeft={<ChevronLeft className="h-3.5 w-3.5" />}
              >
                Previous
              </AppButton>
            </Link>
          ) : (
            <span />
          )}
          <span className="ws-mono text-xs uppercase tracking-[0.22em] text-text-faint">
            {page} / {totalPages}
          </span>
          {page < totalPages ? (
            <Link href={paginationHref(page + 1, filter)}>
              <AppButton
                variant="secondary"
                size="sm"
                iconRight={<ChevronRight className="h-3.5 w-3.5" />}
              >
                Next
              </AppButton>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </AppShell>
  );
}

function paginationHref(page: number, filter: string) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (filter && filter !== "all") params.set("status", filter);
  const qs = params.toString();
  return `/admin/projects${qs ? `?${qs}` : ""}`;
}

type ProjectRow = Awaited<ReturnType<typeof listProjectsAdminPaginated>>["projects"][number];
function applyFilter(rows: ProjectRow[], filter: string): ProjectRow[] {
  if (filter === "all") return rows;
  if (filter === "open") {
    return rows.filter(
      (r) => !["completed", "cancelled", "declined"].includes(r.status),
    );
  }
  return rows.filter((r) => r.status === filter);
}
