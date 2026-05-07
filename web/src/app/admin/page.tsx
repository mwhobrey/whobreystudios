import Link from "next/link";
import {
  ArrowRight,
  Bell,
  CalendarClock,
  ClipboardList,
  Coins,
  FolderKanban,
  Hammer,
  ListChecks,
  Settings2,
  Sparkles,
} from "lucide-react";
import { requireAppUser } from "@/lib/auth";
import { listProjectsAdminPaginated } from "@/lib/data/projects";
import { getUnreadNotificationCount } from "@/lib/data/notifications";
import { formatEnumLabel } from "@/lib/format";
import { AppButton } from "@/components/ui/app-button";
import { AppShell } from "@/components/ui/app-shell";
import { KpiCard } from "@/components/ui/kpi-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";

const QUEUE_PRIORITY: Record<string, number> = {
  new_request: 0,
  final_revision: 1,
  in_progress: 2,
  awaiting_final_payment: 3,
  quote_sent: 4,
  approved: 5,
};

export default async function AdminHome() {
  const user = await requireAppUser();
  const [{ projects, total }, unreadCount] = await Promise.all([
    listProjectsAdminPaginated(1, 50),
    getUnreadNotificationCount(user.id),
  ]);

  const activeProjects = projects.filter(
    (p) => !["completed", "cancelled", "declined", "on_hold"].includes(p.status),
  );
  const newRequests = projects.filter((p) => p.status === "new_request");
  const inProgress = projects.filter(
    (p) => p.status === "in_progress" || p.status === "final_revision",
  );
  const awaitingPayment = projects.filter((p) => p.status === "awaiting_final_payment");

  const queue = [...projects]
    .filter((p) => !["completed", "cancelled", "declined"].includes(p.status))
    .sort((a, b) => {
      const ap = QUEUE_PRIORITY[a.status] ?? 99;
      const bp = QUEUE_PRIORITY[b.status] ?? 99;
      if (ap !== bp) return ap - bp;
      return b.createdAt.getTime() - a.createdAt.getTime();
    })
    .slice(0, 5);

  return (
    <AppShell
      variant="admin"
      eyebrow="Admin"
      title={`Good ${greetingForNow()}, ${firstName(user.name ?? user.email ?? "Admin")}.`}
      subtitle={
        <>
          {newRequests.length > 0 ? (
            <>
              <span className="font-medium text-text-primary">
                {newRequests.length} new request{newRequests.length === 1 ? "" : "s"}
              </span>{" "}
              waiting on a quote.
            </>
          ) : (
            <>The queue is clear. Nothing waiting on you right now.</>
          )}
        </>
      }
    >
      {/* KPI row */}
      <div className="ws-fade-up grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard
          label="Active projects"
          value={activeProjects.length}
          hint={`${total} total projects`}
          icon={FolderKanban}
          accent="admin"
        />
        <KpiCard
          label="New requests"
          value={newRequests.length}
          hint="Need a quote"
          icon={Sparkles}
        />
        <KpiCard
          label="In progress"
          value={inProgress.length}
          hint="Active design rounds"
          icon={Hammer}
        />
        <KpiCard
          label="Awaiting payment"
          value={awaitingPayment.length}
          hint="Files locked until cleared"
          icon={Coins}
        />
        <KpiCard
          label="Unread alerts"
          value={unreadCount}
          hint="Across all your projects"
          icon={Bell}
        />
      </div>

      {/* Today's queue */}
      <section className="mt-12">
        <div className="flex items-end justify-between">
          <div>
            <p className="ws-eyebrow text-text-faint">Today&rsquo;s queue</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-text-primary">
              What needs you next
            </h2>
          </div>
          <Link href="/admin/projects">
            <AppButton variant="secondary" size="sm" iconRight={<ArrowRight className="h-4 w-4" />}>
              All projects
            </AppButton>
          </Link>
        </div>

        <div className="mt-4">
          {queue.length === 0 ? (
            <EmptyState
              icon={ListChecks}
              title="Nothing waiting on you."
              description="When a client submits a new request or responds to a quote, it lands here."
            />
          ) : (
            <ul className="divide-y divide-[color:var(--border-subtle)] overflow-hidden rounded-2xl border border-[color:var(--border-default)] bg-[color:var(--surface-raised)]">
              {queue.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/admin/projects/${p.id}`}
                    className="ws-focus-ring flex flex-col gap-2 px-4 py-3.5 transition hover:bg-[color:var(--surface-overlay)] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="ws-mono mt-0.5 shrink-0 text-[10px] uppercase tracking-[0.22em] text-text-faint">
                        {p.createdAt.toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-text-primary">
                          {p.projectType}
                        </p>
                        <p className="truncate text-xs text-text-muted">
                          {p.clientUser?.name ?? p.clientUser?.email ?? "—"}
                          {p.deadline ? (
                            <>
                              {" "}
                              · Due{" "}
                              {p.deadline.toLocaleDateString(undefined, {
                                dateStyle: "medium",
                              })}
                            </>
                          ) : null}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={p.status} size="sm">
                        {formatEnumLabel(p.status)}
                      </StatusBadge>
                      <ArrowRight
                        className="h-4 w-4 text-text-faint transition group-hover:text-text-primary"
                        aria-hidden="true"
                      />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Quick-jump tiles */}
      <section className="mt-12">
        <p className="ws-eyebrow text-text-faint">Settings &amp; tools</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <QuickTile
            href="/admin/projects"
            icon={ClipboardList}
            title="All projects"
            subtitle={`${total} project${total === 1 ? "" : "s"} on file`}
          />
          <QuickTile
            href="/admin/settings/service-types"
            icon={CalendarClock}
            title="Service types"
            subtitle="Catalog clients pick from on intake"
          />
          <QuickTile
            href="/admin/settings/policies"
            icon={Settings2}
            title="Policy settings"
            subtitle="Revisions, payment gates, legal links"
          />
        </div>
      </section>
    </AppShell>
  );
}

function QuickTile({
  href,
  icon: Icon,
  title,
  subtitle,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="ws-focus-ring ws-hover-lift group block rounded-2xl border border-[color:var(--border-default)] bg-[color:var(--surface-raised)] p-5"
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-overlay)] text-[color:var(--role-admin-tint)]">
          <Icon className="h-4 w-4" />
        </span>
        <ArrowRight className="h-4 w-4 text-text-faint transition group-hover:translate-x-0.5 group-hover:text-text-primary" />
      </div>
      <p className="mt-4 text-base font-semibold text-text-primary">{title}</p>
      <p className="mt-1 text-xs text-text-muted">{subtitle}</p>
    </Link>
  );
}

function greetingForNow(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "evening";
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

function firstName(label: string): string {
  const trimmed = label.trim();
  if (!trimmed) return "there";
  const atIdx = trimmed.indexOf("@");
  const head = atIdx >= 0 ? trimmed.slice(0, atIdx) : trimmed;
  const space = head.split(/[\s._-]+/)[0];
  return space.charAt(0).toUpperCase() + space.slice(1);
}
