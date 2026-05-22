import "server-only";

import {
  adminProjectUrl,
  clientLoginUrl,
  projectPortalUrl,
} from "@/lib/email/urls";

export type EmailTemplatePayload = {
  title: string;
  body?: string | null;
  projectId?: string | null;
  projectType?: string | null;
  actorName?: string | null;
  quoteVersion?: number | null;
  paymentType?: "deposit" | "final" | null;
  amountLabel?: string | null;
  forAdmin?: boolean;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function layout(content: string): string {
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:system-ui,-apple-system,sans-serif;color:#e8e8ed;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#14141c;border:1px solid #2a2a36;border-radius:16px;padding:28px;">
        <tr><td>
          <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#9ca3af;">Whobrey Studios</p>
          ${content}
          <p style="margin:24px 0 0;font-size:12px;color:#6b7280;line-height:1.5;">You received this because of activity on your Whobrey Studios portal.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function cta(href: string, label: string): string {
  return `<p style="margin:20px 0 0;">
    <a href="${escapeHtml(href)}" style="display:inline-block;background:#2EC4B6;color:#000000;font-weight:600;text-decoration:none;padding:12px 20px;border-radius:10px;">${escapeHtml(label)}</a>
  </p>`;
}

function projectLink(projectId: string | null | undefined, forAdmin: boolean): string {
  if (!projectId) return clientLoginUrl();
  return forAdmin ? adminProjectUrl(projectId) : projectPortalUrl(projectId);
}

export function renderEmailTemplate(
  templateKey: string,
  payload: EmailTemplatePayload,
  options?: { forAdmin?: boolean },
): { subject: string; html: string; text: string } {
  const forAdmin = options?.forAdmin ?? payload.forAdmin ?? false;
  const title = payload.title;
  const body = payload.body?.trim() ?? "";
  const projectLabel = payload.projectType?.trim() || "your project";
  const href = projectLink(payload.projectId, forAdmin);

  const subjectPrefix =
    templateKey === "project_created"
      ? "New request"
      : templateKey === "quote_sent"
        ? "Quote ready"
        : templateKey === "quote_approved"
          ? "Quote approved"
          : templateKey === "quote_declined"
            ? "Quote declined"
            : templateKey === "payment_received"
              ? "Payment received"
              : templateKey === "message_posted"
                ? "New message"
                : templateKey === "file_uploaded"
                  ? "File uploaded"
                  : templateKey === "project_status_changed"
                    ? "Project update"
                    : "Project update";

  const subject = `${subjectPrefix} — ${projectLabel}`;

  const lines: string[] = [title];
  if (body) lines.push(body);
  if (payload.quoteVersion != null) lines.push(`Quote version: ${payload.quoteVersion}`);
  if (payload.paymentType) lines.push(`Payment: ${payload.paymentType}`);
  if (payload.amountLabel) lines.push(payload.amountLabel);

  const text = `${lines.join("\n\n")}\n\nOpen: ${href}`;

  const htmlBody = `<h1 style="margin:0 0 12px;font-size:20px;font-weight:600;color:#f4f4f5;">${escapeHtml(title)}</h1>
${body ? `<p style="margin:0 0 12px;font-size:15px;line-height:1.55;color:#d1d5db;">${escapeHtml(body)}</p>` : ""}
${payload.quoteVersion != null ? `<p style="margin:0;font-size:14px;color:#9ca3af;">Quote v${payload.quoteVersion}</p>` : ""}
${cta(href, forAdmin ? "View in admin" : "View project")}`;

  return {
    subject,
    html: layout(htmlBody),
    text,
  };
}
