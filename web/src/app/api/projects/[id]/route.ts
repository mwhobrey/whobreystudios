import { NextResponse } from "next/server";
import { requireApiRoles } from "@/lib/auth";
import { getProjectForViewer } from "@/lib/data/projects";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

/** Admin: any project. Client: only their own. */
export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireApiRoles(["admin", "client"]);
  if (authResult instanceof NextResponse) return authResult;
  const appUser = authResult;

  const { id } = await context.params;

  const project = await getProjectForViewer(id, { id: appUser.id, role: appUser.role });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json(project);
}
