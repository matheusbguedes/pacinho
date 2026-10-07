import { Text, type TextProps } from 'react-native';

import { Typography, type TextRole, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: TextRole;
  themeColor?: ThemeColor;
};

export function ThemedText({
  style,
  type = 'body',
  themeColor = 'text',
  ...rest
}: ThemedTextProps) {
  const theme = useTheme();

  return <Text style={[{ color: theme[themeColor] }, Typography[type], style]} {...rest} />;
}
