import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx, roleTheme, type RoleVariant } from "@/lib/ui";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  roleVariant?: RoleVariant;
  loading?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  children: ReactNode;
};

export function AppButton({
  variant = "primary",
  size = "md",
  roleVariant,
  loading,
  iconLeft,
  iconRight,
  className,
  children,
  disabled,
  ...props
}: Props) {
  const role = roleVariant ? roleTheme(roleVariant) : null;

  const tone =
    variant === "primary"
      ? role?.button ??
        "bg-[color:var(--brand-primary)] text-[color:var(--brand-on-primary)] hover:bg-[color:var(--brand-primary-hover)] shadow-[0_10px_40px_-15px_var(--brand-primary-glow)]"
      : variant === "secondary"
        ? "border border-[color:var(--border-default)] bg-[color:var(--surface-raised)] text-text-primary hover:border-[color:var(--border-strong)] hover:bg-[color:var(--surface-overlay)]"
        : variant === "danger"
          ? "bg-[color:var(--status-danger-ring)] text-white hover:brightness-110"
          : "text-text-secondary hover:bg-[color:var(--surface-raised)]";

  const sizing =
    size === "sm"
      ? "px-3 py-1.5 text-xs"
      : size === "lg"
        ? "px-5 py-2.5 text-base"
        : "px-4 py-2 text-sm";

  const isDisabled = disabled || loading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium",
        "transition-all duration-[var(--duration-fast)] ease-[cubic-bezier(0.22,0.61,0.36,1)]",
        "ws-focus-ring ws-press",
        "disabled:cursor-not-allowed disabled:opacity-60",
        sizing,
        tone,
        className,
      )}
    >
      {loading ? (
        <Spinner />
      ) : iconLeft ? (
        <span className="inline-flex shrink-0">{iconLeft}</span>
      ) : null}
      <span className="inline-flex items-center">{children}</span>
      {!loading && iconRight ? (
        <span className="inline-flex shrink-0">{iconRight}</span>
      ) : null}
    </button>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin opacity-80"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
