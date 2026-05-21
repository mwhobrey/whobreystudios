export type RoleVariant = "admin" | "portal";

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/**
 * Role theming. The shape stays stable so every existing call site keeps working;
 * internals are repainted to consume CSS tokens defined in `globals.css`.
 *
 * - admin  → warm gradient (amber → magenta → chartreuse)
 * - portal → cool gradient (cyan → magenta → chartreuse)
 */
export function roleTheme(variant: RoleVariant) {
  if (variant === "admin") {
    return {
      tint: "text-[color:var(--role-admin-tint)]",
      tintMuted: "text-[color:var(--role-admin-tint)]/70",
      ring: "border-[color:var(--role-admin-tint)]/40",
      panel: "border-[color:var(--role-admin-tint)]/30 bg-[color:var(--surface-raised)]",
      stripe: "bg-[image:var(--role-admin-grad)]",
      glow: "shadow-[0_0_60px_-20px_var(--role-admin-glow)]",
      button:
        "bg-[image:var(--role-admin-grad)] text-[color:var(--brand-on-primary)] hover:brightness-110 shadow-[0_10px_40px_-15px_var(--role-admin-glow)]",
    } as const;
  }
  return {
    tint: "text-[color:var(--role-portal-tint)]",
    tintMuted: "text-[color:var(--role-portal-tint)]/70",
    ring: "border-[color:var(--role-portal-tint)]/40",
    panel: "border-[color:var(--role-portal-tint)]/30 bg-[color:var(--surface-raised)]",
    stripe: "bg-[image:var(--role-portal-grad)]",
    glow: "shadow-[0_0_60px_-20px_var(--role-portal-glow)]",
    button:
      "bg-[image:var(--role-portal-grad)] text-[color:var(--brand-on-primary)] hover:brightness-110 shadow-[0_10px_40px_-15px_var(--role-portal-glow)]",
  } as const;
}

/**
 * Status semantic mapping. Covers every production ProjectStatus enum value
 * plus the broader set from the reference prototype so future schema growth
 * already has a tone defined. Each token group is defined in `globals.css`
 * under --status-*.
 */
type StatusToken =
  | "neutral"
  | "new"
  | "info"
  | "attention"
  | "progress"
  | "revision"
  | "payment"
  | "success"
  | "delivery"
  | "danger"
  | "paused";

function statusToken(status: string): StatusToken {
  switch (status) {
    case "new_request":
      return "new";

    case "consultation_scheduled":
    case "scheduled_to_start":
      return "info";

    case "quote_sent":
    case "awaiting_authorization":
    case "awaiting_deposit":
      return "attention";

    case "in_progress":
      return "progress";

    case "proof_sent":
    case "revision_requested":
    case "final_revision":
      return "revision";

    case "awaiting_final_approval":
    case "awaiting_final_payment":
      return "payment";

    case "approved":
      return "success";

    case "ready_for_delivery":
    case "delivered_or_shipped":
    case "completed":
      return "delivery";

    case "declined":
    case "cancelled":
      return "danger";

    case "on_hold":
      return "paused";

    default:
      return "neutral";
  }
}

const tokenClasses: Record<StatusToken, string> = {
  neutral:
    "bg-[color:var(--status-neutral-bg)] text-[color:var(--status-neutral-fg)] border-[color:var(--status-neutral-ring)]",
  new:
    "bg-[color:var(--status-new-bg)] text-[color:var(--status-new-fg)] border-[color:var(--status-new-ring)]",
  info:
    "bg-[color:var(--status-info-bg)] text-[color:var(--status-info-fg)] border-[color:var(--status-info-ring)]",
  attention:
    "bg-[color:var(--status-attention-bg)] text-[color:var(--status-attention-fg)] border-[color:var(--status-attention-ring)]",
  progress:
    "bg-[color:var(--status-progress-bg)] text-[color:var(--status-progress-fg)] border-[color:var(--status-progress-ring)]",
  revision:
    "bg-[color:var(--status-revision-bg)] text-[color:var(--status-revision-fg)] border-[color:var(--status-revision-ring)]",
  payment:
    "bg-[color:var(--status-payment-bg)] text-[color:var(--status-payment-fg)] border-[color:var(--status-payment-ring)]",
  success:
    "bg-[color:var(--status-success-bg)] text-[color:var(--status-success-fg)] border-[color:var(--status-success-ring)]",
  delivery:
    "bg-[color:var(--status-delivery-bg)] text-[color:var(--status-delivery-fg)] border-[color:var(--status-delivery-ring)]",
  danger:
    "bg-[color:var(--status-danger-bg)] text-[color:var(--status-danger-fg)] border-[color:var(--status-danger-ring)]",
  paused:
    "bg-[color:var(--status-paused-bg)] text-[color:var(--status-paused-fg)] border-[color:var(--status-paused-ring)]",
};

export function statusBadgeTone(status: string): string {
  return tokenClasses[statusToken(status)];
}

/**
 * Lucide icon names for each status — caller imports the icon component
 * by name to avoid bundling all icons.
 */
export type StatusIconName =
  | "Sparkles"
  | "CalendarClock"
  | "FileText"
  | "ShieldCheck"
  | "Wallet"
  | "Hammer"
  | "Eye"
  | "Repeat2"
  | "BadgeCheck"
  | "Coins"
  | "PackageCheck"
  | "Truck"
  | "CheckCircle2"
  | "XCircle"
  | "PauseCircle"
  | "Ban"
  | "Circle";

export function statusIconName(status: string): StatusIconName {
  switch (status) {
    case "new_request":              return "Sparkles";
    case "consultation_scheduled":   return "CalendarClock";
    case "quote_sent":               return "FileText";
    case "awaiting_authorization":   return "ShieldCheck";
    case "awaiting_deposit":         return "Wallet";
    case "scheduled_to_start":       return "CalendarClock";
    case "in_progress":              return "Hammer";
    case "proof_sent":               return "Eye";
    case "revision_requested":       return "Repeat2";
    case "final_revision":           return "Repeat2";
    case "awaiting_final_approval":  return "BadgeCheck";
    case "awaiting_final_payment":   return "Coins";
    case "approved":                 return "BadgeCheck";
    case "ready_for_delivery":      return "PackageCheck";
    case "delivered_or_shipped":     return "Truck";
    case "completed":                return "CheckCircle2";
    case "declined":                 return "XCircle";
    case "cancelled":                return "Ban";
    case "on_hold":                  return "PauseCircle";
    default:                         return "Circle";
  }
}

/**
 * Pipeline ordering. Used by the portal dashboard to render a horizontal
 * progress meter showing where a project sits in the lifecycle.
 */
export const PROJECT_PIPELINE: readonly string[] = [
  "new_request",
  "quote_sent",
  "awaiting_deposit",
  "in_progress",
  "final_revision",
  "awaiting_final_payment",
  "completed",
] as const;

export function pipelinePosition(status: string): {
  index: number;
  total: number;
  states: { label: string; state: "done" | "active" | "pending" }[];
} {
  const total = PROJECT_PIPELINE.length;
  const idx = PROJECT_PIPELINE.indexOf(status);
  const isOffPipeline = idx < 0;
  const states = PROJECT_PIPELINE.map((s, i) => ({
    label: s,
    state:
      isOffPipeline
        ? ("pending" as const)
        : i < idx
          ? ("done" as const)
          : i === idx
            ? ("active" as const)
            : ("pending" as const),
  }));
  return { index: isOffPipeline ? -1 : idx, total, states };
}
