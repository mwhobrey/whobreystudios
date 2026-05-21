import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { Wordmark } from "@/components/brand/wordmark";

export default function CheckEmailPage() {
  return (
    <div className="relative isolate min-h-screen overflow-hidden">
      <div aria-hidden="true" className="ws-mesh" />

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-6 py-16">
        <Link href="/" className="ws-focus-ring mb-10 inline-flex w-fit items-center gap-1.5 rounded-md text-sm text-text-muted transition hover:text-text-primary">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to home
        </Link>

        <Wordmark variant="horizontal" size="md" />

        <div className="ws-glass mt-10 p-8">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[color:var(--border-default)] bg-[color:var(--surface-overlay)] text-[color:var(--brand-primary)]">
            <Mail className="h-5 w-5" aria-hidden="true" />
          </span>
          <h1 className="ws-display mt-6 text-3xl tracking-tight text-text-primary">Check your email</h1>
          <p className="mt-3 text-sm text-text-muted">
            If an account matches that address, we sent a sign-in link. Open it on this device to
            access your projects. The link expires in 24 hours.
          </p>
          <p className="mt-4 text-xs text-text-faint">
            Wrong inbox or need studio access?{" "}
            <Link href="/login/studio" className="ws-focus-ring rounded text-text-secondary hover:text-text-primary">
              Studio sign-in
            </Link>
          </p>
        </div>

        <p className="mt-8 text-center text-sm text-text-faint">
          <Link href="/login" className="ws-focus-ring rounded hover:text-text-secondary">
            Send another link
          </Link>
        </p>
      </main>
    </div>
  );
}
