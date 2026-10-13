import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { BorderWidth, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { Objective } from "@/types/user";

const OPTIONS = [
  {
    value: Objective.DATING,
    label: "Encontros",
    hint: "Alguém pra correr e se ver de novo.",
  },
  {
    value: Objective.FRIENDSHIP,
    label: "Amizade",
    hint: "Turma pra treinar junto.",
  },
  {
    value: Objective.TRAINING,
    label: "Treino",
    hint: "Pace e distância parecidos.",
  },
] as const;

type ObjectivePickerProps = {
  value: Objective | null;
  onChange: (value: Objective) => void;
};

export function ObjectivePicker({ value, onChange }: ObjectivePickerProps) {
  const theme = useTheme();

  return (
    <View style={styles.list}>
      {OPTIONS.map((option) => {
        const selected = value === option.value;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[
              styles.option,
              {
                backgroundColor: selected ? theme.primaryTint : theme.elevated,
                borderColor: selected ? theme.primary : theme.border,
              },
            ]}
          >
            <ThemedText type="bodyMedium">{option.label}</ThemedText>
            <ThemedText type="caption" themeColor="textSecondary">
              {option.hint}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing[2],
  },
  option: {
    gap: 2,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderRadius: Radius.card,
    borderWidth: BorderWidth.strong,
  },
});
