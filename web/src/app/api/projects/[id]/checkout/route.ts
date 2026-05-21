import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiRoles } from "@/lib/auth";
import { CheckoutError, createProjectCheckoutSession } from "@/lib/payments/checkout";
import { isStripeConfigured } from "@/lib/payments/stripe-client";

export const runtime = "nodejs";

const bodySchema = z.object({
  type: z.enum(["deposit", "final"]),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Payments are not configured on this server." },
      { status: 503 },
    );
  }

  const authResult = await requireApiRoles(["client"]);
  if (authResult instanceof NextResponse) return authResult;
  const user = authResult;

  const { id: projectId } = await context.params;
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "type must be deposit or final." }, { status: 400 });
  }

  if (!user.email) {
    return NextResponse.json({ error: "Account email is required for checkout." }, { status: 400 });
  }

  try {
    const { url } = await createProjectCheckoutSession({
      projectId,
      clientUserId: user.id,
      clientEmail: user.email,
      type: parsed.data.type,
    });
    return NextResponse.json({ url });
  } catch (e) {
    if (e instanceof CheckoutError) {
      const status =
        e.code === "NOT_FOUND" ? 404 : e.code === "FORBIDDEN" ? 403 : e.code === "CONFIG" ? 503 : 400;
      return NextResponse.json({ error: e.message }, { status });
    }
    throw e;
  }
}
