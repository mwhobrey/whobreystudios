/** Turn `new_request` into "New request" for UI labels. */
export function formatEnumLabel(value: string): string {
  return value
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/** `cents` is whole USD cents (e.g. 1999 → $19.99). */
export function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`;
  const mb = kb / 1024;
  return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`;
}

/**
 * Short, client-facing description of where the project sits in its lifecycle.
 * Ported and refined from the reference prototype's `clientStatusCopy`.
 */
export function statusGuidanceCopy(status: string): string {
  switch (status) {
    case "new_request":
      return "Your project request was received. We're reviewing it now.";
    case "consultation_scheduled":
      return "A consultation has been scheduled. We'll touch base before quoting.";
    case "quote_sent":
      return "A quote is waiting for your review.";
    case "awaiting_authorization":
      return "We're waiting on your approval to begin.";
    case "awaiting_deposit":
      return "Your project starts as soon as the deposit is received.";
    case "scheduled_to_start":
      return "Your project is scheduled to begin shortly.";
    case "approved":
      return "Quote approved. Work is being scheduled.";
    case "in_progress":
      return "Work is actively underway. Check back here for progress.";
    case "proof_sent":
      return "A proof is ready for your review.";
    case "revision_requested":
    case "final_revision":
      return "Revisions are being applied based on your feedback.";
    case "awaiting_final_approval":
      return "Please confirm final approval so we can wrap up.";
    case "awaiting_final_payment":
      return "Final payment is due before files unlock.";
    case "ready_for_delivery":
      return "Your finished work is ready and visible below.";
    case "delivered_or_shipped":
      return "Delivery completed. Files and details remain available below.";
    case "completed":
      return "Project complete. Approved deliverables remain available below.";
    case "declined":
      return "This quote was declined. The studio may follow up with a revised version.";
    case "on_hold":
      return "This project is on hold. We'll resume when ready.";
    case "cancelled":
      return "This project has been cancelled.";
    default:
      return "Project status available in the portal.";
  }
}

/**
 * What the *client* should do next given the current state. Used for the
 * portal "next steps" panel. Returns null if no client action is required.
 */
export function statusNextAction(status: string): { label: string; href?: string } | null {
  switch (status) {
    case "quote_sent":
      return { label: "Review and respond to the quote below" };
    case "awaiting_deposit":
      return { label: "Send the deposit to start work" };
    case "proof_sent":
    case "awaiting_final_approval":
      return { label: "Review and approve the latest proof" };
    case "awaiting_final_payment":
      return { label: "Submit final payment to unlock files" };
    case "ready_for_delivery":
    case "delivered_or_shipped":
    case "completed":
      return { label: "Download your final files below" };
    default:
      return null;
  }
}
