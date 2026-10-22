import { useEffect, useState } from "react";
import { Alert } from "react-native";

import type { Conversation, ConversationMessage } from "@pacinho/shared";

import { useAuth } from "@/modules/auth";
import {
  listMessagesService,
  openConversationService,
  sendMessageService,
} from "@/modules/chat/services";

type ThreadStatus = "loading" | "ready" | "error";

export function useChatThread(peerId: string | undefined) {
  const { user } = useAuth();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [status, setStatus] = useState<ThreadStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!peerId) {
      return;
    }

    let cancelled = false;

    async function load(id: string) {
      setStatus("loading");
      setError(null);

      try {
        const opened = await openConversationService(id);
        const history = await listMessagesService(opened.id);

        if (!cancelled) {
          setConversation(opened);
          setMessages(history);
          setStatus("ready");
        }
      } catch (loadError) {
        if (!cancelled) {
          setStatus("error");
          setError(
            typeof loadError === "string"
              ? loadError
              : "Não deu pra abrir a conversa.",
          );
        }
      }
    }

    void load(peerId);

    return () => {
      cancelled = true;
    };
  }, [peerId, reloadToken]);

  async function send() {
    const body = draft.trim();

    if (!conversation || !body || isSending) {
      return;
    }

    try {
      setIsSending(true);
      const message = await sendMessageService(conversation.id, body);
      setMessages((current) => [...current, message]);
      setDraft("");
    } catch (sendError) {
      Alert.alert(
        "Não deu pra enviar",
        typeof sendError === "string" ? sendError : "Tenta de novo em instantes.",
      );
    } finally {
      setIsSending(false);
    }
  }

  function retry() {
    setReloadToken((current) => current + 1);
  }

  return {
    userId: user?.id,
    conversation,
    messages,
    status: peerId ? status : "error",
    error: peerId ? error : "Conversa sem pessoa.",
    draft,
    setDraft,
    isSending,
    send,
    retry,
  };
}
