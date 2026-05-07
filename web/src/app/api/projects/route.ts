import { NextResponse } from "next/server";
import { requireApiRoles } from "@/lib/auth";
import {
  insertProject,
  listProjectsAdminPaginated,
  parseCreateProjectJson,
} from "@/lib/data/projects";

export const runtime = "nodejs";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

/** Admin: list projects (newest first). */
export async function GET(request: Request) {
  const authResult = await requireApiRoles(["admin"]);
  if (authResult instanceof NextResponse) return authResult;

  const { searchParams } = new URL(request.url);
  const rawLimit = searchParams.get("limit");
  const rawPage = searchParams.get("page");
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, rawLimit ? Number.parseInt(rawLimit, 10) || DEFAULT_LIMIT : DEFAULT_LIMIT),
  );
  const page = Math.max(1, rawPage ? Number.parseInt(rawPage, 10) || 1 : 1);

  const result = await listProjectsAdminPaginated(page, limit);

  return NextResponse.json(result);
}

/** Client: create a project linked to the signed-in user. */
export async function POST(request: Request) {
  const authResult = await requireApiRoles(["client"]);
  if (authResult instanceof NextResponse) return authResult;
  const appUser = authResult;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = parseCreateProjectJson(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const project = await insertProject(appUser.id, parsed.data);
    return NextResponse.json(project, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.message === "INVALID_SERVICE_TYPE") {
      return NextResponse.json({ error: "Invalid or inactive service type" }, { status: 400 });
    }
    throw e;
  }
}
