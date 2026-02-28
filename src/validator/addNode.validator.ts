import { z } from "zod";

export const nodeSchema = z.object({
  id: z.string(),

  type: z.string().min(1, {
    message: "Node type is required",
  }),

  prompt: z.string().min(1, { message: "Prompt is required" }),

  description: z.string().optional(),
});

export type NodeFormValues = z.infer<typeof nodeSchema>;
