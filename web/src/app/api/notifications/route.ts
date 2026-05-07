import { NextResponse } from "next/server";
import { requireApiRoles } from "@/lib/auth";
import {
  getUnreadNotificationCount,
  listRecentNotificationsForUser,
  markAllNotificationsRead,
} from "@/lib/data/notifications";

export const runtime = "nodejs";

export async function GET() {
  const authResult = await requireApiRoles(["admin", "client"]);
  if (authResult instanceof NextResponse) return authResult;
  const appUser = authResult;

  try {
    const [unreadCount, items] = await Promise.all([
      getUnreadNotificationCount(appUser.id),
      listRecentNotificationsForUser(appUser.id, 20),
    ]);

    return NextResponse.json({
      unreadCount,
      items: items.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        body: n.body,
        createdAt: n.createdAt.toISOString(),
        readAt: n.readAt ? n.readAt.toISOString() : null,
        projectId: n.projectId,
        projectType: n.project?.projectType ?? null,
        actorName: n.actorUser?.name ?? null,
        actorEmail: n.actorUser?.email ?? null,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch notifications." }, { status: 500 });
  }
}

export async function POST() {
  const authResult = await requireApiRoles(["admin", "client"]);
  if (authResult instanceof NextResponse) return authResult;
  const appUser = authResult;
  try {
    const { changedCount } = await markAllNotificationsRead(appUser.id);
    const unreadCount = await getUnreadNotificationCount(appUser.id);
    return NextResponse.json({ ok: true, changedCount, unreadCount });
  } catch {
    return NextResponse.json({ error: "Failed to mark notifications read." }, { status: 500 });
  }
}
