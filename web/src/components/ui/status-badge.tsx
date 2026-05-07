import {
  BadgeCheck,
  Ban,
  CalendarClock,
  CheckCircle2,
  Circle,
  Coins,
  Eye,
  FileText,
  Hammer,
  PackageCheck,
  PauseCircle,
  Repeat2,
  ShieldCheck,
  Sparkles,
  Truck,
  Wallet,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { cx, statusBadgeTone, statusIconName, type StatusIconName } from "@/lib/ui";

type Size = "sm" | "md";

type Props = {
  status: string;
  children: ReactNode;
  size?: Size;
  /** Hide the icon (e.g. inside dense table cells). */
  iconless?: boolean;
};

const iconRegistry: Record<StatusIconName, LucideIcon> = {
  Sparkles,
  CalendarClock,
  FileText,
  ShieldCheck,
  Wallet,
  Hammer,
  Eye,
  Repeat2,
  BadgeCheck,
  Coins,
  PackageCheck,
  Truck,
  CheckCircle2,
  XCircle,
  PauseCircle,
  Ban,
  Circle,
};

export function StatusBadge({ status, children, size = "md", iconless }: Props) {
  const Icon = iconRegistry[statusIconName(status)] ?? Circle;
  const tone = statusBadgeTone(status);

  const sizing =
    size === "sm"
      ? "px-2 py-0.5 text-[10.5px]"
      : "px-2.5 py-1 text-xs";

  const iconSize = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";

  return (
    <span
      className={cx(
        "inline-flex w-fit items-center gap-1.5 rounded-full border font-medium",
        sizing,
        tone,
      )}
    >
      {!iconless ? <Icon className={cx("shrink-0", iconSize)} aria-hidden="true" /> : null}
      <span>{children}</span>
    </span>
  );
}
