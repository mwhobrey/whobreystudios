"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/ui";

export type NavItem = { label: string; href: string };

type Props = {
  items: NavItem[];
  className?: string;
};

export function NavLinks({ items, className }: Props) {
  const pathname = usePathname() ?? "";
  return (
    <nav className={cx("flex items-center gap-1", className)}>
      {items.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cx(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              "ws-focus-ring",
              active
                ? "bg-[color:var(--surface-raised)] text-text-primary shadow-[inset_0_0_0_1px_var(--border-default)]"
                : "text-text-muted hover:bg-[color:var(--surface-raised)]/70 hover:text-text-primary",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
