"use client";

import { useState } from "react";
import { Wallet } from "lucide-react";
import { formatUsd } from "@/lib/format";
import { AppButton } from "@/components/ui/app-button";
import { AlertBanner } from "@/components/ui/alert-banner";

type Props = {
  projectId: string;
  paymentType: "deposit" | "final";
  amountCents: number;
  label: string;
  description: string;
};

export function PaymentPanel({ projectId, paymentType, amountCents, label, description }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function startCheckout() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: paymentType }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Could not start checkout.");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Network error starting checkout.");
      setLoading(false);
    }
  }

  return (
    <div className="ws-elevated relative overflow-hidden p-6">
      <div aria-hidden="true" className="ws-mesh-soft" />
      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className="ws-eyebrow">{label}</span>
            <p className="mt-2 text-sm text-text-muted">{description}</p>
          </div>
          <span className="ws-mono text-3xl font-semibold tabular-nums tracking-tight text-text-primary">
            {formatUsd(amountCents)}
          </span>
        </div>

        {error ? (
          <div className="mt-4">
            <AlertBanner tone="error">{error}</AlertBanner>
          </div>
        ) : null}

        <div className="mt-6">
          <AppButton
            type="button"
            roleVariant="portal"
            loading={loading}
            iconLeft={!loading ? <Wallet className="h-4 w-4" /> : undefined}
            onClick={() => void startCheckout()}
          >
            {loading ? "Redirecting" : label}
          </AppButton>
        </div>
      </div>
    </div>
  );
}
