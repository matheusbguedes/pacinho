import { TextInput, StyleSheet, View } from "react-native";

import { Icon } from "@/components/ui/icon";
import { BorderWidth, Radius, Sizing, Spacing, Typography } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type EventSearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
};

export function EventSearchBar({
  value,
  onChangeText,
  placeholder = "Buscar evento",
}: EventSearchBarProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: theme.elevated,
          borderColor: theme.border,
        },
      ]}
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textTertiary}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        style={[styles.input, { color: theme.text }]}
      />
      <Icon
        icon={{ ios: "magnifyingglass", android: "search" }}
        size={Sizing.iconStandard}
        color={theme.textSecondary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: Sizing.controlPrimary,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[2],
    paddingHorizontal: Spacing[4],
    borderRadius: Radius.full,
    borderWidth: BorderWidth.default,
  },
  input: {
    flex: 1,
    fontSize: Typography.body.fontSize,
    fontWeight: Typography.body.fontWeight,
    paddingVertical: Spacing[2],
  },
});
