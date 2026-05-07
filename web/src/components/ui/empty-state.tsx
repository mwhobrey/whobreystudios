import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cx } from "@/lib/ui";

type Props = {
  icon?: LucideIcon;
  title: string;
  description?: ReactNode;
  /** Primary CTA rendered below description (e.g. <AppButton>...</AppButton>). */
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ icon: Icon, title, description, action, className }: Props) {
  return (
    <div
      className={cx(
        "ws-fade-up flex flex-col items-center gap-3 rounded-2xl border border-dashed",
        "border-[color:var(--border-default)] bg-[color:var(--surface-raised)]/60 px-6 py-10 text-center",
        className,
      )}
    >
      {Icon ? (
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-sunken)] text-text-muted">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      ) : null}
      <h3 className="text-base font-semibold text-text-primary">{title}</h3>
      {description ? (
        <p className="max-w-md text-sm text-text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
