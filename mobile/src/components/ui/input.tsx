import { useEffect, useState } from 'react';
import { Platform, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { BorderWidth, Motion, Radius, Sizing, Spacing, Typography } from '@/constants/theme';
import { useScheme, useTheme } from '@/hooks/use-theme';

type InputProps = TextInputProps & {
  label: string;
  error?: string;
};

export function Input({
  label,
  error,
  onFocus,
  onBlur,
  style,
  ...rest
}: InputProps) {
  const theme = useTheme();
  const scheme = useScheme();
  const [focused, setFocused] = useState(false);
  const emphasis = useSharedValue(error ? 1 : 0);

  useEffect(() => {
    emphasis.set(withTiming(focused || Boolean(error) ? 1 : 0, { duration: Motion.fast }));
  }, [emphasis, error, focused]);

  const frameStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(emphasis.value, [0, 1], [theme.border, theme.primary]),
  }));

  function handleFocus(event: Parameters<NonNullable<TextInputProps['onFocus']>>[0]) {
    setFocused(true);
    onFocus?.(event);
  }

  function handleBlur(event: Parameters<NonNullable<TextInputProps['onBlur']>>[0]) {
    setFocused(false);
    onBlur?.(event);
  }

  return (
    <View style={styles.field}>
      <ThemedText type="label">{label}</ThemedText>
      <Animated.View
        style={[
          styles.frame,
          rest.multiline ? styles.frameMultiline : null,
          { backgroundColor: theme.surface },
          frameStyle,
        ]}>
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={theme.textSecondary}
          selectionColor={theme.primary}
          cursorColor={theme.primary}
          style={[
            styles.input,
            rest.multiline ? styles.inputMultiline : null,
            { color: theme.text },
            style,
          ]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />
      </Animated.View>
      {error ? (
        <ThemedText
          type="caption"
          themeColor={scheme === 'dark' ? 'primarySoft' : 'primary'}
          accessibilityLiveRegion="polite">
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: Spacing[2],
  },
  frame: {
    height: Sizing.controlPrimary,
    borderWidth: BorderWidth.strong,
    borderRadius: Radius.md,
    justifyContent: 'center',
  },
  frameMultiline: {
    height: undefined,
    minHeight: 96,
    paddingVertical: Spacing[2],
  },
  input: {
    flex: 1,
    paddingHorizontal: Spacing[4],
    paddingVertical: 0,
    fontSize: Typography.body.fontSize,
    fontWeight: Typography.body.fontWeight,
    ...Platform.select({
      android: { textAlignVertical: 'center' as const },
      default: {},
    }),
  },
  inputMultiline: {
    paddingVertical: Spacing[2],
    ...Platform.select({
      android: { textAlignVertical: 'top' as const },
      default: {},
    }),
  },
});
