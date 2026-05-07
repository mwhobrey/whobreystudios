"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Upload } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AlertBanner } from "@/components/ui/alert-banner";
import { FormField } from "@/components/ui/form-field";

type Props = {
  projectId: string;
  variant: "admin" | "portal";
};

export function ProjectFilesUpload({ projectId, variant }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fileInput = form.elements.namedItem("file") as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (!file) {
      setError("Choose a file.");
      return;
    }

    const fd = new FormData(form);
    const kind = String(fd.get("kind") ?? "draft");
    if (variant === "portal") {
      fd.set("source", "intake");
      fd.set("revisionNumber", "0");
    } else {
      fd.set("source", kind === "final" ? "delivery" : "revision");
    }
    setPending(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/files`, {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Upload failed.");
        return;
      }
      fileInput.value = "";
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-2xl border border-dashed border-[color:var(--border-default)] bg-[color:var(--surface-raised)]/50 p-5">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--surface-overlay)] text-text-muted">
          <Upload className="h-3.5 w-3.5" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Upload a file</h3>
          <p className="text-xs text-text-muted">
            Design files and PDFs; max 50MB. Executables are not accepted.
            {variant === "portal"
              ? " Client uploads are treated as intake references and don't consume revision rounds."
              : ""}
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
        <FormField label="File" required>
          <input
            name="file"
            type="file"
            required
            disabled={pending}
            className="ws-input file:mr-2 file:rounded-md file:border-0 file:bg-[color:var(--surface-overlay)] file:px-2 file:py-1 file:text-text-primary"
          />
        </FormField>
        <FormField label="Kind">
          <select
            name="kind"
            defaultValue="draft"
            disabled={pending || variant === "portal"}
            className="ws-input"
          >
            <option value="draft">Draft</option>
            <option value="final">Final</option>
          </select>
        </FormField>
        <FormField label="Revision">
          <input
            name="revisionNumber"
            type="number"
            min={1}
            max={999}
            defaultValue={1}
            disabled={pending || variant === "portal"}
            className="ws-input w-24"
          />
        </FormField>
        <div className="flex items-end">
          <AppButton
            type="submit"
            roleVariant={variant}
            loading={pending}
            iconLeft={!pending ? <Upload className="h-3.5 w-3.5" /> : undefined}
          >
            {pending ? "Uploading" : "Upload"}
          </AppButton>
        </div>
      </form>
      {error ? (
        <div className="mt-3">
          <AlertBanner tone="error">{error}</AlertBanner>
        </div>
      ) : null}
    </div>
  );
}
