import type { ReactNode } from "react";
import { cx, roleTheme, type RoleVariant } from "@/lib/ui";

type Tone = "default" | "glass" | "elevated" | "sunken";
type Padding = "none" | "sm" | "md" | "lg";

type Props = {
  children: ReactNode;
  className?: string;
  tone?: Tone;
  padding?: Padding;
  /** Render a left-edge brand stripe (admin: warm, portal: cool). */
  accent?: RoleVariant;
  /** Add a hover lift transition. */
  interactive?: boolean;
};

export function SurfaceCard({
  children,
  className,
  tone = "default",
  padding = "md",
  accent,
  interactive,
}: Props) {
  const base =
    tone === "glass"
      ? "ws-glass"
      : tone === "elevated"
        ? "ws-elevated"
        : tone === "sunken"
          ? "rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-sunken)]"
          : "ws-panel";

  const pad =
    padding === "none"
      ? ""
      : padding === "sm"
        ? "p-3"
        : padding === "lg"
          ? "p-6"
          : "p-4";

  const accentStripe = accent ? (
    <span
      aria-hidden="true"
      className={cx(
        "absolute left-0 top-4 bottom-4 w-[3px] rounded-full",
        roleTheme(accent).stripe,
      )}
    />
  ) : null;

  return (
    <div
      className={cx(
        "relative",
        base,
        pad,
        interactive && "ws-hover-lift cursor-pointer",
        className,
      )}
    >
      {accentStripe}
      {children}
    </div>
  );
}
