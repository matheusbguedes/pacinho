import { useRef } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { Icon } from "@/components/ui/icon";
import {
  BorderWidth,
  Elevation,
  Radius,
  Sizing,
  Spacing,
} from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { MatchCelebration } from "@/modules/match/components/match-celebration";
import {
  SwipeDeck,
  type SwipeDeckHandle,
} from "@/modules/match/components/swipe-deck";
import { useMatchScreen } from "@/modules/match/screens/match/use-match-screen";

const TAB_BAR_CLEARANCE = 88;

export function MatchScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const deckRef = useRef<SwipeDeckHandle>(null);
  const {
    people,
    isLoading,
    isActing,
    matchedUser,
    handleSwipe,
    dismissMatch,
    refresh,
  } = useMatchScreen();

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
            <ThemedText type="title">Pacinho</ThemedText>
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
          </View>

          <View style={styles.deckArea}>
            {isLoading ? (
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
                <ThemedText type="titleSmall">Acabou por agora</ThemedText>
                <ThemedText type="bodySmall" themeColor="textSecondary">
                  Não tem mais gente nova pra ver. Volta depois ou entra num
                  evento pra achar outra turma.
                </ThemedText>
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

          {people.length > 0 && !isLoading ? (
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
        onContinue={dismissMatch}
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
