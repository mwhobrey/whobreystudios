import "server-only";

import { Resend } from "resend";

let client: Resend | null = null;

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error("RESEND_API_KEY is not configured.");
  }
  if (!client) client = new Resend(key);
  return client;
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.EMAIL_FROM?.trim());
}

export function getDefaultFromAddress(): string {
  const from = process.env.EMAIL_FROM?.trim();
  if (!from) {
    throw new Error("EMAIL_FROM is not configured.");
  }
  return from;
}

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

export async function sendEmail(input: SendEmailInput): Promise<{ id: string | null }> {
  const resend = getResend();
  const { data, error } = await resend.emails.send({
    from: getDefaultFromAddress(),
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
    replyTo: input.replyTo,
  });
  if (error) {
    throw new Error(error.message);
  }
  return { id: data?.id ?? null };
}
