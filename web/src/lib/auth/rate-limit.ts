import "server-only";

import { headers } from "next/headers";
import { getPrisma } from "@/lib/prisma";

const WINDOW_MS = 15 * 60 * 1000;

const LIMITS = {
  "magic:email": { max: 5 },
  "magic:ip": { max: 40 },
  "studio:email": { max: 12 },
  "studio:ip": { max: 50 },
} as const;

export async function getRequestIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return h.get("x-real-ip")?.trim() || "unknown";
}

export async function assertAuthRateLimit(
  scope: keyof typeof LIMITS,
  identifier: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const config = LIMITS[scope];
  const key = `${scope}:${identifier.trim().toLowerCase()}`;
  const now = new Date();
  const windowMs = WINDOW_MS;
  const windowEnd = new Date(now.getTime() + windowMs);

  const row = await getPrisma().authRateLimit.findUnique({ where: { key } });

  if (!row || row.windowEnd < now) {
    await getPrisma().authRateLimit.upsert({
      where: { key },
      create: { key, count: 1, windowEnd },
      update: { count: 1, windowEnd },
    });
    return { ok: true };
  }

  if (row.count >= config.max) {
    const minutes = Math.max(1, Math.ceil((row.windowEnd.getTime() - now.getTime()) / 60_000));
    return {
      ok: false,
      message: `Too many attempts. Try again in about ${minutes} minute${minutes === 1 ? "" : "s"}.`,
    };
  }

  await getPrisma().authRateLimit.update({
    where: { key },
    data: { count: row.count + 1 },
  });
  return { ok: true };
}
