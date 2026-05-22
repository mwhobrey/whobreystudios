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
import { PolicyLinks } from "@/components/legal/policy-links";
import { getWorkspaceSettings } from "@/lib/data/workspace-settings";
import { getProjectPaymentState } from "@/lib/data/project-payment-state";
import { formatEnumLabel, formatUsd, statusGuidanceCopy, statusNextAction } from "@/lib/format";
import { computeQuotePaymentBreakdown } from "@/lib/payments/amounts";
import { isStripeConfigured } from "@/lib/payments/stripe-client";
import { PaymentPanel } from "./payment-panel";
import { SentQuotePanel } from "./sent-quote-panel";
import { AppShell } from "@/components/ui/app-shell";
import { AlertBanner } from "@/components/ui/alert-banner";
import { ProjectSummaryCards } from "@/components/project-summary-cards";
import { StatusBadge } from "@/components/ui/status-badge";
import { pipelinePosition } from "@/lib/ui";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ payment?: string }>;
};

export default async function PortalProjectDetailPage({ params, searchParams }: PageProps) {
  const user = await requireAppUser();
  const { id } = await params;
  const { payment: paymentFlash } = await searchParams;

  const viewer = { id: user.id, role: user.role, email: user.email };
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

  const paymentState = await getProjectPaymentState(id);

  const finalFilesLocked =
    settings.finalFilesRequirePayment &&
    !paymentState.finalPaid &&
    project.status !== "completed";

  const quoteBreakdown =
    latestQuote && latestQuote.totalCents > 0
      ? await computeQuotePaymentBreakdown(latestQuote)
      : null;
  const stripeReady = isStripeConfigured();

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
      {paymentFlash === "success" ? (
        <AlertBanner tone="success">
          Payment received — thank you. This page will update as soon as processing completes.
        </AlertBanner>
      ) : null}
      {paymentFlash === "cancelled" ? (
        <AlertBanner tone="warning">Checkout was cancelled. You can try again when ready.</AlertBanner>
      ) : null}

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

          <section className="ws-panel p-4">
            <p className="ws-eyebrow">Studio policies</p>
            <PolicyLinks className="mt-3" />
          </section>
        </aside>

        {/* Right work area */}
        <div className="space-y-10">
          {latestQuote?.status === "sent" && quoteBreakdown ? (
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
                depositPercent={quoteBreakdown.depositPercent}
                depositCents={quoteBreakdown.depositCents}
                balanceCents={quoteBreakdown.balanceCents}
                lines={latestQuote.lineItems.map((l) => ({
                  id: l.id,
                  description: l.description,
                  quantity: l.quantity,
                  unitAmountCents: l.unitAmountCents,
                }))}
              />
            </SectionAnchor>
          ) : null}

          {stripeReady && paymentState.canPayDeposit ? (
            <SectionAnchor
              id="payment-deposit"
              icon={<FileSignature className="h-4 w-4" />}
              title="Deposit due"
              subtitle="Pay the deposit to start your project"
            >
              <PaymentPanel
                projectId={project.id}
                paymentType="deposit"
                amountCents={paymentState.depositCents}
                label="Pay deposit"
                description={`${paymentState.depositPercent}% of ${formatUsd(paymentState.totalCents)} to begin work.`}
              />
            </SectionAnchor>
          ) : null}

          {latestQuote?.status === "approved" && quoteBreakdown ? (
            <SectionAnchor
              id="quote"
              icon={<FileSignature className="h-4 w-4" />}
              title="Quote approved"
              subtitle={`v${latestQuote.version} · Total ${formatUsd(latestQuote.totalCents)}`}
            >
              <div className="ws-panel space-y-3 p-4 text-sm text-text-muted">
                <p>
                  Deposit ({quoteBreakdown.depositPercent}%):{" "}
                  <span className="ws-mono text-text-primary">
                    {formatUsd(quoteBreakdown.depositCents)}
                  </span>
                </p>
                <p>
                  Balance after deposit:{" "}
                  <span className="ws-mono text-text-primary">
                    {formatUsd(quoteBreakdown.balanceCents)}
                  </span>
                </p>
              </div>
              {settings.finalFilesRequirePayment ? (
                <AlertBanner tone="info">
                  Final downloadable files remain locked until final payment clears.
                </AlertBanner>
              ) : (
                <AlertBanner tone="success">
                  Final downloadable files are available as soon as the studio delivers them.
                </AlertBanner>
              )}
            </SectionAnchor>
          ) : null}

          {stripeReady && paymentState.canPayBalance ? (
            <SectionAnchor
              id="payment-balance"
              icon={<FileSignature className="h-4 w-4" />}
              title="Balance due"
              subtitle="Pay anytime during the project — no need to wait for final delivery"
            >
              <PaymentPanel
                projectId={project.id}
                paymentType="final"
                amountCents={paymentState.balanceDueCents}
                label="Pay balance"
                description={`Current balance on quote v${latestQuote?.version ?? ""} (includes any add-ons).`}
              />
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
