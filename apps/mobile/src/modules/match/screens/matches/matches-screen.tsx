import { Image } from "expo-image";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import type { Conversation } from "@pacinho/shared";

import { ThemedText } from "@/components/themed-text";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { BorderWidth, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useMatchesScreen } from "@/modules/match/screens/matches/use-matches-screen";
import { formatObjective } from "@/modules/profile/utils/format-profile";
import { Objective } from "@/types/user";

const TAB_BAR_CLEARANCE = 88;

export function MatchesScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { matches, isLoading, isRefreshing, refresh } = useMatchesScreen();

  return (
    <View style={[styles.fill, { backgroundColor: theme.background }]}>
      <SafeAreaView edges={["top"]} style={styles.fill}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={refresh} />
          }
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + TAB_BAR_CLEARANCE },
          ]}
        >
          <View style={styles.heading}>
            <ThemedText type="title">Matches</ThemedText>
            <ThemedText type="bodySmall" themeColor="textSecondary">
              Match vira conversa.
            </ThemedText>
          </View>

          {isLoading ? (
            <View style={styles.loading}>
              <ActivityIndicator color={theme.primary} />
            </View>
          ) : matches.length === 0 ? (
            <View
              style={[
                styles.empty,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
              ]}
            >
              <ThemedText type="titleSmall">Nenhum match ainda</ThemedText>
              <ThemedText type="bodySmall" themeColor="textSecondary">
                Confirma um evento e curte quem vai. Se a pessoa curtir de
                volta, o nome fica aqui.
              </ThemedText>
              <Button
                label="Ver eventos"
                onPress={() => router.navigate(ROUTES.tabs.events)}
              />
            </View>
          ) : (
            <View style={styles.list}>
              {matches.map((match) => (
                <MatchRow key={match.id} match={match} />
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function MatchRow({ match }: { match: Conversation }) {
  const theme = useTheme();
  const person = match.peer;
  const photo = person.media[0]?.url;
  const objective =
    person.objective && person.objective in Objective
      ? formatObjective(person.objective as Objective)
      : null;
  const detail = [objective, person.pace, person.city].filter(Boolean).join(" · ");
  const preview = match.last_message?.body ?? "Começar a conversa";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Conversar com ${person.name}`}
      onPress={() => router.push(ROUTES.chat(person.id))}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: pressed ? theme.elevated : theme.surface,
          borderColor: theme.border,
        },
      ]}
    >
      {photo ? (
        <Image source={{ uri: photo }} style={styles.photo} contentFit="cover" />
      ) : (
        <Avatar name={person.name} size="md" />
      )}
      <View style={styles.rowCopy}>
        <ThemedText type="bodyMedium" numberOfLines={1}>
          {person.name}
        </ThemedText>
        {detail ? (
          <ThemedText type="caption" themeColor="textSecondary" numberOfLines={1}>
            {detail}
          </ThemedText>
        ) : null}
        <ThemedText
          type="caption"
          themeColor={match.last_message ? "text" : "textTertiary"}
          numberOfLines={1}
        >
          {preview}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[2],
    gap: Spacing[4],
  },
  heading: {
    gap: Spacing[1],
  },
  loading: {
    paddingVertical: Spacing[10],
    alignItems: "center",
  },
  empty: {
    gap: Spacing[3],
    padding: Spacing[5],
    borderRadius: Radius.card,
    borderWidth: BorderWidth.default,
  },
  list: {
    gap: Spacing[2],
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[3],
    padding: Spacing[3],
    borderRadius: Radius.card,
    borderWidth: BorderWidth.default,
  },
  rowCopy: {
    flex: 1,
    gap: 2,
  },
  photo: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
  },
});
