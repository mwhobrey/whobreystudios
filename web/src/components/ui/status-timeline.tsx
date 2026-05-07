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
import { cx, statusBadgeTone, statusIconName, type StatusIconName } from "@/lib/ui";
import { formatEnumLabel } from "@/lib/format";

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

export type TimelineEntry = {
  id: string;
  fromStatus: string;
  toStatus: string;
  createdAt: Date;
  actorLabel: string;
  reason: string | null;
};

type Props = {
  entries: TimelineEntry[];
  emptyText?: string;
};

export function StatusTimeline({ entries, emptyText = "No status transitions recorded yet." }: Props) {
  if (entries.length === 0) {
    return <p className="text-sm text-text-muted">{emptyText}</p>;
  }

  return (
    <ol className="relative space-y-4 pl-6">
      <span
        aria-hidden="true"
        className="absolute left-[11px] top-2 bottom-2 w-px bg-[color:var(--border-default)]"
      />

      {entries.map((entry, idx) => {
        const Icon = iconRegistry[statusIconName(entry.toStatus)] ?? Circle;
        const tone = statusBadgeTone(entry.toStatus);
        const isLatest = idx === 0;

        return (
          <li key={entry.id} className="relative">
            <span
              className={cx(
                "absolute -left-6 top-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full border",
                tone,
                isLatest && "shadow-[0_0_0_3px_var(--surface-base),0_0_18px_-4px_var(--brand-primary-glow)]",
              )}
              aria-hidden="true"
            >
              <Icon className="h-3 w-3" />
            </span>

            <div className="rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-raised)]/70 p-3">
              <p className="text-sm font-medium text-text-primary">
                {formatEnumLabel(entry.fromStatus)}{" "}
                <span className="text-text-faint">→</span>{" "}
                {formatEnumLabel(entry.toStatus)}
              </p>
              <p className="mt-1 ws-mono text-[11px] uppercase tracking-wider text-text-faint">
                {entry.actorLabel} ·{" "}
                {entry.createdAt.toLocaleString(undefined, {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </p>
              {entry.reason ? (
                <p className="mt-2 text-sm text-text-secondary">{entry.reason}</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
