import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { processEmailOutbox } from "@/lib/email/outbox";

export const runtime = "nodejs";

function verifyCronSecret(request: Request): boolean {
  const expected = process.env.CRON_SECRET?.trim();
  if (!expected) return false;

  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;

  const provided = auth.slice("Bearer ".length).trim();
  if (provided.length !== expected.length) return false;

  try {
    return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
  } catch {
    return false;
  }
}

function parseBatchSize(request: Request): number {
  const url = new URL(request.url);
  const raw = url.searchParams.get("batchSize");
  if (!raw) return 20;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return 20;
  return Math.min(n, 100);
}

async function handleCron(request: Request) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const batchSize = parseBatchSize(request);
  const result = await processEmailOutbox(batchSize);
  return NextResponse.json(result);
}

/** Manual / external triggers. Vercel Cron uses GET (see runbook §3.3). */
export async function POST(request: Request) {
  return handleCron(request);
}

export async function GET(request: Request) {
  return handleCron(request);
}
