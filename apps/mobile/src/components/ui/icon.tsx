import { SymbolView, type AndroidSymbol, type SFSymbol } from "expo-symbols";

import { Sizing } from "@/constants/theme";

export type AppIconName = {
  ios: SFSymbol;
  android: AndroidSymbol;
};

type IconProps = {
  icon: AppIconName;
  size?: number;
  color: string;
};

export function Icon({
  icon,
  size = Sizing.iconStandard,
  color,
}: IconProps) {
  return (
    <SymbolView
      name={{ ios: icon.ios, android: icon.android, web: icon.android }}
      size={size}
      tintColor={color}
    />
  );
}
