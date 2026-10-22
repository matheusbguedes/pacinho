import { Platform, Pressable, StyleSheet, type PressableProps, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { BorderWidth, Motion, Radius, Sizing, Spacing } from '@/constants/theme';
import { useScheme, useTheme } from '@/hooks/use-theme';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary';

type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: ButtonVariant;
  style?: ViewStyle;
};

type ThemeColors = ReturnType<typeof useTheme>;

export function Button({
  label,
  variant = 'primary',
  disabled = false,
  onPressIn,
  onPressOut,
  style,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const scheme = useScheme();
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const isDisabled = Boolean(disabled);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const idle = colorsFor(variant, { disabled: isDisabled, pressed: false, scheme, theme });

  return (
    <Animated.View style={[styles.stretch, animatedStyle, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
        disabled={isDisabled}
        android_ripple={{ color: idle.ripple, foreground: true }}
        onPressIn={(event) => {
          if (!isDisabled && !reducedMotion && Platform.OS === 'ios') {
            scale.set(withTiming(Motion.pressScale, { duration: Motion.fast }));
          }
          onPressIn?.(event);
        }}
        onPressOut={(event) => {
          scale.set(withTiming(1, { duration: Motion.fast }));
          onPressOut?.(event);
        }}
        style={({ pressed }) => {
          const colors = colorsFor(variant, {
            disabled: isDisabled,
            pressed,
            scheme,
            theme,
          });

          return [styles.base, faceStyle(variant), colors.frame];
        }}
        {...rest}>
        {({ pressed }) => (
          <ThemedText
            type="bodyMedium"
            style={{
              color: colorsFor(variant, { disabled: isDisabled, pressed, scheme, theme }).color,
              fontWeight: '600',
            }}>
            {label}
          </ThemedText>
        )}
      </Pressable>
    </Animated.View>
  );
}

function colorsFor(
  variant: ButtonVariant,
  state: { disabled: boolean; pressed: boolean; scheme: 'light' | 'dark'; theme: ThemeColors },
) {
  const { disabled, pressed, scheme, theme } = state;

  if (variant === 'primary') {
    if (disabled) {
      return {
        frame: {
          backgroundColor: theme.border,
          borderColor: theme.border,
        },
        color: scheme === 'dark' ? theme.textSecondary : theme.textTertiary,
        ripple: theme.primaryPressed,
      };
    }

    const backgroundColor = pressed ? theme.primaryPressed : theme.primary;

    return {
      frame: { backgroundColor, borderColor: backgroundColor },
      color: theme.onPrimary,
      ripple: theme.primaryPressed,
    };
  }

  if (variant === 'secondary') {
    return {
      frame: {
        backgroundColor: pressed ? theme.surface : 'transparent',
        borderColor: theme.border,
      },
      color: disabled ? theme.textTertiary : theme.text,
      ripple: theme.primaryTint,
    };
  }

  return {
    frame: {
      backgroundColor: pressed ? theme.primaryTint : 'transparent',
      borderColor: 'transparent',
    },
    color: disabled ? theme.textTertiary : theme.text,
    ripple: theme.primaryTint,
  };
}

function faceStyle(variant: ButtonVariant): ViewStyle {
  if (variant === 'tertiary') {
    return {
      height: Sizing.controlStandard,
      paddingHorizontal: Spacing[3],
      borderRadius: Radius.md,
      borderWidth: 0,
    };
  }

  return {
    height: Sizing.controlPrimary,
    paddingHorizontal: Spacing[5],
    borderRadius: Radius.button,
    borderWidth: variant === 'secondary' ? BorderWidth.default : 0,
  };
}

const styles = StyleSheet.create({
  stretch: {
    alignSelf: 'stretch',
  },
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
