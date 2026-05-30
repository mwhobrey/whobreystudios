import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";

type Props = {
  title?: string;
  children: React.ReactNode;
};

export function IntakeShell({ title, children }: Props) {
  return (
    <div className="relative isolate min-h-screen bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(46,196,182,0.14),transparent_70%)]">
      <div aria-hidden="true" className="ws-mesh opacity-70" />

      <header className="relative z-10 mx-auto grid w-full max-w-3xl grid-cols-[1fr_auto_1fr] items-center px-6 py-6">
        <Link href="/" className="ws-focus-ring justify-self-start rounded">
          <Wordmark variant="horizontal" size="md" />
        </Link>

        {title ? (
          <h1 className="justify-self-center text-lg font-semibold tracking-tight text-text-primary sm:text-xl">
            {title}
          </h1>
        ) : (
          <span aria-hidden="true" />
        )}

        <Link
          href="/login"
          className="ws-focus-ring justify-self-end text-sm font-medium text-text-muted transition hover:text-text-primary"
        >
          Sign in
        </Link>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-3xl px-6 pb-20">{children}</main>
    </div>
  );
}
