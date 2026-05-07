import Link from "next/link";
import type { ReactNode } from "react";
import { cx, roleTheme, type RoleVariant } from "@/lib/ui";
import { Wordmark } from "@/components/brand/wordmark";
import { NavLinks, type NavItem } from "@/components/ui/nav-links";
import { NotificationBell } from "@/components/notification-bell";
import { SignOutButton } from "@/components/sign-out-button";

type Props = {
  variant: RoleVariant;
  title: string;
  subtitle?: ReactNode;
  /** Eyebrow (small caps tag above title). */
  eyebrow?: ReactNode;
  /** Back link rendered above the title. */
  backLink?: ReactNode;
  /** Page-level actions in the header right cluster. */
  actions?: ReactNode;
  /** Extra strip rendered between header and content (KPI grid, breadcrumbs, etc.). */
  headerExtras?: ReactNode;
  /** Toggle the global top chrome. Defaults to true. */
  chrome?: boolean;
  /** When chrome is on: render the notification bell. Default true. */
  showNotifications?: boolean;
  /** When chrome is on: render the sign-out button. Default true. */
  showSignOut?: boolean;
  children: ReactNode;
};

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin" },
  { label: "Projects", href: "/admin/projects" },
  { label: "Service types", href: "/admin/settings/service-types" },
  { label: "Policies", href: "/admin/settings/policies" },
];

const portalNav: NavItem[] = [
  { label: "Projects", href: "/portal" },
  { label: "Start project", href: "/portal/projects/new" },
];

export function AppShell({
  variant,
  title,
  subtitle,
  eyebrow,
  backLink,
  actions,
  headerExtras,
  chrome = true,
  showNotifications = true,
  showSignOut = true,
  children,
}: Props) {
  const theme = roleTheme(variant);
  const navItems = variant === "admin" ? adminNav : portalNav;

  return (
    <>
      {chrome ? (
        <header className="sticky top-0 z-40 border-b border-[color:var(--border-subtle)] bg-[color:var(--surface-overlay)]/85 backdrop-blur-[var(--blur-overlay)]">
          <div className="mx-auto flex w-full max-w-[88rem] items-center justify-between gap-4 px-6 py-3">
            <Link
              href={variant === "admin" ? "/admin" : "/portal"}
              className="ws-focus-ring rounded-md"
              aria-label="Whobrey Studios home"
            >
              <Wordmark variant="horizontal" size="sm" />
            </Link>

            <NavLinks items={navItems} className="hidden md:flex" />

            <div className="flex items-center gap-2">
              {showNotifications ? <NotificationBell variant={variant} /> : null}
              {showSignOut ? <SignOutButton /> : null}
            </div>
          </div>
        </header>
      ) : null}

      <main className="ws-shell relative">
        <div
          aria-hidden="true"
          className={cx(
            "pointer-events-none absolute inset-x-0 -top-10 -z-10 h-72",
            "bg-[radial-gradient(70%_100%_at_50%_0%,var(--role-portal-glow),transparent_70%)]",
            variant === "admin" &&
              "bg-[radial-gradient(70%_100%_at_50%_0%,var(--role-admin-glow),transparent_70%)]",
          )}
        />

        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            {backLink ? (
              <p className={cx("text-sm font-medium tracking-wide", theme.tint)}>{backLink}</p>
            ) : eyebrow ? (
              <p className={cx("ws-eyebrow", theme.tint)}>{eyebrow}</p>
            ) : null}
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-2 max-w-2xl text-sm text-text-muted">{subtitle}</p>
            ) : null}
          </div>
          {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
        </div>

        {headerExtras ? <div className="mb-8">{headerExtras}</div> : null}

        {children}
      </main>
    </>
  );
}
