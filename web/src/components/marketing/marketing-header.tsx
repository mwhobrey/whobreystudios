"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Wordmark } from "@/components/brand/wordmark";
import { AppButton } from "@/components/ui/app-button";

type Props = {
  signedInHref?: string | null;
  signedInLabel?: string | null;
};

export function MarketingHeader({ signedInHref, signedInLabel }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { label: "Home", href: "/" },
    { label: "New project", href: "/projects/new" },
    { label: "FAQ", href: "/faq" },
    { label: "My project", href: signedInHref ?? "/login" },
  ];

  return (
    <>
      <header className="relative z-10 mx-auto flex w-full max-w-[88rem] items-center justify-between px-6 py-6">
        <Link href="/" className="ws-focus-ring rounded">
          <Wordmark variant="horizontal" size="md" />
        </Link>

        <div className="flex items-center gap-2">
          {signedInHref && signedInLabel ? (
            <Link href={signedInHref} className="hidden sm:inline-flex">
              <AppButton roleVariant="portal">{signedInLabel}</AppButton>
            </Link>
          ) : (
            <Link href="/login" className="hidden sm:inline-flex">
              <AppButton>Sign in</AppButton>
            </Link>
          )}

          <button
            type="button"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
            className="ws-focus-ring inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[color:var(--border-default)] bg-[color:var(--surface-raised)] text-text-primary transition hover:border-[color:var(--border-strong)]"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {menuOpen ? (
        <nav
          className="relative z-10 mx-auto w-full max-w-[88rem] px-6 pb-4"
          aria-label="Site menu"
        >
          <ul className="ws-glass divide-y divide-[color:var(--border-subtle)] overflow-hidden sm:ml-auto sm:max-w-xs">
            {links.map(({ label, href }) => (
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
    </>
  );
}
