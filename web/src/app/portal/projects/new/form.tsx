"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import {
  ArrowRight,
  ContactIcon,
  FilePlus,
  Paperclip,
  Sparkles,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { createProjectFormAction, type CreateProjectFormState } from "./actions";
import { AppButton } from "@/components/ui/app-button";
import { AlertBanner } from "@/components/ui/alert-banner";
import { FormField } from "@/components/ui/form-field";
import { formatFileSize } from "@/lib/format";
import { cx } from "@/lib/ui";

function fieldError(state: CreateProjectFormState | undefined, key: string): string | null {
  return state?.fieldErrors?.[key]?.[0] ?? null;
}

export function NewProjectForm({
  serviceTypes,
}: {
  serviceTypes: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(createProjectFormAction, {});
  const router = useRouter();
  const [serviceChoice, setServiceChoice] = useState<string>(
    () => serviceTypes[0]?.id ?? "__other__",
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const createdProjectIdRef = useRef<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const showOther =
    serviceTypes.length === 0 ? true : serviceChoice === "__other__";

  const setNativeFiles = useCallback((nextFiles: File[]) => {
    if (!fileInputRef.current) return;
    const dt = new DataTransfer();
    nextFiles.forEach((f) => dt.items.add(f));
    fileInputRef.current.files = dt.files;
  }, []);

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const arr = Array.from(incoming);
      setFiles((prev) => {
        // Deduplicate by name+size+lastModified (cheap enough for the UI).
        const seen = new Set(prev.map((f) => `${f.name}|${f.size}|${f.lastModified}`));
        const merged = [...prev];
        for (const f of arr) {
          const key = `${f.name}|${f.size}|${f.lastModified}`;
          if (!seen.has(key)) {
            merged.push(f);
            seen.add(key);
          }
        }
        setNativeFiles(merged);
        return merged;
      });
    },
    [setNativeFiles],
  );

  const removeFile = useCallback(
    (idx: number) => {
      setFiles((prev) => {
        const next = prev.filter((_, i) => i !== idx);
        setNativeFiles(next);
        return next;
      });
    },
    [setNativeFiles],
  );

  function onFileInputChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
  }

  function onDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }

  // After the project is created server-side, upload the attachments and redirect.
  useEffect(() => {
    if (!state.projectId || createdProjectIdRef.current === state.projectId) return;
    createdProjectIdRef.current = state.projectId;
    const queued = [...files];
    if (queued.length === 0) {
      router.push(`/portal/projects/${state.projectId}`);
      return;
    }

    let cancelled = false;
    async function runUploads() {
      setUploading(true);
      let failed = 0;

      for (const file of queued) {
        const fd = new FormData();
        fd.set("file", file);
        fd.set("kind", "draft");
        fd.set("revisionNumber", "0");
        fd.set("source", "intake");
        const res = await fetch(`/api/projects/${state.projectId}/files`, {
          method: "POST",
          body: fd,
          credentials: "include",
        });
        if (!res.ok) failed += 1;
      }

      if (cancelled) return;
      setUploading(false);
      if (failed > 0) {
        setUploadError(
          `Project created, but ${failed} attachment${failed === 1 ? "" : "s"} failed to upload. You can retry from the project page.`,
        );
        return;
      }
      router.push(`/portal/projects/${state.projectId}`);
    }
    void runUploads();
    return () => {
      cancelled = true;
    };
  }, [router, state.projectId, files]);

  return (
    <form action={formAction} className="ws-fade-up grid gap-6 max-w-3xl">
      {state?.error ? <AlertBanner tone="error">{state.error}</AlertBanner> : null}
      {uploading ? (
        <AlertBanner tone="info">Project created. Uploading attachments…</AlertBanner>
      ) : null}
      {uploadError && state.projectId ? (
        <AlertBanner tone="warning">
          {uploadError}{" "}
          <Link
            href={`/portal/projects/${state.projectId}`}
            className="font-medium text-text-primary underline-offset-4 hover:underline"
          >
            Open project
          </Link>
        </AlertBanner>
      ) : null}

      {/* Section 1: Contact */}
      <Section
        icon={<ContactIcon className="h-4 w-4" />}
        title="Contact"
        subtitle="So we know where to reach you."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Full name" required error={fieldError(state, "fullName")} className="sm:col-span-2">
            <input name="fullName" required autoComplete="name" className="ws-input" />
          </FormField>
          <FormField
            label="Business name"
            error={fieldError(state, "businessName")}
            className="sm:col-span-2"
            hint="Optional — leave blank if this is a personal project."
          >
            <input name="businessName" autoComplete="organization" className="ws-input" />
          </FormField>
          <FormField label="Phone" required error={fieldError(state, "phone")}>
            <input name="phone" type="tel" required autoComplete="tel" className="ws-input" />
          </FormField>
          <FormField label="Email" required error={fieldError(state, "contactEmail")}>
            <input
              name="contactEmail"
              type="email"
              required
              autoComplete="email"
              className="ws-input"
            />
          </FormField>
          <FormField
            label="Preferred contact"
            required
            error={fieldError(state, "preferredContactMethod")}
            className="sm:col-span-2"
          >
            <select
              name="preferredContactMethod"
              required
              defaultValue="email"
              className="ws-input"
            >
              <option value="email">Email</option>
              <option value="phone">Phone call</option>
              <option value="sms">Text / SMS</option>
              <option value="other">Other</option>
            </select>
          </FormField>
        </div>
      </Section>

      {/* Section 2: Project */}
      <Section
        icon={<Sparkles className="h-4 w-4" />}
        title="Project"
        subtitle="What needs to be created or produced? Be as specific as you like."
      >
        <div className="grid gap-4">
          <FormField label="Project type" required error={fieldError(state, "projectType")}>
            {serviceTypes.length === 0 ? (
              <>
                <input
                  name="projectType"
                  required
                  placeholder="e.g. Logo, vehicle wrap, social banner"
                  className="ws-input"
                />
                <p className="text-xs text-text-faint">
                  No catalog yet — the studio can add preset types under Admin → Settings → Service
                  types.
                </p>
              </>
            ) : (
              <>
                <select
                  name="serviceTypeId"
                  required
                  value={serviceChoice}
                  onChange={(e) => setServiceChoice(e.target.value)}
                  className="ws-input"
                >
                  {serviceTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                  <option value="__other__">Other (describe below)</option>
                </select>
                {showOther ? (
                  <input
                    name="projectType"
                    required={showOther}
                    placeholder="Describe your project type"
                    className="ws-input"
                  />
                ) : null}
              </>
            )}
          </FormField>

          <FormField label="Deadline" hint="Optional" error={fieldError(state, "deadline")}>
            <input name="deadline" type="datetime-local" className="ws-input" />
          </FormField>

          <FormField
            label="Notes &amp; direction"
            hint="Sizes, tone, links to inspiration — anything that helps."
            error={fieldError(state, "notes")}
          >
            <textarea
              name="notes"
              rows={5}
              placeholder="Describe what you need…"
              className="ws-input"
            />
          </FormField>
        </div>
      </Section>

      {/* Section 3: Attachments */}
      <Section
        icon={<Paperclip className="h-4 w-4" />}
        title="Attachments"
        subtitle="Optional — references, mood boards, existing brand assets."
      >
        <label
          htmlFor="attachments-input"
          onDragEnter={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={cx(
            "ws-focus-ring flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl",
            "border-2 border-dashed px-6 py-8 text-center transition",
            dragOver
              ? "border-[color:var(--brand-primary)] bg-[color:var(--brand-primary)]/5"
              : "border-[color:var(--border-default)] bg-[color:var(--surface-raised)]/50 hover:border-[color:var(--border-strong)]",
          )}
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-overlay)] text-[color:var(--brand-primary)]">
            <UploadCloud className="h-5 w-5" />
          </span>
          <p className="text-sm font-medium text-text-primary">
            Drop files here or click to browse
          </p>
          <p className="text-xs text-text-muted">
            Up to 50MB per file · Images, PDFs, design files
          </p>
          <input
            id="attachments-input"
            ref={fileInputRef}
            name="attachments"
            type="file"
            multiple
            onChange={onFileInputChange}
            disabled={pending || uploading}
            className="sr-only"
          />
        </label>

        {files.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {files.map((f, idx) => (
              <li
                key={`${f.name}-${idx}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-raised)] px-3 py-2"
              >
                <div className="min-w-0 flex items-center gap-2">
                  <FilePlus className="h-3.5 w-3.5 shrink-0 text-text-muted" />
                  <span className="truncate text-sm text-text-secondary" title={f.name}>
                    {f.name}
                  </span>
                  <span className="ws-mono shrink-0 text-[10px] uppercase tracking-wider text-text-faint">
                    {formatFileSize(f.size)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="ws-focus-ring inline-flex h-7 w-7 items-center justify-center rounded-md text-text-faint transition hover:bg-[color:var(--surface-overlay)] hover:text-[color:var(--status-danger-fg)]"
                  aria-label={`Remove ${f.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </Section>

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[color:var(--border-subtle)] pt-6">
        <Link
          href="/portal"
          className="ws-focus-ring rounded-md text-sm font-medium text-text-muted transition hover:text-text-primary"
        >
          Cancel
        </Link>
        <AppButton
          type="submit"
          loading={pending || uploading}
          roleVariant="portal"
          iconRight={!pending && !uploading ? <ArrowRight className="h-4 w-4" /> : undefined}
          size="lg"
        >
          {pending || uploading ? "Submitting" : "Submit request"}
        </AppButton>
      </div>
    </form>
  );
}

function Section({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="ws-panel p-6">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--surface-overlay)] text-text-muted">
          {icon}
        </span>
        <div>
          <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
          <p className="text-xs text-text-muted">{subtitle}</p>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}
