import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { NativeIconButton } from "@/components/ui/native-icon-button";
import { ROUTES } from "@/constants/routes";
import {
  BorderWidth,
  Radius,
  Sizing,
  Spacing,
} from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/modules/auth";
import { MatchCelebration } from "@/modules/match/components/match-celebration";
import { ObjectiveStep } from "@/modules/match/components/objective-step";
import {
  SwipeDeck,
  type SwipeDeckHandle,
} from "@/modules/match/components/swipe-deck";
import { useMatchScreen } from "@/modules/match/screens/match/use-match-screen";

const TAB_BAR_CLEARANCE = 88;

function firstParam(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw ? raw : undefined;
}

export function MatchScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const params = useLocalSearchParams<{
    eventId?: string | string[];
    eventName?: string | string[];
  }>();
  const eventId = firstParam(params.eventId);
  const eventName = firstParam(params.eventName);
  const deckRef = useRef<SwipeDeckHandle>(null);
  const [deckSize, setDeckSize] = useState({ width: 0, height: 0 });
  const needsObjective = Boolean(user && !user.objective);
  const {
    people,
    isLoading,
    isActing,
    matchedUser,
    handleSwipe,
    dismissMatch,
    refresh,
  } = useMatchScreen(needsObjective ? undefined : eventId);

  function clearEventFilter() {
    router.setParams({ eventId: "", eventName: "" });
  }

  function openEvents() {
    router.navigate(ROUTES.tabs.events);
  }

  function openChat(peerId: string) {
    dismissMatch();
    router.push(ROUTES.chat(peerId));
  }

  return (
    <View style={[styles.fill, { backgroundColor: theme.background }]}>
      <SafeAreaView edges={["top"]} style={styles.fill}>
        <View
          style={[
            styles.content,
            { paddingBottom: insets.bottom + TAB_BAR_CLEARANCE },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <ThemedText type="title">
                {eventId ? "Quem vai" : "Gente"}
              </ThemedText>
              {eventId && eventName ? (
                <ThemedText type="bodySmall" themeColor="textSecondary" numberOfLines={1}>
                  {eventName}
                </ThemedText>
              ) : null}
            </View>
            {eventId ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Ver todo mundo"
                onPress={clearEventFilter}
                hitSlop={8}
              >
                <ThemedText type="bodyMedium" style={{ color: theme.primary }}>
                  Todos
                </ThemedText>
              </Pressable>
            ) : (
              <NativeIconButton
                label="Atualizar"
                symbol="arrow.clockwise"
                icon={{ ios: "arrow.clockwise", android: "refresh" }}
                onPress={refresh}
              />
            )}
          </View>

          <View
            style={styles.deckArea}
            onLayout={(event) => {
              const { width, height } = event.nativeEvent.layout;
              setDeckSize((current) =>
                current.width === width && current.height === height
                  ? current
                  : { width, height },
              );
            }}
          >
            {needsObjective ? (
              <ObjectiveStep hasEvent={Boolean(eventId)} />
            ) : isLoading ? (
              <View style={styles.centered}>
                <ActivityIndicator color={theme.primary} />
              </View>
            ) : people.length === 0 ? (
              <View
                style={[
                  styles.empty,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                  },
                ]}
              >
                <ThemedText type="titleSmall">
                  {eventId ? "Ninguém novo nesse evento" : "Acabou por agora"}
                </ThemedText>
                <ThemedText type="bodySmall" themeColor="textSecondary">
                  {eventId
                    ? "Quem confirmar presença entra nessa fila."
                    : "Entra num evento pra ver outra turma."}
                </ThemedText>
                <Button label="Ver eventos" onPress={openEvents} />
              </View>
            ) : (
              <SwipeDeck
                ref={deckRef}
                people={people}
                width={deckSize.width}
                height={deckSize.height}
                onSwipe={handleSwipe}
                disabled={isActing}
              />
            )}

            {people.length > 0 && !isLoading && !needsObjective ? (
              <View style={styles.actions} pointerEvents="box-none">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Passar"
                  disabled={isActing}
                  onPress={() => deckRef.current?.swipeLeft()}
                  style={[
                    styles.actionButton,
                    styles.passButton,
                    {
                      backgroundColor: theme.elevated,
                      borderColor: theme.border,
                      opacity: isActing ? 0.6 : 1,
                      boxShadow: "0 8px 20px rgba(23, 23, 25, 0.16)",
                    },
                  ]}
                >
                  <Icon
                    icon={{ ios: "xmark", android: "close" }}
                    size={Sizing.iconFeature}
                    color={theme.primary}
                  />
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Curtir"
                  disabled={isActing}
                  onPress={() => deckRef.current?.swipeRight()}
                  style={[
                    styles.actionButton,
                    styles.likeButton,
                    {
                      backgroundColor: theme.primary,
                      opacity: isActing ? 0.6 : 1,
                      boxShadow: "0 8px 20px rgba(205, 24, 53, 0.28)",
                    },
                  ]}
                >
                  <Icon
                    icon={{ ios: "heart.fill", android: "favorite" }}
                    size={Sizing.iconFeature}
                    color={theme.onPrimary}
                  />
                </Pressable>
              </View>
            ) : null}
          </View>
        </View>
      </SafeAreaView>

      <MatchCelebration
        visible={Boolean(matchedUser)}
        matchedUser={matchedUser}
        onMessage={() => {
          if (matchedUser) {
            openChat(matchedUser.id);
          }
        }}
        onSeeMatch={() => {
          dismissMatch();
          router.navigate(ROUTES.tabs.chats);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[2],
    gap: Spacing[4],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing[3],
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  deckArea: {
    flex: 1,
    minHeight: 0,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    gap: Spacing[2],
    padding: Spacing[5],
    borderRadius: Radius.lg,
    borderWidth: BorderWidth.default,
  },
  actions: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: Spacing[3],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing[6],
  },
  actionButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.full,
  },
  passButton: {
    width: 64,
    height: 64,
    borderWidth: BorderWidth.default,
  },
  likeButton: {
    width: 72,
    height: 72,
  },
});
