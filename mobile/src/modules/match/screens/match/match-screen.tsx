import { router, useLocalSearchParams } from "expo-router";
import { useRef } from "react";
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
import { ROUTES } from "@/constants/routes";
import {
  BorderWidth,
  Elevation,
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

  function openMatches() {
    dismissMatch();
    router.navigate(ROUTES.tabs.chats);
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
                {eventId ? "Quem vai" : "Pacinho"}
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
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Atualizar"
              onPress={refresh}
              style={[
                styles.headerButton,
                {
                  backgroundColor: theme.elevated,
                  borderColor: theme.border,
                },
              ]}
            >
              <Icon
                icon={{ ios: "arrow.clockwise", android: "refresh" }}
                size={Sizing.iconStandard}
                color={theme.text}
              />
            </Pressable>
            )}
          </View>

          <View style={styles.deckArea}>
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
                onSwipe={handleSwipe}
                disabled={isActing}
              />
            )}
          </View>

          {people.length > 0 && !isLoading && !needsObjective ? (
            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Passar"
                disabled={isActing}
                onPress={() => deckRef.current?.swipeLeft()}
                style={[
                  styles.actionButton,
                  styles.passButton,
                  Elevation[2],
                  {
                    backgroundColor: theme.elevated,
                    borderColor: theme.border,
                    opacity: isActing ? 0.6 : 1,
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
                  Elevation[2],
                  {
                    backgroundColor: theme.primary,
                    opacity: isActing ? 0.6 : 1,
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
      </SafeAreaView>

      <MatchCelebration
        visible={Boolean(matchedUser)}
        matchedUser={matchedUser}
        onSeeMatch={openMatches}
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
  headerButton: {
    width: Sizing.touchMin,
    height: Sizing.touchMin,
    borderRadius: Radius.full,
    borderWidth: BorderWidth.default,
    alignItems: "center",
    justifyContent: "center",
  },
  deckArea: {
    flex: 1,
    minHeight: 420,
    alignItems: "center",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing[6],
    paddingBottom: Spacing[2],
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
