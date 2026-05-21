/**
 * WHO-22 — dev helper: enqueue a test row and drain one batch via the processor.
 * Requires DATABASE_URL; optional RESEND_API_KEY + EMAIL_FROM for a real send.
 */
import "dotenv/config";
import {
  countPendingOutbox,
  enqueueEmail,
  processEmailOutbox,
} from "../src/lib/email/outbox";
import { isEmailConfigured } from "../src/lib/email/resend";

const toEmail =
  process.env.VERIFY_EMAIL_TO?.trim() ||
  process.env.SEED_ADMIN_EMAIL?.trim() ||
  "admin@whobrey.local";

async function main() {
  const idempotencyKey = `verify-email-outbox:${Date.now()}`;
  const queued = await enqueueEmail({
    toEmail,
    templateKey: "dev_verify",
    payload: { source: "verify:email-outbox", at: new Date().toISOString() },
    idempotencyKey,
  });

  console.log("verify:email-outbox", {
    toEmail,
    queuedId: queued?.id ?? "(duplicate idempotency or enqueue failed)",
    resendConfigured: isEmailConfigured(),
    pendingBefore: await countPendingOutbox(),
  });

  const result = await processEmailOutbox(5);

  console.log("verify:email-outbox drain", result);
  console.log("verify:email-outbox pendingAfter", await countPendingOutbox());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
