import { NextResponse } from "next/server";
import { requireApiRoles } from "@/lib/auth";
import {
  createProjectFileUpload,
  FileUploadError,
} from "@/lib/data/file-assets";
import { uploadKindSchema, uploadRevisionSchema } from "@/lib/schemas/file-upload";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const authResult = await requireApiRoles(["admin", "client"]);
  if (authResult instanceof NextResponse) return authResult;
  const appUser = authResult;

  const { id: projectId } = await context.params;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const kindParsed = uploadKindSchema.safeParse(formData.get("kind"));
  if (!kindParsed.success) {
    return NextResponse.json({ error: "Choose draft or final." }, { status: 400 });
  }

  const revRaw = formData.get("revisionNumber");
  let revisionNumber = 1;
  if (revRaw != null && String(revRaw).trim() !== "") {
    const r = uploadRevisionSchema.safeParse(revRaw);
    if (!r.success) {
      return NextResponse.json({ error: "Revision must be 1–999." }, { status: 400 });
    }
    revisionNumber = r.data ?? 1;
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Choose a file." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Enforce basic role semantics:
  // - clients can only upload intake/reference drafts at revision 0
  // - admins can choose kind/revision flow
  const sourceRaw = String(formData.get("source") ?? "").trim();
  const source =
    sourceRaw === "delivery" || sourceRaw === "revision" || sourceRaw === "intake"
      ? sourceRaw
      : undefined;
  if (appUser.role === "client") {
    if (kindParsed.data !== "draft") {
      return NextResponse.json({ error: "Clients cannot upload final files." }, { status: 403 });
    }
    revisionNumber = 0;
  }
  const resolvedSource = appUser.role === "client" ? "intake" : source ?? "revision";
  if (resolvedSource === "intake" && (kindParsed.data !== "draft" || revisionNumber !== 0)) {
    return NextResponse.json(
      { error: "Intake uploads must be draft files with revision 0." },
      { status: 400 },
    );
  }
  if (resolvedSource === "revision" && (kindParsed.data !== "draft" || revisionNumber < 1)) {
    return NextResponse.json(
      { error: "Revision uploads must be draft files with revision >= 1." },
      { status: 400 },
    );
  }
  if (resolvedSource === "delivery" && (kindParsed.data !== "final" || revisionNumber < 1)) {
    return NextResponse.json(
      { error: "Delivery uploads must be final files with revision >= 1." },
      { status: 400 },
    );
  }

  try {
    const row = await createProjectFileUpload({
      projectId,
      viewer: { id: appUser.id, role: appUser.role },
      originalName: file.name || "upload",
      mimeType: file.type || "application/octet-stream",
      kind: kindParsed.data,
      source: resolvedSource,
      revisionNumber,
      buffer,
    });

    return NextResponse.json({
      id: row.id,
      originalName: row.originalName,
      kind: row.kind,
      revisionNumber: row.revisionNumber,
      sizeBytes: row.sizeBytes,
      createdAt: row.createdAt.toISOString(),
    });
  } catch (e) {
    if (e instanceof FileUploadError) {
      const status =
        e.code === "forbidden" ? 403 : e.code === "too_large" ? 413 : 400;
      return NextResponse.json({ error: e.message }, { status });
    }
    throw e;
  }
}
