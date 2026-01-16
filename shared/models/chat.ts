import { z } from "zod";

export const chatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  timestamp: z.string(),
  explanation_id: z.string().optional(),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;
