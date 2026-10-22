import type {
  Conversation,
  ConversationMessage,
  CreateConversationBody,
  SendMessageBody,
} from "@pacinho/shared";

import { api } from "@/lib/api";

export async function listConversationsService() {
  const { data } = await api.get<Conversation[]>("/conversations");
  return data;
}

export async function openConversationService(peerId: string) {
  const body: CreateConversationBody = { peer_id: peerId };
  const { data } = await api.post<Conversation>("/conversations", body);
  return data;
}

export async function listMessagesService(conversationId: string) {
  const { data } = await api.get<ConversationMessage[]>(
    `/conversations/${conversationId}/messages`,
  );

  return data;
}

export async function sendMessageService(conversationId: string, body: string) {
  const payload: SendMessageBody = { body };
  const { data } = await api.post<ConversationMessage>(
    `/conversations/${conversationId}/messages`,
    payload,
  );

  return data;
}
