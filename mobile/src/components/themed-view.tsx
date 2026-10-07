import { View, type ViewProps } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type Surface = 'background' | 'surface' | 'elevated';

export type ThemedViewProps = ViewProps & {
  type?: Surface;
};

export function ThemedView({ style, type = 'background', ...rest }: ThemedViewProps) {
  const theme = useTheme();

  return <View style={[{ backgroundColor: theme[type] }, style]} {...rest} />;
}
