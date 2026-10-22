import { Host } from "@expo/ui";
import { Button } from "@expo/ui/swift-ui";
import {
  accessibilityLabel,
  buttonBorderShape,
  buttonStyle,
  controlSize,
  labelStyle,
  tint,
} from "@expo/ui/swift-ui/modifiers";
import type { SFSymbol } from "expo-symbols";
import {
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from "expo-glass-effect";

import type { AppIconName } from "@/components/ui/icon";
import { useScheme, useTheme } from "@/hooks/use-theme";

type NativeIconButtonProps = {
  label: string;
  symbol: SFSymbol;
  icon: AppIconName;
  onPress: () => void;
  color?: string;
};

const liquid = isLiquidGlassAvailable() && isGlassEffectAPIAvailable();

export function NativeIconButton({
  label,
  symbol,
  onPress,
  color,
}: NativeIconButtonProps) {
  const scheme = useScheme();
  const theme = useTheme();
  const glyph = color ?? theme.text;

  return (
    <Host
      matchContents
      colorScheme={scheme}
      seedColor={liquid ? undefined : glyph}
      style={{ width: 44, height: 44 }}
    >
      <Button
        label={label}
        systemImage={symbol}
        onPress={onPress}
        modifiers={[
          buttonStyle(liquid ? "glass" : "bordered"),
          buttonBorderShape("circle"),
          controlSize("large"),
          labelStyle("iconOnly"),
          ...(liquid ? [] : [tint(glyph)]),
          accessibilityLabel(label),
        ]}
      />
    </Host>
  );
}
