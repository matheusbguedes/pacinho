import { z } from "zod";

import { matchPersonSchema } from "./match.js";

export const conversationMessageSchema = z.object({
  id: z.uuid(),
  sender_id: z.uuid(),
  body: z.string(),
  created_at: z.string(),
});

export const conversationSchema = z.object({
  id: z.uuid(),
  matched_at: z.string(),
  peer: matchPersonSchema,
  last_message: conversationMessageSchema.nullable(),
});

export const createConversationBodySchema = z.object({
  peer_id: z.uuid(),
});

export const sendMessageBodySchema = z.object({
  body: z.string().min(1).max(2000),
});

export type ConversationMessage = z.infer<typeof conversationMessageSchema>;
export type Conversation = z.infer<typeof conversationSchema>;
export type CreateConversationBody = z.infer<typeof createConversationBodySchema>;
export type SendMessageBody = z.infer<typeof sendMessageBodySchema>;
