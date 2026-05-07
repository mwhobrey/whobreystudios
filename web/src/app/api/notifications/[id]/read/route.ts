import { NextResponse } from "next/server";
import { requireApiRoles } from "@/lib/auth";
import { getUnreadNotificationCount, markNotificationRead } from "@/lib/data/notifications";

export const runtime = "nodejs";
type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const authResult = await requireApiRoles(["admin", "client"]);
  if (authResult instanceof NextResponse) return authResult;
  const appUser = authResult;
  const { id } = await context.params;

  try {
    const { changed } = await markNotificationRead(appUser.id, id);
    const unreadCount = await getUnreadNotificationCount(appUser.id);
    return NextResponse.json({ ok: true, changed, unreadCount });
  } catch {
    return NextResponse.json({ error: "Failed to mark notification read." }, { status: 500 });
  }
}
