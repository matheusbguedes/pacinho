import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

function subscribe() {
  return () => {};
}

export function useColorScheme() {
  const colorScheme = useRNColorScheme();
  const hasHydrated = useSyncExternalStore(subscribe, () => true, () => false);

  if (!hasHydrated || colorScheme == null || colorScheme === 'unspecified') {
    return 'light' as const;
  }

  return colorScheme;
}
