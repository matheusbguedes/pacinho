import { router } from "expo-router";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { BorderWidth, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useMatchesScreen } from "@/modules/match/screens/matches/use-matches-screen";
import type { MutualMatch } from "@/modules/match/types";
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
              Quem curtiu de volta.
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
                <MatchRow key={match.user.id} match={match} />
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function MatchRow({ match }: { match: MutualMatch }) {
  const theme = useTheme();
  const person = match.user;
  const objective =
    person.objective && person.objective in Objective
      ? formatObjective(person.objective as Objective)
      : null;
  const detail = [objective, person.pace, person.city].filter(Boolean).join(" · ");
  const when = formatMatchedAt(match.matched_at);

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}
    >
      <Avatar name={person.name} size="md" />
      <View style={styles.rowCopy}>
        <ThemedText type="bodyMedium" numberOfLines={1}>
          {person.name}
        </ThemedText>
        {detail ? (
          <ThemedText type="caption" themeColor="textSecondary" numberOfLines={1}>
            {detail}
          </ThemedText>
        ) : null}
        {when ? (
          <ThemedText type="caption" themeColor="textTertiary">
            Match em {when}
          </ThemedText>
        ) : null}
      </View>
    </View>
  );
}

function formatMatchedAt(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
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
});
