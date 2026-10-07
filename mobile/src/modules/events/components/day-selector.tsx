import { Pressable, ScrollView, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export type DayOption = {
  key: string;
  dayNumber: string;
  weekday: string;
  isToday: boolean;
};

type DaySelectorProps = {
  days: DayOption[];
  selectedKey: string | null;
  onSelect: (key: string | null) => void;
};

export function DaySelector({ days, selectedKey, onSelect }: DaySelectorProps) {
  const theme = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: selectedKey === null }}
        onPress={() => onSelect(null)}
        style={[
          styles.chip,
          {
            backgroundColor:
              selectedKey === null ? theme.text : theme.elevated,
          },
        ]}
      >
        <ThemedText
          type="caption"
          style={{
            color: selectedKey === null ? theme.background : theme.textSecondary,
          }}
        >
          Dia
        </ThemedText>
        <ThemedText
          type="label"
          style={{
            color: selectedKey === null ? theme.background : theme.text,
          }}
        >
          Todos
        </ThemedText>
      </Pressable>

      {days.map((day) => {
        const selected = selectedKey === day.key;

        return (
          <Pressable
            key={day.key}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onSelect(selected ? null : day.key)}
            style={[
              styles.chip,
              {
                backgroundColor: selected ? theme.text : theme.elevated,
              },
            ]}
          >
            <ThemedText
              type="caption"
              style={{
                color: selected ? theme.background : theme.textSecondary,
              }}
            >
              {day.weekday}
            </ThemedText>
            <ThemedText
              type="label"
              style={{ color: selected ? theme.background : theme.text }}
            >
              {day.dayNumber}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: Spacing[2],
    paddingHorizontal: Spacing[5],
  },
  chip: {
    minWidth: 56,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[3],
    borderRadius: Radius.card,
  },
});
