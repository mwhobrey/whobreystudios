import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileSignature, FolderOpen, History, MessagesSquare } from "lucide-react";
import { ProjectFilesSection } from "@/components/project-files-section";
import { requireAppUser } from "@/lib/auth";
import { listFileAssetsForProject } from "@/lib/data/file-assets";
import { listMessagesForProject } from "@/lib/data/messages";
import { getProjectForViewer, listProjectStatusTransitions } from "@/lib/data/projects";
import { getProjectRevisionUsage } from "@/lib/data/revisions";
import { ProjectMessagesSection } from "@/components/project-messages";
import { AdminQuoteSection } from "./quote-section";
import { AppShell } from "@/components/ui/app-shell";
import { ProjectSummaryCards } from "@/components/project-summary-cards";
import { StatusTimeline, type TimelineEntry } from "@/components/ui/status-timeline";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatEnumLabel } from "@/lib/format";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminProjectDetailPage({ params }: PageProps) {
  const user = await requireAppUser();
  const { id } = await params;

  const viewer = { id: user.id, role: user.role };
  const [project, messageRows, fileRows, transitions] = await Promise.all([
    getProjectForViewer(id, viewer),
    listMessagesForProject(id, viewer),
    listFileAssetsForProject(id, viewer),
    listProjectStatusTransitions(id),
  ]);
  if (!project) notFound();
  const revisionUsage = await getProjectRevisionUsage(id, project.quotes[0]?.includedRevisions);

  const timelineEntries: TimelineEntry[] = transitions.map((t) => ({
    id: t.id,
    fromStatus: t.fromStatus,
    toStatus: t.toStatus,
    createdAt: t.createdAt,
    actorLabel: t.actorUser?.name ?? t.actorUser?.email ?? "System",
    reason: t.reason ?? null,
  }));

  return (
    <AppShell
      variant="admin"
      eyebrow={`Admin · ${formatEnumLabel(project.status)}`}
      title={project.projectType}
      subtitle={
        <>
          Submitted by{" "}
          <span className="text-text-secondary">
            {project.clientUser?.name ?? project.clientUser?.email ?? "—"}
          </span>{" "}
          ·{" "}
          <span className="ws-mono text-text-faint">{project.id}</span>
        </>
      }
      backLink={
        <Link
          href="/admin/projects"
          className="ws-focus-ring inline-flex items-center gap-1.5 rounded hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All projects
        </Link>
      }
      actions={
        <StatusBadge status={project.status}>{formatEnumLabel(project.status)}</StatusBadge>
      }
    >
      <div className="grid gap-8 lg:grid-cols-[20rem_minmax(0,1fr)]">
        {/* Left rail */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <ProjectSummaryCards project={project} showClient={true} />

          <section
            id="status-timeline"
            className="ws-panel p-5"
          >
            <header className="flex items-center gap-2">
              <History className="h-4 w-4 text-text-muted" />
              <h2 className="text-sm font-semibold text-text-primary">Status timeline</h2>
            </header>
            <div className="mt-4">
              <StatusTimeline entries={timelineEntries} />
            </div>
          </section>

          <SectionNav />
        </aside>

        {/* Right work area */}
        <div className="space-y-10">
          <SectionAnchor
            id="quote"
            icon={<FileSignature className="h-4 w-4" />}
            title="Quote"
            subtitle={`${revisionUsage.delivered}/${revisionUsage.included} revisions delivered${revisionUsage.remaining < 0 ? " · over limit" : ""}`}
          >
            <AdminQuoteSection
              projectId={project.id}
              projectStatus={project.status}
              revisionUsage={revisionUsage}
              quotes={project.quotes.map((q) => ({
                id: q.id,
                version: q.version,
                status: q.status,
                includedRevisions: q.includedRevisions,
                totalCents: q.totalCents,
                lineItems: q.lineItems.map((l) => ({
                  id: l.id,
                  description: l.description,
                  quantity: l.quantity,
                  unitAmountCents: l.unitAmountCents,
                })),
              }))}
            />
          </SectionAnchor>

          <SectionAnchor
            id="files"
            icon={<FolderOpen className="h-4 w-4" />}
            title="Files"
            subtitle="Drafts and deliverables for this project"
          >
            <ProjectFilesSection projectId={project.id} variant="admin" assets={fileRows} />
          </SectionAnchor>

          <SectionAnchor
            id="messages"
            icon={<MessagesSquare className="h-4 w-4" />}
            title="Messages"
            subtitle="Threaded discussion with the client"
          >
            <ProjectMessagesSection
              projectId={project.id}
              viewerId={user.id}
              variant="admin"
              messageRows={messageRows}
            />
          </SectionAnchor>
        </div>
      </div>
    </AppShell>
  );
}

function SectionNav() {
  const items = [
    { href: "#quote", label: "Quote" },
    { href: "#files", label: "Files" },
    { href: "#messages", label: "Messages" },
    { href: "#status-timeline", label: "Status timeline" },
  ];
  return (
    <nav className="ws-panel hidden p-4 lg:block">
      <p className="ws-eyebrow">Jump to</p>
      <ul className="mt-3 space-y-1 text-sm">
        {items.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              className="ws-focus-ring block rounded-md px-2 py-1.5 text-text-muted transition hover:bg-[color:var(--surface-overlay)] hover:text-text-primary"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function SectionAnchor({
  id,
  icon,
  title,
  subtitle,
  children,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="mb-4 flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--surface-raised)] text-text-muted">
          {icon}
        </span>
        <div>
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          {subtitle ? <p className="text-xs text-text-muted">{subtitle}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}
