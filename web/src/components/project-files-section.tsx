import { Download, FileText } from "lucide-react";
import type { FileAssetWithUploader } from "@/lib/data/file-assets";
import { formatEnumLabel, formatFileSize } from "@/lib/format";
import { ProjectFilesUpload } from "@/components/project-files-upload";
import { EmptyState } from "@/components/ui/empty-state";
import { cx, roleTheme } from "@/lib/ui";

type Props = {
  projectId: string;
  variant: "admin" | "portal";
  assets: FileAssetWithUploader[];
};

export function ProjectFilesSection({ projectId, variant, assets }: Props) {
  const theme = roleTheme(variant);

  return (
    <div className="space-y-6">
      <p className="text-sm text-text-muted">
        Drafts and deliverables for this project. Files are stored on the server for now;
        production can move to S3-style storage without changing the UI.
      </p>

      {assets.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No files yet."
          description={
            variant === "admin"
              ? "Upload draft revisions and final deliverables below."
              : "Once the studio uploads drafts or final files for this project, they'll appear here."
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[color:var(--border-default)] bg-[color:var(--surface-raised)]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[color:var(--border-subtle)] bg-[color:var(--surface-sunken)] text-xs uppercase tracking-wider text-text-faint">
                <th className="py-2.5 pl-4 pr-3 font-medium">Name</th>
                <th className="py-2.5 pr-3 font-medium">Kind</th>
                <th className="py-2.5 pr-3 font-medium">Source</th>
                <th className="py-2.5 pr-3 font-medium">Rev</th>
                <th className="py-2.5 pr-3 font-medium">Size</th>
                <th className="py-2.5 pr-3 font-medium">Uploaded by</th>
                <th className="py-2.5 pr-3 font-medium">When</th>
                <th className="py-2.5 pr-4 font-medium text-right"> </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--border-subtle)]">
              {assets.map((a) => (
                <tr key={a.id} className="transition hover:bg-[color:var(--surface-overlay)]">
                  <td
                    className="max-w-[14rem] truncate py-2.5 pl-4 pr-3 font-medium text-text-primary"
                    title={a.originalName}
                  >
                    {a.originalName}
                  </td>
                  <td className="py-2.5 pr-3">
                    <span
                      className={cx(
                        "ws-mono inline-flex rounded-full border px-1.5 py-0.5 text-[10px] uppercase tracking-wider",
                        a.kind === "final"
                          ? "border-[color:var(--status-success-ring)]/50 bg-[color:var(--status-success-bg)] text-[color:var(--status-success-fg)]"
                          : "border-[color:var(--border-default)] bg-[color:var(--surface-sunken)] text-text-muted",
                      )}
                    >
                      {a.kind}
                    </span>
                  </td>
                  <td className="ws-mono py-2.5 pr-3 text-xs text-text-muted">
                    {formatEnumLabel(a.source)}
                  </td>
                  <td className="ws-mono py-2.5 pr-3 tabular-nums text-text-secondary">
                    {a.revisionNumber}
                  </td>
                  <td className="ws-mono py-2.5 pr-3 tabular-nums text-text-muted">
                    {formatFileSize(a.sizeBytes)}
                  </td>
                  <td className="py-2.5 pr-3 text-text-muted">
                    {a.uploadedBy.name ?? a.uploadedBy.email ?? "—"}
                  </td>
                  <td className="py-2.5 pr-3 ws-mono text-[11px] uppercase tracking-wider text-text-faint">
                    {a.createdAt.toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="py-2.5 pr-4 text-right">
                    <a
                      className={cx(
                        "ws-focus-ring inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition hover:bg-[color:var(--surface-overlay)]",
                        theme.tint,
                      )}
                      href={`/api/projects/${projectId}/files/${a.id}`}
                    >
                      <Download className="h-3 w-3" />
                      Download
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ProjectFilesUpload projectId={projectId} variant={variant} />
    </div>
  );
}
