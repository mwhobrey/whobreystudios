import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { getAppUser } from "@/lib/auth";
import { AlertBanner } from "@/components/ui/alert-banner";
import { StudioLoginForm } from "./ui";
import { Wordmark } from "@/components/brand/wordmark";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function StudioLoginPage({ searchParams }: Props) {
  const user = await getAppUser();
  if (user) redirect(user.role === "admin" ? "/admin" : "/portal");

  const { error } = await searchParams;
  const authErrorMessage =
    error === "AccessDenied"
      ? "That sign-in method is not available for studio accounts. Use your email and password below."
      : error
        ? "Sign-in failed. Try again with your studio credentials."
        : null;

  return (
    <div className="relative isolate min-h-screen overflow-hidden">
      <div aria-hidden="true" className="ws-mesh" />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
        <aside className="hidden flex-col justify-between border-r border-[color:var(--border-subtle)] bg-[color:var(--surface-overlay)]/40 px-12 py-10 lg:flex">
          <Link href="/" className="ws-focus-ring rounded-md">
            <Wordmark variant="horizontal" size="md" />
          </Link>

          <div className="ws-fade-up max-w-md">
            <p className="ws-eyebrow text-text-faint">Studio operations</p>
            <p className="ws-display mt-6 text-balance text-3xl leading-snug text-text-primary lg:text-4xl">
              Quotes, files, and production status: one honest dashboard.
            </p>
            <p className="mt-6 text-sm text-text-muted">
              Admin access uses studio credentials. Client magic links are disabled for staff
              accounts.
            </p>
          </div>

          <div className="flex items-center gap-3 ws-mono text-xs uppercase tracking-[0.22em] text-text-faint">
            <span className="inline-block h-2 w-2 rounded-full bg-[color:var(--role-admin-tint)] shadow-[0_0_12px_var(--role-admin-glow)]" />
            Studio sign-in
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
              <p className="ws-eyebrow text-text-faint">Studio sign-in</p>
              <h1 className="ws-display mt-3 text-4xl tracking-tight text-text-primary">
                Welcome back.
              </h1>
              <p className="mt-2 text-sm text-text-muted">
                Sign in with the studio credentials issued by Whobrey Studios.
              </p>
            </div>

            <div className="ws-glass mt-8 p-6">
              {authErrorMessage ? (
                <AlertBanner tone="error" className="mb-4">
                  {authErrorMessage}
                </AlertBanner>
              ) : null}
              <StudioLoginForm />
            </div>

            <p className="mt-6 text-center text-xs text-text-faint">
              Client looking for your project?{" "}
              <Link href="/login" className="ws-focus-ring rounded text-text-secondary hover:text-text-primary">
                Use client magic link sign-in
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
