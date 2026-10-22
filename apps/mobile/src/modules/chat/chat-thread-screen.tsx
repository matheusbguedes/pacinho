import { router, useLocalSearchParams } from "expo-router";
import { useRef } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { ConversationMessage } from "@pacinho/shared";

import { ThemedText } from "@/components/themed-text";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { NativeIconButton } from "@/components/ui/native-icon-button";
import { Icon } from "@/components/ui/icon";
import { BorderWidth, Radius, Sizing, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { formatMessageTime } from "@/modules/chat/format-message-time";
import { useChatThread } from "@/modules/chat/use-chat-thread";

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function ChatThreadScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ peerId?: string | string[] }>();
  const peerId = firstParam(params.peerId);
  const listRef = useRef<FlatList<ConversationMessage>>(null);
  const {
    userId,
    conversation,
    messages,
    status,
    error,
    draft,
    setDraft,
    isSending,
    send,
    retry,
  } = useChatThread(peerId);

  const peer = conversation?.peer;
  const canSend = draft.trim().length > 0 && !isSending && status === "ready";

  return (
    <View style={[styles.fill, { backgroundColor: theme.background }]}>
      <SafeAreaView edges={["top", "bottom"]} style={styles.fill}>
        <KeyboardAvoidingView
          style={styles.fill}
          behavior={process.env.EXPO_OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.header}>
            <NativeIconButton
              label="Voltar"
              symbol="chevron.left"
              icon={{ ios: "chevron.left", android: "arrow_back" }}
              onPress={() => router.back()}
            />
            {peer ? <Avatar name={peer.name} size="sm" /> : null}
            <View style={styles.headerCopy}>
              <ThemedText type="bodyMedium" numberOfLines={1}>
                {peer?.name ?? "Conversa"}
              </ThemedText>
              {peer?.pace ? (
                <ThemedText type="caption" themeColor="textSecondary" numberOfLines={1}>
                  {peer.pace}
                </ThemedText>
              ) : null}
            </View>
          </View>

          {status === "loading" ? (
            <View style={styles.centered}>
              <ActivityIndicator color={theme.primary} />
            </View>
          ) : status === "error" ? (
            <View style={styles.centered}>
              <ThemedText type="titleSmall">Não abriu</ThemedText>
              <ThemedText type="bodySmall" themeColor="textSecondary">
                {error}
              </ThemedText>
              <Button label="Tentar de novo" onPress={retry} />
            </View>
          ) : messages.length === 0 ? (
            <View style={styles.centered}>
              <ThemedText type="body" themeColor="textSecondary" style={styles.empty}>
                {peer
                  ? `Diz oi para ${peer.name.split(" ")[0]}. O match já está feito.`
                  : "A conversa começa aqui."}
              </ThemedText>
            </View>
          ) : (
            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messages}
              keyboardShouldPersistTaps="handled"
              onContentSizeChange={() => {
                listRef.current?.scrollToEnd({ animated: false });
              }}
              renderItem={({ item }) => (
                <MessageBubble
                  message={item}
                  mine={item.sender_id === userId}
                />
              )}
            />
          )}

          <View
            style={[
              styles.composer,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Mensagem"
              placeholderTextColor={theme.textSecondary}
              accessibilityLabel="Mensagem"
              multiline
              maxLength={2000}
              editable={status === "ready"}
              style={[styles.field, { color: theme.text }]}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Enviar"
              disabled={!canSend}
              onPress={() => {
                void send();
              }}
              style={[
                styles.send,
                { backgroundColor: canSend ? theme.primary : theme.border },
              ]}
            >
              <Icon
                icon={{ ios: "paperplane.fill", android: "send" }}
                size={Sizing.iconStandard}
                color={theme.onPrimary}
              />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function MessageBubble({
  message,
  mine,
}: {
  message: ConversationMessage;
  mine: boolean;
}) {
  const theme = useTheme();
  const sentAt = formatMessageTime(message.created_at);

  return (
    <View style={[styles.bubbleRow, mine ? styles.mineRow : styles.theirRow]}>
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: mine ? theme.primary : theme.surface,
            borderColor: mine ? theme.primary : theme.border,
          },
        ]}
      >
        <ThemedText
          type="body"
          selectable
          style={{ color: mine ? theme.onPrimary : theme.text }}
        >
          {message.body}
        </ThemedText>
        {sentAt ? (
          <ThemedText
            type="caption"
            selectable
            style={[
              styles.time,
              { color: mine ? "rgba(255, 253, 248, 0.78)" : theme.textSecondary },
            ]}
          >
            {sentAt}
          </ThemedText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[3],
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[3],
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing[3],
    paddingHorizontal: Spacing[6],
  },
  messages: {
    flexGrow: 1,
    justifyContent: "flex-end",
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[3],
    gap: Spacing[2],
  },
  empty: {
    textAlign: "center",
    paddingVertical: Spacing[8],
  },
  bubbleRow: {
    flexDirection: "row",
  },
  mineRow: {
    justifyContent: "flex-end",
  },
  theirRow: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "78%",
    borderWidth: BorderWidth.default,
    borderRadius: Radius.md,
    borderCurve: "continuous",
    paddingLeft: Spacing[4],
    paddingTop: Spacing[3],
    paddingRight: Spacing[5],
    paddingBottom: Spacing[2],
  },
  time: {
    marginTop: Spacing[1],
    textAlign: "right",
    fontVariant: ["tabular-nums"],
  },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: Spacing[2],
    marginHorizontal: Spacing[4],
    marginBottom: Spacing[2],
    paddingLeft: Spacing[4],
    paddingRight: Spacing[2],
    paddingVertical: Spacing[2],
    borderWidth: BorderWidth.strong,
    borderRadius: Radius.lg,
    borderCurve: "continuous",
  },
  field: {
    flex: 1,
    maxHeight: 120,
    minHeight: Sizing.touchMin,
    fontSize: 16,
    lineHeight: 22,
    paddingVertical: Spacing[2],
  },
  send: {
    width: Sizing.touchMin,
    height: Sizing.touchMin,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
});
