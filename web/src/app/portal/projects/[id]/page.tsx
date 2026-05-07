import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileSignature, FolderOpen, Lock, MessagesSquare } from "lucide-react";
import { ProjectFilesSection } from "@/components/project-files-section";
import { requireAppUser } from "@/lib/auth";
import { ProjectMessagesSection } from "@/components/project-messages";
import { listFileAssetsForProject } from "@/lib/data/file-assets";
import { listMessagesForProject } from "@/lib/data/messages";
import { getProjectForViewer } from "@/lib/data/projects";
import { getProjectRevisionUsage } from "@/lib/data/revisions";
import { getWorkspaceSettings } from "@/lib/data/workspace-settings";
import { formatEnumLabel, formatUsd, statusGuidanceCopy, statusNextAction } from "@/lib/format";
import { SentQuotePanel } from "./sent-quote-panel";
import { AppShell } from "@/components/ui/app-shell";
import { AlertBanner } from "@/components/ui/alert-banner";
import { ProjectSummaryCards } from "@/components/project-summary-cards";
import { StatusBadge } from "@/components/ui/status-badge";
import { pipelinePosition } from "@/lib/ui";

type PageProps = { params: Promise<{ id: string }> };

export default async function PortalProjectDetailPage({ params }: PageProps) {
  const user = await requireAppUser();
  const { id } = await params;

  const viewer = { id: user.id, role: user.role };
  const [project, messageRows, fileRows, settings] = await Promise.all([
    getProjectForViewer(id, viewer),
    listMessagesForProject(id, viewer),
    listFileAssetsForProject(id, viewer),
    getWorkspaceSettings(),
  ]);
  if (!project) notFound();

  const latestQuote = project.quotes[0];
  const revisionUsage = await getProjectRevisionUsage(id, latestQuote?.includedRevisions);
  const guidance = statusGuidanceCopy(project.status);
  const nextAction = statusNextAction(project.status);
  const pipeline = pipelinePosition(project.status);

  const finalFilesLocked =
    settings.finalFilesRequirePayment && project.status === "awaiting_final_payment";

  return (
    <AppShell
      variant="portal"
      eyebrow={`Your project · ${formatEnumLabel(project.status)}`}
      title={project.projectType}
      subtitle={
        <>
          Submitted{" "}
          {project.createdAt.toLocaleDateString(undefined, { dateStyle: "long" })} ·{" "}
          <span className="ws-mono text-text-faint">{project.id}</span>
        </>
      }
      backLink={
        <Link
          href="/portal"
          className="ws-focus-ring inline-flex items-center gap-1.5 rounded hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Your projects
        </Link>
      }
      actions={
        <StatusBadge status={project.status}>{formatEnumLabel(project.status)}</StatusBadge>
      }
    >
      {/* Hero guidance card */}
      <div className="ws-fade-up ws-elevated relative overflow-hidden p-6">
        <div aria-hidden="true" className="ws-mesh-soft" />
        <div className="relative">
          <p className="ws-eyebrow">Where things stand</p>
          <p className="ws-display mt-2 text-2xl tracking-tight text-text-primary sm:text-3xl">
            {guidance}
          </p>
          {nextAction ? (
            <p className="mt-3 text-sm font-medium text-[color:var(--brand-primary)]">
              {nextAction.label}
            </p>
          ) : null}

          {pipeline.index >= 0 ? (
            <div className="mt-6">
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
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[20rem_minmax(0,1fr)]">
        {/* Left rail */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <ProjectSummaryCards project={project} showClient={false} />

          <section className="ws-panel p-5">
            <p className="ws-eyebrow">Revision allowance</p>
            <p className="mt-2 ws-mono text-sm tabular-nums text-text-secondary">
              {revisionUsage.delivered}/{revisionUsage.included} delivered
            </p>
            <p className="mt-1 text-xs text-text-muted">
              {revisionUsage.remaining >= 0
                ? `${revisionUsage.remaining} remaining.`
                : "Allowance exceeded; additional rounds may be billed as add-ons."}
            </p>
            {revisionUsage.isNearLimit ? (
              <div className="mt-3">
                <AlertBanner tone="warning">
                  {revisionUsage.isOverLimit
                    ? "You're beyond included revisions; please confirm next steps with the studio."
                    : "You're close to the included revision limit."}
                </AlertBanner>
              </div>
            ) : null}
          </section>

          {settings.termsUrl || settings.privacyUrl || settings.refundPolicyUrl ? (
            <section className="ws-panel p-4">
              <p className="ws-eyebrow">Studio policies</p>
              <ul className="mt-3 flex flex-wrap gap-2 text-xs">
                {settings.termsUrl ? (
                  <li>
                    <a
                      href={settings.termsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="ws-focus-ring rounded-md border border-[color:var(--border-subtle)] bg-[color:var(--surface-sunken)] px-2 py-1 text-text-secondary transition hover:text-text-primary"
                    >
                      Terms
                    </a>
                  </li>
                ) : null}
                {settings.privacyUrl ? (
                  <li>
                    <a
                      href={settings.privacyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="ws-focus-ring rounded-md border border-[color:var(--border-subtle)] bg-[color:var(--surface-sunken)] px-2 py-1 text-text-secondary transition hover:text-text-primary"
                    >
                      Privacy
                    </a>
                  </li>
                ) : null}
                {settings.refundPolicyUrl ? (
                  <li>
                    <a
                      href={settings.refundPolicyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="ws-focus-ring rounded-md border border-[color:var(--border-subtle)] bg-[color:var(--surface-sunken)] px-2 py-1 text-text-secondary transition hover:text-text-primary"
                    >
                      Refund policy
                    </a>
                  </li>
                ) : null}
              </ul>
            </section>
          ) : null}
        </aside>

        {/* Right work area */}
        <div className="space-y-10">
          {latestQuote?.status === "sent" ? (
            <SectionAnchor
              id="quote"
              icon={<FileSignature className="h-4 w-4" />}
              title="Quote awaiting your review"
              subtitle="Approve, decline, or send a question to the studio"
            >
              <SentQuotePanel
                projectId={project.id}
                quoteId={latestQuote.id}
                version={latestQuote.version}
                totalCents={latestQuote.totalCents}
                lines={latestQuote.lineItems.map((l) => ({
                  id: l.id,
                  description: l.description,
                  quantity: l.quantity,
                  unitAmountCents: l.unitAmountCents,
                }))}
              />
            </SectionAnchor>
          ) : null}

          {latestQuote?.status === "approved" ? (
            <SectionAnchor
              id="quote"
              icon={<FileSignature className="h-4 w-4" />}
              title="Quote approved"
              subtitle={`v${latestQuote.version} · Total ${formatUsd(latestQuote.totalCents)}`}
            >
              {settings.finalFilesRequirePayment ? (
                <AlertBanner tone="info">
                  Final downloadable files remain locked until payment is cleared.
                </AlertBanner>
              ) : (
                <AlertBanner tone="success">
                  Final downloadable files are available as soon as the studio delivers them.
                </AlertBanner>
              )}
            </SectionAnchor>
          ) : null}

          {latestQuote?.status === "declined" ? (
            <SectionAnchor
              id="quote"
              icon={<FileSignature className="h-4 w-4" />}
              title="Quote declined"
              subtitle={`v${latestQuote.version}`}
            >
              <AlertBanner tone="warning">
                Quote v{latestQuote.version} was declined. The studio may send a revised version.
                Watch this page or your email.
              </AlertBanner>
            </SectionAnchor>
          ) : null}

          <SectionAnchor
            id="files"
            icon={<FolderOpen className="h-4 w-4" />}
            title="Files"
            subtitle={
              finalFilesLocked
                ? "Final files are locked until payment clears"
                : "Drafts, proofs, and final deliverables"
            }
            badge={
              finalFilesLocked ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-[color:var(--status-payment-ring)]/60 bg-[color:var(--status-payment-bg)] px-2 py-0.5 text-[10px] font-medium text-[color:var(--status-payment-fg)]">
                  <Lock className="h-3 w-3" />
                  Locked
                </span>
              ) : null
            }
          >
            <ProjectFilesSection projectId={project.id} variant="portal" assets={fileRows} />
          </SectionAnchor>

          <SectionAnchor
            id="messages"
            icon={<MessagesSquare className="h-4 w-4" />}
            title="Messages"
            subtitle="Talk to the studio"
          >
            <ProjectMessagesSection
              projectId={project.id}
              viewerId={user.id}
              variant="portal"
              messageRows={messageRows}
            />
          </SectionAnchor>
        </div>
      </div>
    </AppShell>
  );
}

function SectionAnchor({
  id,
  icon,
  title,
  subtitle,
  badge,
  children,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--surface-raised)] text-text-muted">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          {subtitle ? <p className="text-xs text-text-muted">{subtitle}</p> : null}
        </div>
        {badge}
      </div>
      {children}
    </section>
  );
}
