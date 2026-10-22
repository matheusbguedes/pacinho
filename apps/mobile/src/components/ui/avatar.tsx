import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Radius } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

type AvatarProps = {
  name: string;
  size?: AvatarSize;
  style?: StyleProp<ViewStyle>;
};

const SIZE_MAP: Record<
  AvatarSize,
  { box: number; type: "micro" | "label" | "titleSmall" | "title" | "heading" }
> = {
  xs: { box: 28, type: "micro" },
  sm: { box: 36, type: "label" },
  md: { box: 48, type: "titleSmall" },
  lg: { box: 72, type: "title" },
  xl: { box: 104, type: "heading" },
};

export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function Avatar({ name, size = "md", style }: AvatarProps) {
  const theme = useTheme();
  const { box, type } = SIZE_MAP[size];
  const initials = getInitials(name);

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={`Avatar de ${name}`}
      style={[
        styles.base,
        {
          width: box,
          height: box,
          borderRadius: Radius.full,
          backgroundColor: theme.primaryTint,
        },
        style,
      ]}
    >
      <ThemedText type={type} style={{ color: theme.primary }}>
        {initials}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
  },
});
