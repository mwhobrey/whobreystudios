import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, FileSignature, HelpCircle, ShieldCheck, Sparkles } from "lucide-react";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { Wordmark } from "@/components/brand/wordmark";
import { getAppUser } from "@/lib/auth";

export const metadata = {
  title: "FAQ",
  description: "How the Whobrey Studios client portal handles quotes, revisions, payments, and file delivery.",
  alternates: { canonical: "/faq" },
};

const faqs = [
  {
    id: "quotes",
    icon: FileSignature,
    question: "How does the quote and approval process work?",
    answer: [
      "After you submit a project request, Whobrey Studios reviews your brief and builds a versioned quote with line items, materials, labor, and any included revisions.",
      "When the quote is sent, you'll receive access to review it in your client portal. You can approve, decline, or message the studio with questions before committing.",
      "If you decline, the studio can revise the quote or close the project. You're never locked in without an explicit approval.",
      "Once approved, deposit payment is collected through secure checkout before production begins.",
    ],
  },
  {
    id: "revisions",
    icon: Sparkles,
    question: "How are revisions handled?",
    answer: [
      "Every proof round is tracked against the included revision count on your quote. You'll always know how many rounds remain before additional work may be quoted separately.",
      "When you're on your second-to-last included revision, the portal warns you before scope drifts, so there are no surprises at final delivery.",
      "Feedback can be left in the project message thread, keeping direction and history in one place instead of scattered texts or emails.",
      "The studio's default is two included revisions; individual quotes can override that when a project needs more or less flexibility.",
    ],
  },
  {
    id: "delivery",
    icon: ShieldCheck,
    question: "When can I download final files?",
    answer: [
      "Draft files are shared during proof rounds so you can review work in progress. Final production files are delivered only after final payment is confirmed.",
      "Downloads use short-lived signed links, not files sitting in a public folder. Access is checked on every request.",
      "Supported deliverables include design source files and production-ready exports (for example .ai, .png, and .svg), depending on what was quoted.",
      "If payment is still outstanding, the portal shows exactly what's blocking download so you know the next step.",
    ],
  },
  {
    id: "shop",
    icon: HelpCircle,
    question: "Can I order physical products like decals or apparel?",
    answer: [
      "Yes. Whobrey Studios offers physical products including vinyl decals, signage, and branded merchandise.",
      "The online shop for browse-and-buy items is rolling out separately from custom project work. Ask the studio about pickup, delivery, and catalog items when you submit a project.",
      "Custom vinyl, wraps, and print jobs still flow through the project portal so quotes, proofs, and revisions stay organized.",
    ],
  },
  {
    id: "account",
    icon: HelpCircle,
    question: "Do I need an account to start?",
    answer: [
      "No. You can submit a new project request without signing in. Use the New Project path on the home page, pick your service type, and fill in your contact details.",
      "After submitting, sign in with the same email address to see your project, messages, quotes, and files in the client portal.",
      "If you already have an active project, use My Project to sign in and pick up where you left off.",
    ],
  },
] as const;

export default async function FaqPage() {
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
          <p className="ws-eyebrow text-text-faint">Help & workflow</p>
          <h1 className="ws-display mt-2 text-3xl tracking-tight text-text-primary sm:text-4xl">
            Frequently asked questions
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-text-muted sm:text-base">
            How quotes, revisions, payments, and file delivery work in the Whobrey Studios client
            portal.
          </p>
        </div>

        <div className="mt-12 space-y-6">
          {faqs.map(({ id, icon: Icon, question, answer }) => (
            <article
              key={id}
              id={id}
              className="ws-glass scroll-mt-24 rounded-2xl border border-[color:var(--border-default)] p-6 sm:p-8"
            >
              <div className="flex items-start gap-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[color:var(--border-default)] bg-[color:var(--surface-overlay)] text-[color:var(--brand-primary)]">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">{question}</h2>
                  <div className="mt-4 space-y-3 text-sm leading-relaxed text-text-muted">
                    {answer.map((paragraph) => (
                      <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <section className="mt-16 ws-elevated relative overflow-hidden p-8 text-center">
          <div aria-hidden="true" className="ws-mesh-soft" />
          <div className="relative">
            <p className="ws-eyebrow text-text-faint">Ready to begin?</p>
            <h2 className="ws-display mt-2 text-2xl tracking-tight text-text-primary">
              Start a new project or sign in to an existing one.
            </h2>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/projects/new"
                className="ws-focus-ring inline-flex rounded-xl bg-[color:var(--brand-primary)] px-5 py-2.5 text-sm font-medium text-[color:var(--brand-on-primary)] transition hover:bg-[color:var(--brand-primary-hover)]"
              >
                New project
              </Link>
              <Link
                href="/login"
                className="ws-focus-ring inline-flex rounded-xl border border-[color:var(--border-default)] px-5 py-2.5 text-sm font-medium text-text-primary transition hover:border-[color:var(--border-strong)]"
              >
                My project
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
