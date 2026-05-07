import { z } from "zod";

export const quoteLineInputSchema = z.object({
  description: z.string().trim().min(1, "Description required"),
  quantity: z.coerce.number().int().min(1).max(9999),
  /** Whole cents (from dollars × 100 on the client). */
  unitAmountCents: z.coerce.number().int().min(0).max(100_000_000),
});

export const quoteLinesPayloadSchema = z
  .array(quoteLineInputSchema)
  .min(1, "Add at least one line item")
  .max(50);

/** Draft saves may clear all lines; send still requires at least one valid line. */
export const quoteLinesDraftSchema = z.array(quoteLineInputSchema).max(50);

export type QuoteLineInput = z.infer<typeof quoteLineInputSchema>;
