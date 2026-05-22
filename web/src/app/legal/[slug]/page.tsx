import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { LegalProse } from "@/components/legal/legal-prose";
import { Wordmark } from "@/components/brand/wordmark";
import { PolicyLinks } from "@/components/legal/policy-links";
import {
  getLegalDocument,
  isLegalSlug,
  LEGAL_SLUGS,
  type LegalSlug,
} from "@/lib/legal/documents";
import { getWorkspaceSettings } from "@/lib/data/workspace-settings";

type Props = { params: Promise<{ slug: string }> };

function externalOverrideUrl(
  slug: LegalSlug,
  settings: Awaited<ReturnType<typeof getWorkspaceSettings>>,
): string | null {
  const raw =
    slug === "terms"
      ? settings.termsUrl
      : slug === "privacy"
        ? settings.privacyUrl
        : settings.refundPolicyUrl;
  const trimmed = raw?.trim();
  return trimmed || null;
}

export function generateStaticParams() {
  return LEGAL_SLUGS.map((slug) => ({ slug }));
}

export default async function LegalPage({ params }: Props) {
  const { slug } = await params;
  if (!isLegalSlug(slug)) notFound();

  const [doc, settings] = await Promise.all([getLegalDocument(slug), getWorkspaceSettings()]);
  if (!doc) notFound();

  const externalUrl = externalOverrideUrl(slug, settings);
  if (externalUrl && doc.isPlaceholder) {
    redirect(externalUrl);
  }

  return (
    <div className="relative isolate min-h-screen overflow-hidden">
      <div aria-hidden="true" className="ws-mesh" />
      <div className="relative z-10 mx-auto max-w-3xl px-6 py-10">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[color:var(--border-subtle)] pb-6">
          <Link href="/" className="ws-focus-ring rounded-md">
            <Wordmark variant="horizontal" size="sm" />
          </Link>
          <PolicyLinks />
        </header>

        <Link
          href="/login"
          className="ws-focus-ring mt-6 inline-flex items-center gap-2 text-sm text-text-muted transition hover:text-text-primary"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to sign in
        </Link>

        <article className="ws-panel mt-8 p-6 sm:p-8">
          <h1 className="ws-display text-2xl text-text-primary">{doc.title}</h1>
          {doc.isPlaceholder ? (
            <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100/90">
              Placeholder content — replace{" "}
              <code className="ws-mono text-xs">web/content/legal/{slug}.md</code> with
              client-approved text before production.
            </p>
          ) : null}
          <div className="mt-6">
            <LegalProse markdown={doc.body} />
          </div>
          {externalUrl && !doc.isPlaceholder ? (
            <p className="mt-8 border-t border-[color:var(--border-subtle)] pt-4 text-xs text-text-faint">
              Also published at{" "}
              <a
                href={externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[color:var(--brand-primary)] underline"
              >
                external copy
              </a>
              .
            </p>
          ) : null}
        </article>
      </div>
    </div>
  );
}
