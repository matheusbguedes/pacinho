import { DarkTheme, DefaultTheme, type Theme } from 'expo-router';
import type { TextStyle, ViewStyle } from 'react-native';

export const Palette = {
  primary: '#CD1835',
  primaryPressed: '#A9122B',
  primarySoft: '#E86A7D',
  primaryTint: '#F6D9DE',
  ink: '#171719',
  carbon: '#232326',
  graphite: '#2D2D31',
  darkBorder: '#3A3A3F',
  warmWhite: '#FFFDF8',
  cloud: '#F5F3EF',
  white: '#FFFFFF',
  lightBorder: '#E6E3DE',
  textPrimary: '#171719',
  textSecondary: '#6D6D73',
  textTertiary: '#98989E',
  textOnDark: '#F7F5F0',
  textOnPrimary: '#FFFFFF',
} as const;

export const Colors = {
  light: {
    background: Palette.warmWhite,
    surface: Palette.cloud,
    elevated: Palette.white,
    text: Palette.textPrimary,
    textSecondary: Palette.textSecondary,
    textTertiary: Palette.textTertiary,
    border: Palette.lightBorder,
    primary: Palette.primary,
    primaryPressed: Palette.primaryPressed,
    primarySoft: Palette.primarySoft,
    primaryTint: Palette.primaryTint,
    onPrimary: Palette.textOnPrimary,
    tabBar: Palette.warmWhite,
    icon: Palette.textTertiary,
  },
  dark: {
    background: Palette.ink,
    surface: Palette.carbon,
    elevated: Palette.graphite,
    text: Palette.textOnDark,
    textSecondary: Palette.textTertiary,
    textTertiary: Palette.textSecondary,
    border: Palette.darkBorder,
    primary: Palette.primary,
    primaryPressed: Palette.primaryPressed,
    primarySoft: Palette.primarySoft,
    primaryTint: Palette.primaryTint,
    onPrimary: Palette.textOnPrimary,
    tabBar: Palette.ink,
    icon: Palette.textTertiary,
  },
} as const;

export type ThemeName = keyof typeof Colors;
export type ThemeColor = keyof typeof Colors.light;

export const Spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
} as const;

export const Radius = {
  xs: 8,
  sm: 10,
  md: 12,
  button: 14,
  card: 18,
  lg: 24,
  sheet: 28,
  full: 999,
} as const;

export const BorderWidth = {
  default: 1,
  strong: 2,
} as const;

export const Opacity = {
  disabled: 0.4,
  secondary: 0.6,
  overlay: 0.72,
  overlayStrong: 0.88,
} as const;

export const Sizing = {
  touchMin: 44,
  touchPreferred: 48,
  controlCompact: 36,
  controlStandard: 44,
  controlPrimary: 48,
  controlLarge: 52,
  iconInline: 16,
  iconSmall: 18,
  iconStandard: 20,
  iconLarge: 24,
  iconFeature: 28,
} as const;

export const Motion = {
  instant: 80,
  fast: 120,
  standard: 200,
  medium: 280,
  slow: 400,
  pressScale: 0.98,
} as const;

const shadow = (
  height: number,
  radius: number,
  opacity: number,
  elevation: number,
): ViewStyle => ({
  shadowColor: '#000000',
  shadowOffset: { width: 0, height },
  shadowOpacity: opacity,
  shadowRadius: radius,
  elevation,
});

export const Elevation = {
  0: {} satisfies ViewStyle,
  1: shadow(1, 3, 0.08, 1),
  2: shadow(4, 16, 0.12, 4),
  3: shadow(10, 30, 0.18, 8),
} as const;

export const Typography = {
  micro: { fontSize: 11, lineHeight: 13, fontWeight: '500' },
  caption: { fontSize: 12, lineHeight: 15, fontWeight: '500' },
  bodySmall: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  body: { fontSize: 16, lineHeight: 23, fontWeight: '400' },
  bodyMedium: { fontSize: 16, lineHeight: 23, fontWeight: '500' },
  label: { fontSize: 14, lineHeight: 18, fontWeight: '600' },
  titleSmall: { fontSize: 20, lineHeight: 24, fontWeight: '600' },
  title: { fontSize: 24, lineHeight: 28, fontWeight: '700' },
  heading: { fontSize: 30, lineHeight: 33, fontWeight: '700' },
  display: { fontSize: 38, lineHeight: 40, fontWeight: '700' },
} as const satisfies Record<string, TextStyle>;

export type TextRole = keyof typeof Typography;

export function navigationTheme(scheme: ThemeName): Theme {
  const colors = Colors[scheme];
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;

  return {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.primary,
    },
  };
}
