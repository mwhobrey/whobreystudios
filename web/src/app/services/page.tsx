import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Info } from "lucide-react";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { Wordmark } from "@/components/brand/wordmark";
import { AppButton } from "@/components/ui/app-button";
import { AlertBanner } from "@/components/ui/alert-banner";
import { getAppUser } from "@/lib/auth";
import { intakeDetailsHref } from "@/lib/project-intake/categories";
import { SERVICE_CATALOG, SERVICE_PRICING_DISCLAIMER } from "@/lib/services/catalog";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Graphic design, vinyl decals, app icons, and 3D printing services from Whobrey Studios, with starting prices for common project types.",
  alternates: { canonical: "/services" },
};

export default async function ServicesPage() {
  const user = await getAppUser();
  const signedInHref =
    user?.role === "admin" ? "/admin" : user?.role === "client" ? "/portal" : null;
  const signedInLabel =
    user?.role === "admin"
      ? "Open admin"
      : user?.role === "client"
        ? "Open your projects"
        : null;

  return (
    <div className="relative isolate min-h-screen overflow-x-hidden">
      <div aria-hidden="true" className="ws-mesh" />

      <MarketingHeader signedInHref={signedInHref} signedInLabel={signedInLabel} />

      <main className="relative z-10 mx-auto w-full max-w-3xl px-6 pb-24">
        <Link
          href="/"
          className="ws-focus-ring inline-flex items-center gap-1.5 rounded text-sm text-text-muted hover:text-text-primary hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Home
        </Link>

        <div className="mt-8">
          <p className="ws-eyebrow text-text-faint">What we do</p>
          <h1 className="ws-display mt-2 text-3xl tracking-tight text-text-primary sm:text-4xl">
            Services
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-text-muted sm:text-base">
            A look at what Whobrey Studios offers and where pricing typically starts. Every
            project gets its own custom quote.
          </p>
        </div>

        <AlertBanner tone="info" icon={Info} className="mt-8">
          {SERVICE_PRICING_DISCLAIMER}
        </AlertBanner>

        <div className="mt-8 space-y-6">
          {SERVICE_CATALOG.map(
            ({ id, title, startingAt, icon: Icon, summary, details, intakeCategory }) => (
              <article
                key={id}
                id={id}
                className="ws-glass scroll-mt-24 rounded-2xl border border-[color:var(--border-default)] p-6 sm:p-8"
              >
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[color:var(--border-default)] bg-[color:var(--surface-overlay)] text-[color:var(--brand-primary)]">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
                    <p className="mt-1 text-sm font-medium text-[color:var(--brand-primary)]">
                      {startingAt}
                    </p>
                    <div className="mt-4 space-y-3 text-sm leading-relaxed text-text-muted">
                      <p>{summary}</p>
                      <p>{details}</p>
                    </div>
                    <Link
                      href={intakeDetailsHref(intakeCategory)}
                      className="ws-focus-ring mt-5 inline-flex items-center gap-1.5 rounded-xl border border-[color:var(--border-default)] px-4 py-2 text-sm font-medium text-text-primary transition hover:border-[color:var(--brand-primary)] hover:text-[color:var(--brand-primary)]"
                    >
                      Get started
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </article>
            ),
          )}
        </div>

        <section className="mt-16 ws-elevated relative overflow-hidden p-8 text-center">
          <div aria-hidden="true" className="ws-mesh-soft" />
          <div className="relative">
            <p className="ws-eyebrow text-text-faint">Ready to begin?</p>
            <h2 className="ws-display mt-2 text-2xl tracking-tight text-text-primary">
              Get a custom quote for your project.
            </h2>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link href="/projects/new">
                <AppButton iconRight={<ArrowRight className="h-4 w-4" />}>New project</AppButton>
              </Link>
              <Link
                href="/faq"
                className="ws-focus-ring inline-flex rounded-xl border border-[color:var(--border-default)] px-5 py-2.5 text-sm font-medium text-text-primary transition hover:border-[color:var(--border-strong)]"
              >
                Read the FAQ
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-[color:var(--border-subtle)]">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-6 py-8 text-xs text-text-faint sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Wordmark variant="monogram" size="sm" />
            <span className="ws-mono uppercase tracking-[0.22em]">© Whobrey Studios</span>
          </div>
          <Link href="/" className="ws-focus-ring ws-mono uppercase tracking-[0.22em] hover:text-text-muted">
            Back to home
          </Link>
        </div>
      </footer>
    </div>
  );
}
