import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cx, roleTheme, type RoleVariant } from "@/lib/ui";

type Trend = { direction: "up" | "down" | "flat"; label: string };

type Props = {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: LucideIcon;
  trend?: Trend;
  /** Stripe color taken from a role tint (admin/portal). */
  accent?: RoleVariant;
  /** Override styles for any fine-tuning. */
  className?: string;
};

export function KpiCard({ label, value, hint, icon: Icon, trend, accent, className }: Props) {
  const role = accent ? roleTheme(accent) : null;
  return (
    <div
      className={cx(
        "relative overflow-hidden rounded-2xl border border-[color:var(--border-default)]",
        "bg-[color:var(--surface-raised)] p-4 backdrop-blur-[var(--blur-glass)]",
        "shadow-[var(--shadow-elevated)]",
        className,
      )}
    >
      {role ? (
        <span
          aria-hidden="true"
          className={cx("absolute inset-x-0 top-0 h-[2px]", role.stripe)}
        />
      ) : null}

      <div className="flex items-start justify-between gap-3">
        <p className="ws-eyebrow">{label}</p>
        {Icon ? (
          <span
            className={cx(
              "inline-flex h-7 w-7 items-center justify-center rounded-lg",
              "border border-[color:var(--border-subtle)] bg-[color:var(--surface-overlay)]",
              role?.tint ?? "text-text-muted",
            )}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        ) : null}
      </div>

      <p className="ws-mono mt-2 text-3xl font-semibold tabular-nums tracking-tight text-text-primary">
        {value}
      </p>

      {trend || hint ? (
        <div className="mt-3 flex items-center gap-2 text-xs text-text-muted">
          {trend ? <TrendChip trend={trend} /> : null}
          {hint ? <span>{hint}</span> : null}
        </div>
      ) : null}
    </div>
  );
}

function TrendChip({ trend }: { trend: Trend }) {
  const tone =
    trend.direction === "up"
      ? "text-[color:var(--status-success-fg)]"
      : trend.direction === "down"
        ? "text-[color:var(--status-danger-fg)]"
        : "text-text-muted";
  const arrow = trend.direction === "up" ? "↑" : trend.direction === "down" ? "↓" : "→";
  return (
    <span className={cx("inline-flex items-center gap-1 font-medium", tone)}>
      <span aria-hidden="true">{arrow}</span>
      {trend.label}
    </span>
  );
}
