"use client";

import { useActionState, useMemo, useState } from "react";
import { CornerDownRight, Send, X } from "lucide-react";
import type { UserRole } from "@/generated/prisma/enums";
import {
  postProjectMessageAction,
  type ProjectMessageActionState,
} from "@/lib/actions/project-messages";
import { formatEnumLabel } from "@/lib/format";
import { cx, roleTheme } from "@/lib/ui";
import { AppButton } from "@/components/ui/app-button";
import { AlertBanner } from "@/components/ui/alert-banner";
import { EmptyState } from "@/components/ui/empty-state";
import { FormField } from "@/components/ui/form-field";

export type ProjectMessageDto = {
  id: string;
  body: string;
  parentId: string | null;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    email: string | null;
    role: UserRole;
  };
  parent: {
    id: string;
    body: string;
    author: { name: string | null; email: string | null };
  } | null;
};

function snippet(body: string, max = 140) {
  const t = body.trim().replace(/\s+/g, " ");
  return t.length <= max ? t : `${t.slice(0, max)}…`;
}

function initials(label: string): string {
  const parts = label.trim().split(/\s+/).slice(0, 2);
  if (parts.length === 0) return "?";
  return parts.map((p) => p.charAt(0).toUpperCase()).join("");
}

function threadDepth(
  msg: { parentId: string | null },
  byId: Map<string, { parentId: string | null }>,
): number {
  let d = 0;
  let cur: string | null = msg.parentId;
  while (cur && d < 40) {
    d++;
    const p = byId.get(cur);
    cur = p?.parentId ?? null;
  }
  return d;
}

const initialAction: ProjectMessageActionState = {};

type Props = {
  projectId: string;
  viewerId: string;
  variant: "admin" | "portal";
  messages: ProjectMessageDto[];
};

export function ProjectMessagesClient({ projectId, viewerId, variant, messages }: Props) {
  const [replyTo, setReplyTo] = useState<{ id: string; label: string } | null>(null);
  const [state, formAction, pending] = useActionState(postProjectMessageAction, initialAction);
  const theme = roleTheme(variant);

  const byId = useMemo(() => {
    const m = new Map<string, { parentId: string | null }>();
    for (const row of messages) m.set(row.id, { parentId: row.parentId });
    return m;
  }, [messages]);

  return (
    <div className="space-y-6">
      <p className="text-sm text-text-muted">
        {variant === "admin"
          ? "Threaded discussion. You and the client can reply to keep context."
          : "Threaded discussion with the studio. Replies keep the conversation organized."}
      </p>

      {messages.length === 0 ? (
        <EmptyState
          icon={Send}
          title="No messages yet."
          description="Start the conversation below."
        />
      ) : (
        <ul className="space-y-3">
          {messages.map((m) => {
            const depth = threadDepth(m, byId);
            const indent = Math.min(depth, 8) * 16;
            const authorLabel = m.author.name ?? m.author.email ?? "User";
            const isViewer = m.author.id === viewerId;
            const isAdmin = m.author.role === "admin";
            const accentClass = isAdmin
              ? "border-l-[color:var(--role-admin-tint)]/60"
              : "border-l-[color:var(--role-portal-tint)]/60";

            return (
              <li
                key={m.id}
                style={{ marginLeft: indent }}
                className={cx(
                  "ws-fade-up rounded-xl border border-l-2 border-[color:var(--border-subtle)]",
                  "bg-[color:var(--surface-raised)] p-4",
                  accentClass,
                )}
              >
                {m.parent ? (
                  <p className="mb-3 flex items-start gap-2 rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--surface-sunken)] px-2.5 py-1.5 text-xs text-text-muted">
                    <CornerDownRight className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
                    <span>
                      <span className="font-medium text-text-secondary">
                        {m.parent.author?.name ?? m.parent.author?.email ?? "message"}
                      </span>
                      : {snippet(m.parent.body)}
                    </span>
                  </p>
                ) : null}

                <div className="flex items-center gap-3">
                  <span
                    className={cx(
                      "ws-mono inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold uppercase",
                      isAdmin
                        ? "border border-[color:var(--role-admin-tint)]/40 bg-[color:var(--role-admin-tint)]/10 text-[color:var(--role-admin-tint)]"
                        : "border border-[color:var(--role-portal-tint)]/40 bg-[color:var(--role-portal-tint)]/10 text-[color:var(--role-portal-tint)]",
                    )}
                  >
                    {initials(authorLabel)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-baseline gap-2 text-sm">
                      <span className="font-medium text-text-primary">{authorLabel}</span>
                      {isViewer ? (
                        <span className="text-xs text-text-faint">(you)</span>
                      ) : null}
                      <span className="ws-mono rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--surface-sunken)] px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-text-muted">
                        {formatEnumLabel(m.author.role)}
                      </span>
                    </p>
                    <time
                      className="ws-mono text-[10px] uppercase tracking-wider text-text-faint"
                      dateTime={m.createdAt}
                    >
                      {new Date(m.createdAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </time>
                  </div>
                </div>

                <p className="mt-3 whitespace-pre-wrap text-sm text-text-secondary">{m.body}</p>

                <button
                  type="button"
                  className={cx(
                    "ws-focus-ring mt-3 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium transition",
                    "hover:bg-[color:var(--surface-overlay)]",
                    theme.tint,
                  )}
                  onClick={() => setReplyTo({ id: m.id, label: authorLabel })}
                >
                  <CornerDownRight className="h-3 w-3" />
                  Reply
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <form
        key={messages.length}
        action={formAction}
        className="ws-panel space-y-3 p-4"
      >
        <input type="hidden" name="projectId" value={projectId} />
        {replyTo ? (
          <>
            <input type="hidden" name="parentId" value={replyTo.id} />
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--surface-sunken)] px-3 py-1.5 text-xs">
              <span className="text-text-muted">
                Replying to{" "}
                <strong className="text-text-secondary">{replyTo.label}</strong>
              </span>
              <button
                type="button"
                className="ws-focus-ring inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-text-faint transition hover:bg-[color:var(--surface-overlay)] hover:text-text-secondary"
                onClick={() => setReplyTo(null)}
              >
                <X className="h-3 w-3" />
                Cancel
              </button>
            </div>
          </>
        ) : null}

        <FormField label={replyTo ? "Your reply" : "New message"} required>
          <textarea
            name="body"
            required
            rows={4}
            disabled={pending}
            className="ws-input"
            placeholder={replyTo ? "Write your reply" : "Write a message"}
          />
        </FormField>

        {state.error ? <AlertBanner tone="error">{state.error}</AlertBanner> : null}

        <div className="flex justify-end">
          <AppButton
            type="submit"
            loading={pending}
            roleVariant={variant}
            iconRight={!pending ? <Send className="h-3.5 w-3.5" /> : undefined}
          >
            {pending ? "Sending" : replyTo ? "Post reply" : "Post message"}
          </AppButton>
        </div>
      </form>
    </div>
  );
}
