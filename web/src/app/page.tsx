import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAppUser } from "@/lib/auth";
import { getWorkspaceSettings } from "@/lib/data/workspace-settings";
import { LandingNavCards } from "@/components/marketing/landing-nav-cards";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { Wordmark } from "@/components/brand/wordmark";

export const metadata: Metadata = {
  title: { absolute: "Whobrey Studios | Graphic Design, Vinyl Decals & Vehicle Wraps" },
  alternates: { canonical: "/" },
};

export default async function Home() {
  const user = await getAppUser();
  const settings = await getWorkspaceSettings();
  const shopUrl = settings.shopUrl?.trim() || null;

  const myProjectHref =
    user?.role === "admin" ? "/admin" : user?.role === "client" ? "/portal" : "/login";
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

      <main className="relative z-10 mx-auto w-full max-w-[88rem] px-6 pb-32">
        <section className="ws-fade-up mt-8 grid gap-12 md:mt-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col justify-center">
            <p className="ws-eyebrow text-text-faint">Whobrey Studios</p>
            <h1 className="ws-display mt-4 text-balance text-5xl leading-[0.95] tracking-tight text-text-primary sm:text-6xl lg:text-7xl">
              Professional{" "}
              <span className="bg-[image:linear-gradient(120deg,var(--brand-primary)_0%,var(--brand-secondary)_100%)] bg-clip-text text-transparent">
                graphic design
              </span>{" "}
              and production support, direct from Whobrey Studios.
            </h1>
            <p className="mt-6 max-w-xl text-balance text-base text-text-muted sm:text-lg">
              From logos and digital brand assets to vinyl decals, signage, and wide-format
              deliverables, submit your project, review proofs, and receive final files in one
              secure client area.
            </p>

            {user ? (
              <p className="mt-6 text-xs text-text-faint">
                Signed in as{" "}
                <span className="ws-mono text-text-secondary">{user.email}</span> ({user.role})
              </p>
            ) : null}
          </div>

          <div className="relative">
            <HeroArtifact />
          </div>
        </section>

        <section className="mt-20 md:mt-28">
          <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="ws-eyebrow text-text-faint">Get started</p>
              <h2 className="ws-display mt-2 text-3xl tracking-tight text-text-primary sm:text-4xl">
                Ready to explore the possibilities?
              </h2>
            </div>
            <Link
              href="/faq"
              className="ws-focus-ring text-sm font-medium text-text-secondary hover:text-text-primary"
            >
              Questions about the workflow? Read the FAQ →
            </Link>
          </div>

          <LandingNavCards
            myProjectHref={myProjectHref}
            shopHref={shopUrl}
          />
        </section>
      </main>

      <footer className="relative z-10 border-t border-[color:var(--border-subtle)]">
        <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-3 px-6 py-8 text-xs text-text-faint sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Wordmark variant="monogram" size="sm" />
            <span className="ws-mono uppercase tracking-[0.22em]">© Whobrey Studios</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/faq" className="ws-focus-ring ws-mono uppercase tracking-[0.22em] hover:text-text-muted">
              FAQ
            </Link>
            <Link
              href="/projects/new"
              className="ws-focus-ring inline-flex items-center gap-1 ws-mono uppercase tracking-[0.22em] hover:text-text-muted"
            >
              New project <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function HeroArtifact() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="ws-glass rotate-[-2deg] p-5 shadow-[var(--shadow-floating)]">
        <div className="flex items-center justify-between">
          <span className="ws-eyebrow">Quote v3 · Sent</span>
          <span className="inline-flex items-center gap-1 rounded-full border border-[color:var(--status-attention-ring)]/60 bg-[color:var(--status-attention-bg)] px-2.5 py-0.5 text-[11px] font-medium text-[color:var(--status-attention-fg)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--status-attention-fg)]" />
            Awaiting client
          </span>
        </div>

        <p className="mt-4 ws-mono text-xs text-text-faint uppercase tracking-wider">
          Project · Vinyl decal · vehicle wrap
        </p>
        <h3 className="mt-1 text-lg font-semibold text-text-primary">Northwood Auto LLC</h3>

        <ul className="mt-4 space-y-2 text-sm">
          {[
            ["Brand concept pack · 3 directions", "$ 480.00"],
            ["Vehicle wrap layout", "$ 720.00"],
            ["2 included revisions", "$ 0.00"],
          ].map(([label, amt]) => (
            <li
              key={label}
              className="flex items-center justify-between border-b border-[color:var(--border-subtle)] pb-2 last:border-b-0"
            >
              <span className="text-text-secondary">{label}</span>
              <span className="ws-mono text-text-muted">{amt}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-center justify-between">
          <span className="ws-eyebrow">Total</span>
          <span className="ws-mono text-2xl font-semibold tracking-tight text-text-primary">
            $1,200.00
          </span>
        </div>
      </div>

      <div className="ws-glass absolute -bottom-10 -right-2 w-64 rotate-[3deg] p-4 shadow-[var(--shadow-floating)]">
        <p className="ws-eyebrow">Status</p>
        <div className="mt-2 ws-pipeline">
          <span data-state="done" />
          <span data-state="done" />
          <span data-state="active" />
          <span />
          <span />
          <span />
          <span />
        </div>
        <p className="mt-3 text-xs text-text-muted">
          Quote sent →{" "}
          <span className="text-[color:var(--brand-primary)]">Awaiting approval</span>
        </p>
      </div>
    </div>
  );
}
