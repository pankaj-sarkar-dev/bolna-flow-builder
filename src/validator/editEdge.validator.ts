import { z } from "zod";

export const edgeSchema = z.object({
  id: z.string(),

  label: z.string().min(1, { message: "Condition is required" }),

  source: z.string().min(1, { message: "Source is required" }),

  target: z.string().min(1, { message: "Target is required" }),
});

export type EdgeFormValues = z.infer<typeof edgeSchema>;
