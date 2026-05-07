import { cx } from "@/lib/ui";

type Props = {
  className?: string;
  /** Shorthand variants for common shapes. */
  variant?: "text" | "title" | "block" | "circle";
};

export function Skeleton({ className, variant = "block" }: Props) {
  const shape =
    variant === "text"
      ? "h-3 w-full"
      : variant === "title"
        ? "h-5 w-2/3"
        : variant === "circle"
          ? "h-9 w-9 rounded-full"
          : "h-16 w-full";
  return <span className={cx("ws-shimmer block", shape, className)} aria-hidden="true" />;
}

export function SkeletonRows({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cx("flex flex-col gap-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-2 rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-raised)] p-4"
        >
          <Skeleton variant="title" />
          <Skeleton variant="text" />
          <Skeleton variant="text" className="w-2/3" />
        </div>
      ))}
    </div>
  );
}
