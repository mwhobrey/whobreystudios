import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { LegalProse } from "@/components/legal/legal-prose";
import { Wordmark } from "@/components/brand/wordmark";
import { PolicyLinks } from "@/components/legal/policy-links";
import {
  getLegalDocument,
  isLegalSlug,
  LEGAL_SLUGS,
} from "@/lib/legal/documents";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return LEGAL_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!isLegalSlug(slug)) return {};

  const doc = await getLegalDocument(slug);
  if (!doc) return {};

  return {
    title: doc.title,
    description: `${doc.title} for Whobrey Studios.`,
    alternates: { canonical: `/legal/${slug}` },
  };
}

export default async function LegalPage({ params }: Props) {
  const { slug } = await params;
  if (!isLegalSlug(slug)) notFound();

  const doc = await getLegalDocument(slug);
  if (!doc) notFound();

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
          <div className="mt-6">
            <LegalProse markdown={doc.body} />
          </div>
        </article>
      </div>
    </div>
  );
}
