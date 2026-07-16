"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, FolderOpen, LayoutList, ShoppingBag, Sparkles } from "lucide-react";
import { trackClientEvent } from "@/lib/analytics/track-client-event";
import { cx } from "@/lib/ui";

type CardId = "services" | "shop" | "client_portal" | "new_project";

type Card = {
  id: CardId;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  accent: string;
  featured?: boolean;
  external?: boolean;
};

type Props = {
  myProjectHref: string;
  newProjectHref?: string;
  shopHref?: string | null;
};

export function LandingNavCards({
  myProjectHref,
  newProjectHref = "/projects/new",
  shopHref,
}: Props) {
  const cards: Card[] = [
    {
      id: "services",
      title: "Services",
      description: "See what Whobrey Studios offers and where pricing typically starts.",
      href: "/services",
      icon: LayoutList,
      accent:
        "border-[color:var(--status-info-ring)]/40 hover:border-[color:var(--status-info-ring)]/70",
    },
    {
      id: "shop",
      title: "Shop",
      description: shopHref
        ? "Browse and purchase products, from decals to hoodies, for local pickup or delivery."
        : "Physical products are coming soon. Ask the studio about decals, apparel, and pickup options in the meantime.",
      href: shopHref ?? "/faq#shop",
      icon: ShoppingBag,
      accent:
        "border-[color:var(--status-success-ring)]/40 hover:border-[color:var(--status-success-ring)]/70",
      external: Boolean(shopHref),
    },
    {
      id: "client_portal",
      title: "Client Portal",
      description:
        "Log in to access and manage an existing project with Whobrey Studios.",
      href: myProjectHref,
      icon: FolderOpen,
      accent:
        "border-[color:var(--status-info-ring)]/40 hover:border-[color:var(--status-info-ring)]/70",
    },
    {
      id: "new_project",
      title: "New Project",
      description:
        "Interested in starting a new project or getting an estimate? Start here.",
      href: newProjectHref,
      icon: Sparkles,
      accent: "border-[color:var(--brand-primary)]/50 hover:border-[color:var(--brand-primary)]",
      featured: true,
    },
  ];

  return (
    <section aria-label="Get started">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-5">
        {cards.map(({ id, title, description, href, icon: Icon, accent, featured, external }) => {
          const onNavigate = () => {
            trackClientEvent({ name: "landing_card_clicked", data: { card: id } });
          };

          const inner = (
            <>
              <div>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[color:var(--border-default)] bg-[color:var(--surface-overlay)] text-[color:var(--brand-primary)]">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h2 className="mt-5 text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">
                  {title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-text-muted">{description}</p>
              </div>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-[color:var(--brand-primary)]">
                {featured ? "Start here" : shopHref || title !== "Shop" ? "Continue" : "Learn more"}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </>
          );

          const className = cx(
            "group ws-glass flex min-h-[220px] flex-col justify-between rounded-2xl border-2 p-6 transition",
            "hover:-translate-y-0.5 hover:shadow-[var(--shadow-floating)]",
            accent,
            featured && "ring-1 ring-[color:var(--brand-primary-glow)]",
          );

          if (external) {
            return (
              <a
                key={title}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onNavigate}
                className={className}
              >
                {inner}
              </a>
            );
          }

          return (
            <Link key={title} href={href} onClick={onNavigate} className={className}>
              {inner}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
