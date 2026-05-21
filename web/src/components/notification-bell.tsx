"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Bell,
  BellRing,
  CheckCircle2,
  FileSignature,
  FileUp,
  MessageSquare,
  Sparkles,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { cx, roleTheme } from "@/lib/ui";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  createdAt: string;
  readAt: string | null;
  projectId: string | null;
  projectType: string | null;
  actorName: string | null;
  actorEmail: string | null;
};

type NotificationResponse = {
  unreadCount: number;
  items: NotificationItem[];
};

type Props = {
  variant: "admin" | "portal";
};

const typeIcon: Record<string, LucideIcon> = {
  project_created: Sparkles,
  message_posted: MessageSquare,
  quote_sent: FileSignature,
  quote_approved: CheckCircle2,
  quote_declined: XCircle,
  file_uploaded: FileUp,
  project_status_changed: Sparkles,
};

export function NotificationBell({ variant }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<NotificationResponse>({ unreadCount: 0, items: [] });
  const [panelPos, setPanelPos] = useState<{ top: number; right: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/notifications", { credentials: "include" });
      const json = (await res.json()) as NotificationResponse & { error?: string };
      if (res.ok) setData(json);
      else setError(json.error ?? "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(t);
  }, [router]);

  useEffect(() => {
    if (!open) return;
    function positionPanel() {
      const btn = buttonRef.current;
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      setPanelPos({
        top: rect.bottom + 8,
        right: Math.max(8, window.innerWidth - rect.right),
      });
    }
    positionPanel();
    window.addEventListener("resize", positionPanel);
    window.addEventListener("scroll", positionPanel, true);
    return () => {
      window.removeEventListener("resize", positionPanel);
      window.removeEventListener("scroll", positionPanel, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node;
      if (buttonRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const hasUnread = useMemo(() => data.unreadCount > 0, [data.unreadCount]);
  const theme = roleTheme(variant);

  async function markAllRead() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/notifications", { method: "POST", credentials: "include" });
      if (!res.ok) throw new Error("Failed to mark all read.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to mark all read.");
    } finally {
      setBusy(false);
    }
  }

  async function openItem(n: NotificationItem) {
    setBusy(true);
    setError(null);
    try {
      if (!n.readAt) {
        const res = await fetch(`/api/notifications/${n.id}/read`, {
          method: "POST",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to mark notification read.");
      }
      await load();
      if (n.projectId) {
        setOpen(false);
        router.push(
          variant === "admin"
            ? `/admin/projects/${n.projectId}`
            : `/portal/projects/${n.projectId}`,
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to open notification.");
    } finally {
      setBusy(false);
    }
  }

  const grouped = useMemo(() => groupByDay(data.items), [data.items]);

  const panel =
    open && panelPos ? (
      <div
        ref={panelRef}
        style={{ top: panelPos.top, right: panelPos.right }}
        className={cx(
          "ws-pop-in ws-glass fixed z-[100] w-[min(24rem,calc(100vw-1rem))] origin-top-right p-3 shadow-xl",
          theme.ring,
        )}
        role="dialog"
        aria-label="Notifications"
      >
        <header className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">Notifications</h3>
          <button
            type="button"
            onClick={markAllRead}
            disabled={busy || !hasUnread}
            className="ws-focus-ring rounded-md px-2 py-1 text-xs font-medium text-text-muted transition hover:bg-[color:var(--surface-overlay)] hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? "Working" : "Mark all read"}
          </button>
        </header>

        {error ? (
          <p className="mt-2 rounded-lg border border-[color:var(--status-danger-ring)]/60 bg-[color:var(--status-danger-bg)] px-2.5 py-1.5 text-xs text-[color:var(--status-danger-fg)]">
            {error}
          </p>
        ) : null}

        <div className="mt-3 max-h-[min(26rem,70vh)] overflow-y-auto pr-1">
          {loading ? (
            <p className="py-6 text-center text-sm text-text-muted">Loading…</p>
          ) : data.items.length === 0 ? (
            <p className="py-6 text-center text-sm text-text-muted">No notifications yet.</p>
          ) : (
            <ul className="space-y-3">
              {grouped.map(({ label, items }) => (
                <li key={label}>
                  <p className="ws-eyebrow mb-1.5 px-1">{label}</p>
                  <ul className="space-y-1.5">
                    {items.map((n) => {
                      const Icon = typeIcon[n.type] ?? Sparkles;
                      return (
                        <li key={n.id}>
                          <button
                            type="button"
                            onClick={() => openItem(n)}
                            className={cx(
                              "ws-focus-ring flex w-full items-start gap-2 rounded-lg border px-2.5 py-2 text-left transition",
                              "hover:bg-[color:var(--surface-overlay)]",
                              n.readAt
                                ? "border-[color:var(--border-subtle)] bg-[color:var(--surface-raised)]/40 text-text-muted"
                                : "border-[color:var(--border-default)] bg-[color:var(--surface-raised)] text-text-primary",
                            )}
                          >
                            <span
                              className={cx(
                                "mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border",
                                n.readAt
                                  ? "border-[color:var(--border-subtle)] bg-[color:var(--surface-sunken)] text-text-muted"
                                  : "border-[color:var(--brand-primary)]/40 bg-[color:var(--brand-primary)]/10 text-[color:var(--brand-primary)]",
                              )}
                            >
                              <Icon className="h-3.5 w-3.5" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium">{n.title}</span>
                              {n.body ? (
                                <span className="mt-0.5 block truncate text-xs text-text-muted">
                                  {n.body}
                                </span>
                              ) : null}
                              <span className="ws-mono mt-1 block text-[10px] uppercase tracking-wider text-text-faint">
                                {new Date(n.createdAt).toLocaleString(undefined, {
                                  dateStyle: "short",
                                  timeStyle: "short",
                                })}
                              </span>
                            </span>
                            {!n.readAt ? (
                              <span
                                aria-hidden="true"
                                className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--brand-primary)]"
                              />
                            ) : null}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={hasUnread ? `Notifications, ${data.unreadCount} unread` : "Notifications"}
        aria-expanded={open}
        className={cx(
          "ws-focus-ring relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition",
          "border-[color:var(--border-default)] bg-[color:var(--surface-raised)]",
          hasUnread ? "text-text-primary" : "text-text-muted hover:text-text-primary",
        )}
      >
        {hasUnread ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
        {hasUnread ? (
          <span
            className={cx(
              "absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold leading-none shadow-[0_0_0_2px_var(--surface-base)]",
              "bg-[color:var(--brand-primary)] text-[color:var(--brand-on-primary)]",
            )}
          >
            {data.unreadCount > 99 ? "99+" : data.unreadCount}
          </span>
        ) : null}
      </button>
      {typeof document !== "undefined" && panel ? createPortal(panel, document.body) : null}
    </>
  );
}

function groupByDay(items: NotificationItem[]): { label: string; items: NotificationItem[] }[] {
  const groups: Record<string, NotificationItem[]> = {};
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 86400000;

  for (const n of items) {
    const ts = new Date(n.createdAt).getTime();
    let key: string;
    if (ts >= today) key = "Today";
    else if (ts >= yesterday) key = "Yesterday";
    else key = "Earlier";
    (groups[key] ??= []).push(n);
  }

  const order = ["Today", "Yesterday", "Earlier"];
  return order
    .filter((label) => groups[label]?.length)
    .map((label) => ({ label, items: groups[label] }));
}
