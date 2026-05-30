"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Wordmark } from "@/components/brand/wordmark";

type Props = {
  title?: string;
  children: React.ReactNode;
};

export function IntakeShell({ title, children }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

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

        <button
          type="button"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
          className="ws-focus-ring inline-flex h-11 w-11 items-center justify-center justify-self-end rounded-xl border border-[color:var(--border-default)] bg-[color:var(--surface-raised)] text-text-primary transition hover:border-[color:var(--border-strong)]"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {menuOpen ? (
        <nav
          className="relative z-10 mx-auto w-full max-w-3xl px-6 pb-4"
          aria-label="Intake menu"
        >
          <ul className="ws-glass divide-y divide-[color:var(--border-subtle)] overflow-hidden">
            {[
              { label: "Home", href: "/" },
              { label: "New project", href: "/projects/new" },
              { label: "FAQ", href: "/faq" },
              { label: "Sign in", href: "/login" },
            ].map(({ label, href }) => (
              <li key={label}>
                <Link
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="ws-focus-ring block px-5 py-4 text-base font-medium text-text-primary transition hover:bg-[color:var(--surface-inset)]"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      <main className="relative z-10 mx-auto w-full max-w-3xl px-6 pb-20">{children}</main>
    </div>
  );
}
