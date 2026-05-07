import { NextResponse } from "next/server";
import { requireApiRoles } from "@/lib/auth";
import { getFileAssetForDownload } from "@/lib/data/file-assets";
import { getFinalFileAccessDecision } from "@/lib/payments/policy";
import { readStoredFileBytes } from "@/lib/storage/project-files";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string; fileId: string }> };

function asciiFallbackFilename(name: string): string {
  const s = name.replace(/[^\x20-\x7E]/g, "_");
  return s.slice(0, 200) || "download";
}

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireApiRoles(["admin", "client"]);
  if (authResult instanceof NextResponse) return authResult;
  const appUser = authResult;

  const { id: projectId, fileId } = await context.params;

  const asset = await getFileAssetForDownload(projectId, fileId, {
    id: appUser.id,
    role: appUser.role,
  });

  if (!asset) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const decision = await getFinalFileAccessDecision({
    fileKind: asset.kind,
    projectId,
    projectStatus: asset.project.status,
    userId: appUser.id,
    userRole: appUser.role,
  });
  if (!decision.allowed) {
    return NextResponse.json(
      {
        error: "Final files are locked pending payment.",
        reason: decision.reason,
        invoiceStatus: decision.invoiceStatus,
      },
      { status: 403 },
    );
  }

  let body: Buffer;
  try {
    body = await readStoredFileBytes(asset.storageKey);
  } catch {
    return NextResponse.json({ error: "File missing on disk" }, { status: 404 });
  }

  const asciiName = asciiFallbackFilename(asset.originalName);
  const encoded = encodeURIComponent(asset.originalName);

  return new NextResponse(new Uint8Array(body), {
    headers: {
      "Content-Type": asset.mimeType,
      "Content-Length": String(body.length),
      "Content-Disposition": `attachment; filename="${asciiName}"; filename*=UTF-8''${encoded}`,
      "Cache-Control": "private, no-store",
    },
  });
}
