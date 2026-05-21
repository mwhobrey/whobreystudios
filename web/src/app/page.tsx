import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  FileSignature,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { getAppUser } from "@/lib/auth";
import { AppButton } from "@/components/ui/app-button";
import { Wordmark } from "@/components/brand/wordmark";

export default async function Home() {
  const user = await getAppUser();

  const capabilities = [
    {
      icon: FileSignature,
      title: "Quote workflow, start to finish",
      body: "Versioned quote builder with line items, revision limits, and a decline flow the studio controls.",
    },
    {
      icon: Sparkles,
      title: "Revision policy without friction",
      body: "Every round is tracked, and final-revision warnings trigger automatically before scope drifts.",
    },
    {
      icon: ShieldCheck,
      title: "Secure draft and final delivery",
      body: "Drafts stay visible during proof rounds; final artwork unlocks after payment, served through signed access links.",
    },
  ];

  return (
    <div className="relative isolate min-h-screen overflow-x-hidden">
      <div aria-hidden="true" className="ws-mesh" />

      {/* Top bar: wordmark + a single sign-in CTA. Deliberately spare. */}
      <header className="relative z-10 mx-auto flex w-full max-w-[88rem] items-center justify-between px-6 py-6">
        <Wordmark variant="horizontal" size="md" />
        <div className="flex items-center gap-2">
          {user ? (
            <Link href={user.role === "admin" ? "/admin" : "/portal"}>
              <AppButton
                roleVariant={user.role === "admin" ? "admin" : "portal"}
                iconRight={<ArrowRight className="h-4 w-4" />}
              >
                Continue as {user.role}
              </AppButton>
            </Link>
          ) : (
            <Link href="/login">
              <AppButton iconRight={<ArrowRight className="h-4 w-4" />}>Sign in</AppButton>
            </Link>
          )}
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-[88rem] px-6 pb-32">
        {/* Hero */}
        <section className="ws-fade-up mt-12 grid gap-12 md:mt-20 lg:grid-cols-[1.1fr_0.9fr]">
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

            <div className="mt-10 flex flex-wrap items-center gap-3">
              {user?.role === "admin" ? (
                <Link href="/admin">
                  <AppButton
                    size="lg"
                    roleVariant="admin"
                    iconRight={<ArrowRight className="h-4 w-4" />}
                  >
                    Open admin
                  </AppButton>
                </Link>
              ) : null}
              {user?.role === "client" ? (
                <Link href="/portal">
                  <AppButton
                    size="lg"
                    roleVariant="portal"
                    iconRight={<ArrowRight className="h-4 w-4" />}
                  >
                    Open your projects
                  </AppButton>
                </Link>
              ) : null}
              {!user ? (
                <>
                  <Link href="/request">
                    <AppButton
                      size="lg"
                      roleVariant="portal"
                      iconRight={<ArrowRight className="h-4 w-4" />}
                    >
                      Start a project
                    </AppButton>
                  </Link>
                  <Link href="/login">
                    <AppButton size="lg" variant="secondary">
                      Sign in
                    </AppButton>
                  </Link>
                </>
              ) : null}
            </div>

            {user ? (
              <p className="mt-6 text-xs text-text-faint">
                Signed in as{" "}
                <span className="ws-mono text-text-secondary">{user.email}</span> ({user.role})
              </p>
            ) : null}
          </div>

          {/* Hero artifact — a glass tile that hints at the product without screenshots. */}
          <div className="relative">
            <HeroArtifact />
          </div>
        </section>

        {/* Capability strip */}
        <section className="mt-32">
          <div className="flex items-end justify-between">
            <div>
              <p className="ws-eyebrow text-text-faint">Core workflow coverage</p>
              <h2 className="ws-display mt-2 text-3xl tracking-tight text-text-primary sm:text-4xl">
                Three workflows. Done well.
              </h2>
            </div>
            <Link
              href="/login"
              className="hidden items-center gap-1 text-sm font-medium text-text-secondary hover:text-text-primary md:inline-flex"
            >
              View your project access <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {capabilities.map(({ icon: Icon, title, body }) => (
              <article
                key={title}
                className="ws-glass group relative overflow-hidden p-6 transition hover:border-[color:var(--border-strong)]"
              >
                <span
                  className="absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-0 blur-3xl transition group-hover:opacity-30"
                  style={{ background: "var(--brand-primary)" }}
                  aria-hidden="true"
                />
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[color:var(--border-default)] bg-[color:var(--surface-overlay)] text-[color:var(--brand-primary)]">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-text-primary">{title}</h3>
                <p className="mt-2 text-sm text-text-muted">{body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Closing CTA strip */}
        <section className="mt-32">
          <div className="ws-elevated relative overflow-hidden p-10">
            <div aria-hidden="true" className="ws-mesh-soft" />
            <div className="relative flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="ws-eyebrow text-text-faint">Work directly with the studio</p>
                <h2 className="ws-display mt-2 text-3xl tracking-tight text-text-primary sm:text-4xl">
                  Submit your project, review your proof, and receive final files in one place.
                </h2>
              </div>
              <Link href="/request">
                <AppButton
                  roleVariant="portal"
                  iconRight={<ArrowRight className="h-4 w-4" />}
                >
                  Start a project
                </AppButton>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-[color:var(--border-subtle)]">
        <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-3 px-6 py-8 text-xs text-text-faint sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Wordmark variant="monogram" size="sm" />
            <span className="ws-mono uppercase tracking-[0.22em]">© Whobrey Studios</span>
          </div>
          <p className="ws-mono uppercase tracking-[0.22em]">Whobrey Studios client services</p>
        </div>
      </footer>
    </div>
  );
}

/**
 * Visual artifact for the hero — a stylized "project card" that hints at the
 * product surface without leaking screenshots. Pure CSS, no external assets.
 */
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
          Project · Vinyl decal — vehicle wrap
        </p>
        <h3 className="mt-1 text-lg font-semibold text-text-primary">Northwood Auto LLC</h3>

        <ul className="mt-4 space-y-2 text-sm">
          {[
            ["Brand concept pack — 3 directions", "$ 480.00"],
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
