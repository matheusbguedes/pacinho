import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

type ScreenProps = {
  title: string;
  subtitle?: string;
  children?: ReactNode;
};

export function Screen({ title, subtitle, children }: ScreenProps) {
  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
        <ThemedText type="title">{title}</ThemedText>
        {subtitle ? (
          <ThemedText type="body" themeColor="textSecondary">
            {subtitle}
          </ThemedText>
        ) : null}
        {children}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  safe: {
    flex: 1,
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[6],
    gap: Spacing[2],
  },
});
