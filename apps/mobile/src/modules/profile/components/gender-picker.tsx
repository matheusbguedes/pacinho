import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { BorderWidth, Radius, Sizing, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { formatGender } from "@/modules/profile/utils/format-profile";
import { Gender } from "@/types/user";

const OPTIONS = [
  Gender.WOMAN,
  Gender.MAN,
  Gender.NON_BINARY,
  Gender.OTHER,
  Gender.PREFER_NOT_TO_SAY,
] as const;

type GenderPickerProps = {
  value: Gender | null;
  onChange: (value: Gender) => void;
};

export function GenderPicker({ value, onChange }: GenderPickerProps) {
  const theme = useTheme();

  return (
    <View style={styles.wrap}>
      {OPTIONS.map((option) => {
        const selected = value === option;
        const label = formatGender(option) ?? option;

        return (
          <Pressable
            key={option}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(option)}
            style={[
              styles.chip,
              {
                backgroundColor: selected ? theme.primaryTint : theme.elevated,
                borderColor: selected ? theme.primary : theme.border,
              },
            ]}
          >
            <ThemedText type="bodyMedium">{label}</ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing[2],
  },
  chip: {
    minHeight: Sizing.touchMin,
    justifyContent: "center",
    paddingHorizontal: Spacing[4],
    borderRadius: Radius.full,
    borderWidth: BorderWidth.strong,
  },
});
