import { Pressable, StyleSheet } from "react-native";
import type { SFSymbol } from "expo-symbols";

import { Icon, type AppIconName } from "@/components/ui/icon";
import { Sizing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type NativeIconButtonProps = {
  label: string;
  symbol: SFSymbol;
  icon: AppIconName;
  onPress: () => void;
  color?: string;
};

export function NativeIconButton({
  label,
  icon,
  onPress,
  color,
}: NativeIconButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={8}
      style={styles.button}
    >
      <Icon icon={icon} size={Sizing.iconLarge} color={color ?? theme.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: Sizing.touchMin,
    height: Sizing.touchMin,
    alignItems: "center",
    justifyContent: "center",
  },
});
