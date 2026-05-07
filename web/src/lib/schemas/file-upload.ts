import { z } from "zod";

export const uploadKindSchema = z.enum(["draft", "final"]);

export const uploadRevisionSchema = z.coerce.number().int().min(1).max(999);
