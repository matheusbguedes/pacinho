import { Pressable, StyleSheet, View } from "react-native";

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
import type { EventSummary } from "@/modules/events/types";
import {
  accentForEvent,
  formatDistance,
  formatEventDate,
  formatEventTime,
} from "@/modules/events/utils/format-event";

type EventCardProps = {
  event: EventSummary;
  onPress: () => void;
};

export function EventCard({ event, onPress }: EventCardProps) {
  const theme = useTheme();
  const accent = accentForEvent(event.id);
  const distance = formatDistance(event.distance_km);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        Elevation[1],
        {
          backgroundColor: theme.elevated,
          borderColor: theme.border,
          opacity: pressed ? 0.94 : 1,
        },
      ]}
    >
      <View style={[styles.accent, { backgroundColor: accent }]} />

      <View style={styles.body}>
        <View style={styles.topRow}>
          <ThemedText type="bodyMedium" style={styles.title} numberOfLines={2}>
            {event.name}
          </ThemedText>
          <View
            style={[
              styles.badge,
              { backgroundColor: `${accent}22` },
            ]}
          >
            <Icon
              icon={{ ios: "figure.run", android: "directions_run" }}
              size={Sizing.iconSmall}
              color={accent}
            />
          </View>
        </View>

        <View style={styles.metaRow}>
          <Icon
            icon={{ ios: "calendar", android: "calendar_month" }}
            size={Sizing.iconInline}
            color={theme.textSecondary}
          />
          <ThemedText type="caption" themeColor="textSecondary">
            {formatEventDate(event.starts_at)}
          </ThemedText>
          <Icon
            icon={{ ios: "clock", android: "schedule" }}
            size={Sizing.iconInline}
            color={theme.textSecondary}
          />
          <ThemedText type="caption" themeColor="textSecondary">
            {formatEventTime(event.starts_at)}
          </ThemedText>
        </View>

        <View style={styles.metaRow}>
          <Icon
            icon={{ ios: "location", android: "location_on" }}
            size={Sizing.iconInline}
            color={theme.textSecondary}
          />
          <ThemedText
            type="caption"
            themeColor="textSecondary"
            numberOfLines={1}
            style={styles.location}
          >
            {event.location}
          </ThemedText>
        </View>

        <View style={styles.footer}>
          <ThemedText type="bodySmall">
            {event._count.attendances === 0
              ? "Ninguém confirmou ainda"
              : `${event._count.attendances} ${
                  event._count.attendances === 1 ? "pessoa vai" : "pessoas vão"
                }`}
          </ThemedText>
          {event.attending ? (
            <ThemedText type="label" style={{ color: theme.primary }}>
              Você vai
            </ThemedText>
          ) : distance ? (
            <ThemedText type="label" style={{ color: accent }}>
              {distance}
            </ThemedText>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    borderRadius: Radius.card,
    borderWidth: BorderWidth.default,
    overflow: "hidden",
  },
  accent: {
    width: 4,
  },
  body: {
    flex: 1,
    gap: Spacing[2],
    padding: Spacing[4],
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing[3],
  },
  title: {
    flex: 1,
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[1],
  },
  location: {
    flex: 1,
  },
  footer: {
    marginTop: Spacing[1],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing[2],
  },
});
