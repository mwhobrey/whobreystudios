import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { listActiveServiceTypes } from "@/lib/data/service-types";
import { GuestRequestForm } from "./form";
import { Wordmark } from "@/components/brand/wordmark";

export const metadata = {
  title: "Request a project",
  description: "Submit a new project request to Whobrey Studios without signing in.",
};

export default async function GuestRequestPage() {
  const serviceTypes = await listActiveServiceTypes();

  return (
    <div className="relative isolate min-h-screen">
      <div aria-hidden="true" className="ws-mesh" />
      <header className="relative z-10 mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-6">
        <Link href="/" className="ws-focus-ring rounded">
          <Wordmark variant="horizontal" size="md" />
        </Link>
        <Link
          href="/login"
          className="ws-focus-ring text-sm font-medium text-text-muted transition hover:text-text-primary"
        >
          Sign in
        </Link>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-3xl px-6 pb-24">
        <Link
          href="/"
          className="ws-focus-ring inline-flex items-center gap-1.5 rounded text-sm text-text-muted hover:text-text-primary hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Home
        </Link>

        <div className="mt-8">
          <p className="ws-eyebrow text-text-faint">New project request</p>
          <h1 className="ws-display mt-2 text-3xl tracking-tight text-text-primary sm:text-4xl">
            Tell the studio what you need.
          </h1>
          <p className="mt-3 max-w-xl text-sm text-text-muted sm:text-base">
            No account required. After you submit, sign in with the same email to track your
            project in the client portal.
          </p>
        </div>

        <div className="mt-10">
          <GuestRequestForm serviceTypes={serviceTypes} />
        </div>
      </main>
    </div>
  );
}
