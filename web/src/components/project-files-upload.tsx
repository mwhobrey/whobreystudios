"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState, type DragEvent, type FormEvent } from "react";
import { Upload, UploadCloud } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AlertBanner } from "@/components/ui/alert-banner";
import { FormField } from "@/components/ui/form-field";
import { formatFileSize } from "@/lib/format";
import { cx } from "@/lib/ui";

type Props = {
  projectId: string;
  variant: "admin" | "portal";
};

export function ProjectFilesUpload({ projectId, variant }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const setFile = useCallback((file: File | null) => {
    setSelectedFile(file);
    if (!fileInputRef.current) return;
    const dt = new DataTransfer();
    if (file) dt.items.add(file);
    fileInputRef.current.files = dt.files;
  }, []);

  const onFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      setSelectedFile(file);
      setError(null);
    },
    [],
  );

  const onDrop = useCallback(
    (e: DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setDragOver(false);
      if (pending) return;
      const file = e.dataTransfer.files?.[0];
      if (!file) return;
      setFile(file);
      setError(null);
    },
    [pending, setFile],
  );

  async function uploadFile(form: HTMLFormElement, file: File) {
    const fd = new FormData(form);
    fd.set("file", file);
    const kind = String(fd.get("kind") ?? "draft");
    if (variant === "portal") {
      fd.set("source", "intake");
      fd.set("revisionNumber", "0");
    } else {
      fd.set("source", kind === "final" ? "delivery" : "revision");
    }

    const res = await fetch(`/api/projects/${projectId}/files`, {
      method: "POST",
      body: fd,
      credentials: "include",
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      throw new Error(data.error ?? "Upload failed.");
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const file = selectedFile ?? fileInputRef.current?.files?.[0];
    if (!file) {
      setError("Choose or drop a file.");
      return;
    }

    setPending(true);
    try {
      await uploadFile(e.currentTarget, file);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error.");
    } finally {
      setPending(false);
    }
  }

  const inputId = `project-file-${projectId}`;

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
              : " Drag and drop or browse."}
          </p>
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:gap-3"
      >
        <FormField label="File" required className="min-w-0 flex-1">
          <label
            htmlFor={inputId}
            onDragEnter={(e) => {
              e.preventDefault();
              if (!pending) setDragOver(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              if (!pending) setDragOver(true);
            }}
            onDragLeave={(e) => {
              if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
              setDragOver(false);
            }}
            onDrop={onDrop}
            className={cx(
              "ws-focus-ring flex h-10 cursor-pointer items-center gap-2 overflow-hidden rounded-xl border px-3 transition",
              dragOver
                ? "border-[color:var(--brand-primary)] bg-[color:var(--brand-primary)]/5 shadow-[0_0_0_3px_var(--brand-primary-glow)]"
                : "border-[color:var(--border-default)] bg-[rgba(8,8,12,0.65)] hover:border-[color:var(--border-strong)]",
              pending && "cursor-not-allowed opacity-55",
            )}
          >
            <UploadCloud
              className={cx(
                "h-4 w-4 shrink-0",
                dragOver ? "text-[color:var(--brand-primary)]" : "text-text-muted",
              )}
              aria-hidden
            />
            <span
              className={cx(
                "min-w-0 truncate text-sm",
                selectedFile ? "text-text-primary" : "text-text-faint",
              )}
            >
              {selectedFile
                ? `${selectedFile.name} · ${formatFileSize(selectedFile.size)}`
                : "Drop file here or browse"}
            </span>
            <input
              id={inputId}
              ref={fileInputRef}
              name="file"
              type="file"
              disabled={pending}
              onChange={onFileInputChange}
              className="sr-only"
            />
          </label>
        </FormField>

        <FormField label="Kind" className="w-full lg:w-28">
          <select
            name="kind"
            defaultValue="draft"
            disabled={pending || variant === "portal"}
            className="ws-input h-10"
          >
            <option value="draft">Draft</option>
            <option value="final">Final</option>
          </select>
        </FormField>

        <FormField label="Revision" className="w-full lg:w-24">
          <input
            name="revisionNumber"
            type="number"
            min={1}
            max={999}
            defaultValue={1}
            disabled={pending || variant === "portal"}
            className="ws-input h-10 tabular-nums"
          />
        </FormField>

        <FormField label="Upload" className="w-full shrink-0 lg:w-auto">
          <AppButton
            type="submit"
            roleVariant={variant}
            loading={pending}
            className="h-10 w-full lg:w-auto"
            iconLeft={!pending ? <Upload className="h-3.5 w-3.5" /> : undefined}
          >
            {pending ? "Uploading" : "Upload"}
          </AppButton>
        </FormField>
      </form>

      {error ? (
        <div className="mt-3">
          <AlertBanner tone="error">{error}</AlertBanner>
        </div>
      ) : null}
    </div>
  );
}
