import { Colors, type ThemeName } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useScheme(): ThemeName {
  return useColorScheme() === 'dark' ? 'dark' : 'light';
}

export function useTheme() {
  return Colors[useScheme()];
}
