import {
  AlertTriangle,
  CheckCircle2,
  Info,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { cx } from "@/lib/ui";

type Tone = "error" | "warning" | "info" | "success";

const palette: Record<Tone, { classes: string; icon: LucideIcon }> = {
  error: {
    classes:
      "border-[color:var(--status-danger-ring)]/60 bg-[color:var(--status-danger-bg)] text-[color:var(--status-danger-fg)]",
    icon: XCircle,
  },
  warning: {
    classes:
      "border-[color:var(--status-attention-ring)]/60 bg-[color:var(--status-attention-bg)] text-[color:var(--status-attention-fg)]",
    icon: AlertTriangle,
  },
  success: {
    classes:
      "border-[color:var(--status-success-ring)]/60 bg-[color:var(--status-success-bg)] text-[color:var(--status-success-fg)]",
    icon: CheckCircle2,
  },
  info: {
    classes:
      "border-[color:var(--status-info-ring)]/60 bg-[color:var(--status-info-bg)] text-[color:var(--status-info-fg)]",
    icon: Info,
  },
};

type Props = {
  tone: Tone;
  children: ReactNode;
  className?: string;
  /** Override the default tone-based icon (pass `null` to omit). */
  icon?: LucideIcon | null;
};

export function AlertBanner({ tone, children, className, icon }: Props) {
  const { classes, icon: DefaultIcon } = palette[tone];
  const Icon = icon === null ? null : (icon ?? DefaultIcon);

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cx(
        "ws-fade-up flex items-start gap-2.5 rounded-xl border px-3 py-2.5 text-sm",
        classes,
        className,
      )}
    >
      {Icon ? <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> : null}
      <div className="flex-1">{children}</div>
    </div>
  );
}
