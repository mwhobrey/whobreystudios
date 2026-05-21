import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getWorkspaceSettings } from "@/lib/data/workspace-settings";
import { savePolicySettingsAction } from "./actions";
import { AppShell } from "@/components/ui/app-shell";
import { AppButton } from "@/components/ui/app-button";
import { FormField } from "@/components/ui/form-field";

export default async function PolicySettingsPage() {
  await requireRole(["admin"]);
  const settings = await getWorkspaceSettings();

  return (
    <AppShell
      variant="admin"
      eyebrow="Admin · Settings"
      title="Policy settings"
      subtitle="Default revision count, payment gate, and legal links shown in the client area."
      backLink={
        <Link
          href="/admin"
          className="ws-focus-ring inline-flex items-center gap-1.5 rounded hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Dashboard
        </Link>
      }
    >
      <form
        action={savePolicySettingsAction}
        className="ws-fade-up ws-panel max-w-2xl space-y-5 p-6"
      >
        <p className="text-xs text-text-faint">
          If URLs are left blank, the client area hides those links automatically.
        </p>

        <FormField label="Default included revisions">
          <input
            type="number"
            min={1}
            max={20}
            name="includedRevisionsDefault"
            defaultValue={settings.includedRevisionsDefault}
            className="ws-input w-28 tabular-nums"
          />
        </FormField>

        <FormField label="Default deposit %" hint="Applied to new quote drafts">
          <input
            type="number"
            min={1}
            max={99}
            name="defaultDepositPercent"
            defaultValue={settings.defaultDepositPercent}
            className="ws-input w-28 tabular-nums"
          />
        </FormField>

        <label className="flex items-start gap-3 rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-raised)]/60 p-3 text-sm">
          <input
            type="checkbox"
            name="finalFilesRequirePayment"
            defaultChecked={settings.finalFilesRequirePayment}
            className="mt-0.5 h-4 w-4 accent-[color:var(--brand-primary)]"
          />
          <span>
            <span className="font-medium text-text-primary">
              Require payment before final downloads
            </span>
            <span className="mt-0.5 block text-xs text-text-muted">
              Clients see a locked padlock on the Files section until the payment status clears.
            </span>
          </span>
        </label>

        <FormField label="Terms URL" hint="Optional">
          <input
            type="url"
            name="termsUrl"
            defaultValue={settings.termsUrl ?? ""}
            placeholder="https://"
            className="ws-input"
          />
        </FormField>
        <FormField label="Privacy URL" hint="Optional">
          <input
            type="url"
            name="privacyUrl"
            defaultValue={settings.privacyUrl ?? ""}
            placeholder="https://"
            className="ws-input"
          />
        </FormField>
        <FormField label="Refund policy URL" hint="Optional">
          <input
            type="url"
            name="refundPolicyUrl"
            defaultValue={settings.refundPolicyUrl ?? ""}
            placeholder="https://"
            className="ws-input"
          />
        </FormField>

        <div className="flex justify-end border-t border-[color:var(--border-subtle)] pt-5">
          <AppButton type="submit" roleVariant="admin">
            Save policy settings
          </AppButton>
        </div>
      </form>
    </AppShell>
  );
}
