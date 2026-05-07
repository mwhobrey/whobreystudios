import "server-only";

import { randomUUID } from "node:crypto";

import type { Prisma } from "@/generated/prisma/client";
import type { FileAssetKind, FileAssetSource, UserRole } from "@/generated/prisma/enums";
import { createNotificationsBestEffort, getProjectAudience } from "@/lib/data/notifications";
import { getPrisma } from "@/lib/prisma";
import { removeStoredFile, saveUploadedBytes } from "@/lib/storage/project-files";
import { userCanAccessProject } from "@/lib/data/projects";

const uploaderSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
} as const;

export const fileAssetListInclude = {
  uploadedBy: { select: uploaderSelect },
} satisfies Prisma.FileAssetInclude;

export type FileAssetWithUploader = Prisma.FileAssetGetPayload<{
  include: typeof fileAssetListInclude;
}>;

const ALLOWED_EXT = new Set([
  ".pdf",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".svg",
  ".ai",
  ".eps",
  ".psd",
  ".zip",
  ".tif",
  ".tiff",
]);

export function maxUploadBytes(): number {
  const raw = process.env.MAX_UPLOAD_BYTES;
  if (raw && /^\d+$/.test(raw)) return Number.parseInt(raw, 10);
  return 50 * 1024 * 1024;
}

export function assertAllowedUpload(name: string): void {
  const lower = name.toLowerCase();
  const dot = lower.lastIndexOf(".");
  const ext = dot >= 0 ? lower.slice(dot) : "";
  if (!ALLOWED_EXT.has(ext)) {
    throw new FileUploadError(
      `File type not allowed. Use: ${[...ALLOWED_EXT].join(", ")}`,
      "bad_type",
    );
  }
}

export class FileUploadError extends Error {
  constructor(
    message: string,
    public readonly code: "bad_type" | "too_large" | "forbidden" | "invalid" | "policy",
  ) {
    super(message);
    this.name = "FileUploadError";
  }
}

export function sanitizeStoredFileName(name: string): string {
  const base = name.replace(/^.*[/\\]/, "").trim().slice(0, 180);
  const cleaned = base.replace(/[^a-zA-Z0-9._()[\] -]+/g, "_");
  return cleaned || "upload";
}

export async function listFileAssetsForProject(
  projectId: string,
  viewer: { id: string; role: UserRole },
): Promise<FileAssetWithUploader[]> {
  const ok = await userCanAccessProject(projectId, viewer);
  if (!ok) return [];

  return getPrisma().fileAsset.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    include: fileAssetListInclude,
  });
}

export async function getFileAssetForDownload(
  projectId: string,
  fileId: string,
  viewer: { id: string; role: UserRole },
) {
  const ok = await userCanAccessProject(projectId, viewer);
  if (!ok) return null;

  return getPrisma().fileAsset.findFirst({
    where: { id: fileId, projectId },
    include: {
      project: {
        select: {
          id: true,
          status: true,
          clientUserId: true,
        },
      },
    },
  });
}

export async function createProjectFileUpload(input: {
  projectId: string;
  viewer: { id: string; role: UserRole };
  originalName: string;
  mimeType: string;
  kind: FileAssetKind;
  source?: FileAssetSource;
  revisionNumber: number;
  buffer: Buffer;
}) {
  const ok = await userCanAccessProject(input.projectId, input.viewer);
  if (!ok) throw new FileUploadError("Forbidden", "forbidden");

  assertAllowedUpload(input.originalName);

  const max = maxUploadBytes();
  if (input.buffer.length > max) {
    throw new FileUploadError(`File too large (max ${Math.floor(max / (1024 * 1024))} MB).`, "too_large");
  }

  const source = input.source ?? "revision";
  if (source === "intake") {
    if (input.kind !== "draft" || input.revisionNumber !== 0) {
      throw new FileUploadError("Intake uploads must be draft files with revision 0.", "policy");
    }
  } else if (source === "revision") {
    if (input.kind !== "draft" || input.revisionNumber < 1) {
      throw new FileUploadError("Revision uploads must be draft files with revision >= 1.", "policy");
    }
  } else if (source === "delivery") {
    if (input.kind !== "final" || input.revisionNumber < 1) {
      throw new FileUploadError("Delivery uploads must be final files with revision >= 1.", "policy");
    }
  }

  const safe = sanitizeStoredFileName(input.originalName);
  const id = randomUUID();
  const storageKey = `projects/${input.projectId}/${id}_${safe}`;

  await saveUploadedBytes(storageKey, input.buffer);

  let row: FileAssetWithUploader;
  try {
    row = await getPrisma().fileAsset.create({
      data: {
        id,
        projectId: input.projectId,
        uploadedById: input.viewer.id,
        kind: input.kind,
        source,
        revisionNumber: input.revisionNumber,
        originalName: input.originalName,
        storageKey,
        mimeType: input.mimeType || "application/octet-stream",
        sizeBytes: input.buffer.length,
      },
      include: fileAssetListInclude,
    });
  } catch (e) {
    await removeStoredFile(storageKey);
    throw e;
  }

  // Best-effort notifications: successful upload should not fail due to downstream event issues.
  try {
    const audience = await getProjectAudience(input.projectId);
    if (audience) {
      const recipients =
        input.viewer.role === "admin"
          ? audience.clientUserId
            ? [audience.clientUserId]
            : []
          : audience.adminUserIds;
      await createNotificationsBestEffort(recipients, {
        actorUserId: input.viewer.id,
        projectId: input.projectId,
        type: "file_uploaded",
        title: "Project file uploaded",
        body: `${input.originalName} (${input.kind} r${input.revisionNumber})`,
      });
    }
  } catch {
    // ignore notification errors
  }

  return row;
}
