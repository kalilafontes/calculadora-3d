import { z } from "zod";
import { calculationSchema } from "../../domain/calculation/calculation.schema";

export const calculationDraftSchema = z.object({
  schemaVersion: z.literal(1),
  savedAt: z.iso.datetime(),
  input: calculationSchema,
});
