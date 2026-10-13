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
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { DaySelector } from "@/modules/events/components/day-selector";
import { EventCard } from "@/modules/events/components/event-card";
import { EventSearchBar } from "@/modules/events/components/event-search-bar";
import { useEventsScreen } from "@/modules/events/screens/events/use-events-screen";

const TAB_BAR_CLEARANCE = 88;

export function EventsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const {
    events,
    search,
    setSearch,
    selectedDay,
    setSelectedDay,
    days,
    isLoading,
    isRefreshing,
    refresh,
  } = useEventsScreen();

  return (
    <View style={[styles.fill, { backgroundColor: theme.background }]}>
      <SafeAreaView edges={["top"]} style={styles.fill}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={refresh} />
          }
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + TAB_BAR_CLEARANCE },
          ]}
        >
          <View style={styles.heading}>
            <ThemedText type="title">Eventos</ThemedText>
            <ThemedText type="bodySmall" themeColor="textSecondary">
              Provas, treinões e afters. Quem vai estar lá.
            </ThemedText>
          </View>

          <View style={styles.searchRow}>
            <EventSearchBar value={search} onChangeText={setSearch} />
          </View>

          <View style={styles.sectionHeader}>
            <ThemedText type="titleSmall">Agenda</ThemedText>
          </View>

          <View style={styles.daySelectorBleed}>
            <DaySelector
              days={days}
              selectedKey={selectedDay}
              onSelect={setSelectedDay}
            />
          </View>

          {isLoading ? (
            <View style={styles.loading}>
              <ActivityIndicator color={theme.primary} />
            </View>
          ) : events.length === 0 ? (
            <View
              style={[
                styles.empty,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
              ]}
            >
              <ThemedText type="bodyMedium">Nada por aqui</ThemedText>
              <ThemedText type="bodySmall" themeColor="textSecondary">
                {search || selectedDay
                  ? "Tenta outro nome ou outro dia."
                  : "Quando rolar um paco, aparece nessa lista."}
              </ThemedText>
              {search || selectedDay ? (
                <Button
                  label="Limpar filtro"
                  variant="secondary"
                  onPress={() => {
                    setSearch("");
                    setSelectedDay(null);
                  }}
                />
              ) : null}
            </View>
          ) : (
            <View style={styles.list}>
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onPress={() => router.push(ROUTES.eventDetails(event.id))}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  content: {
    paddingTop: Spacing[2],
    gap: Spacing[4],
  },
  heading: {
    paddingHorizontal: Spacing[5],
    gap: Spacing[1],
  },
  searchRow: {
    paddingHorizontal: Spacing[5],
  },
  sectionHeader: {
    paddingHorizontal: Spacing[5],
  },
  daySelectorBleed: {
    marginHorizontal: 0,
  },
  list: {
    paddingHorizontal: Spacing[5],
    gap: Spacing[3],
  },
  loading: {
    paddingVertical: Spacing[10],
    alignItems: "center",
  },
  empty: {
    marginHorizontal: Spacing[5],
    gap: Spacing[2],
    padding: Spacing[5],
    borderRadius: 18,
    borderWidth: 1,
  },
});
