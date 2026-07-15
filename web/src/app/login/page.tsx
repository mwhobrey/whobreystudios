import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { getAppUser } from "@/lib/auth";
import { PolicyLinks } from "@/components/legal/policy-links";
import { MagicLinkForm } from "./ui";
import { Wordmark } from "@/components/brand/wordmark";

export default async function LoginPage() {
  const user = await getAppUser();
  if (user) redirect(user.role === "admin" ? "/admin" : "/portal");

  return (
    <div className="relative isolate min-h-screen overflow-hidden">
      <div aria-hidden="true" className="ws-mesh" />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
        <aside className="hidden flex-col justify-between border-r border-[color:var(--border-subtle)] bg-[color:var(--surface-overlay)]/40 px-12 py-10 lg:flex">
          <Link href="/" className="ws-focus-ring rounded-md">
            <Wordmark variant="horizontal" size="md" />
          </Link>

          <div className="ws-fade-up max-w-md">
            <p className="ws-eyebrow text-text-faint">Client portal</p>
            <p className="ws-display mt-6 text-balance text-3xl leading-snug text-text-primary lg:text-4xl">
              &ldquo;Status that doesn&rsquo;t lie. Files that don&rsquo;t leak. Revisions that
              don&rsquo;t spiral.&rdquo;
            </p>
            <p className="mt-6 text-sm text-text-muted">
              Whobrey Studios runs one workflow across digital assets, vinyl decals, and production
              jobs: request, quote, approve, produce, deliver, get paid.
            </p>
          </div>

          <div className="flex items-center gap-3 ws-mono text-xs uppercase tracking-[0.22em] text-text-faint">
            <span className="inline-block h-2 w-2 rounded-full bg-[color:var(--brand-primary)] shadow-[0_0_12px_var(--brand-primary-glow)]" />
            Magic link sign-in
          </div>
        </aside>

        <main className="flex items-center justify-center px-6 py-10 lg:px-12">
          <div className="w-full max-w-md">
            <Link
              href="/"
              className="ws-focus-ring inline-flex items-center gap-1.5 rounded-md text-sm text-text-muted transition hover:text-text-primary lg:hidden"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to home
            </Link>

            <div className="mt-6 lg:mt-0">
              <p className="ws-eyebrow text-text-faint">Client sign-in</p>
              <h1 className="ws-display mt-3 text-4xl tracking-tight text-text-primary">
                Check your projects.
              </h1>
              <p className="mt-2 text-sm text-text-muted">
                Enter the email you used for your project request. We&rsquo;ll send a one-time sign-in
                link. No password required.
              </p>
            </div>

            <div className="ws-glass mt-8 p-6">
              <MagicLinkForm />
            </div>

            <div className="mt-6 flex flex-col items-center gap-3">
              <PolicyLinks className="justify-center" />
            </div>

            <p className="mt-6 text-center text-xs text-text-faint">
              Studio staff?{" "}
              <Link href="/login/studio" className="ws-focus-ring rounded text-text-secondary hover:text-text-primary">
                Sign in at the studio login
              </Link>
            </p>

            <p className="mt-4 hidden text-center text-xs text-text-faint lg:block">
              <Link href="/" className="ws-focus-ring rounded hover:text-text-secondary">
                ← Back to home
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
