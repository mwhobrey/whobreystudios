import { z } from "zod";

export const createMessageBodySchema = z.object({
  body: z.string().trim().min(1, "Message required").max(10_000, "Message too long"),
  parentId: z.string().cuid().optional(),
});

export type CreateMessageBody = z.infer<typeof createMessageBodySchema>;
