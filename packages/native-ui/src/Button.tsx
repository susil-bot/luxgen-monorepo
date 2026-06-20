import React from 'react';
import { Pressable, StyleSheet, Text, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { lightTheme } from '@luxgen/design-tokens';

const theme = lightTheme;

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  variant?: 'primary' | 'secondary' | 'plain';
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({ title, variant = 'primary', loading = false, disabled, style, ...rest }: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'plain' && styles.plain,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      {...rest}
    >
      <Text
        style={[
          styles.label,
          variant === 'primary' && styles.labelPrimary,
          variant === 'secondary' && styles.labelSecondary,
          variant === 'plain' && styles.labelPlain,
        ]}
      >
        {loading ? 'Loading…' : title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.full,
    paddingHorizontal: 20,
    paddingVertical: 10,
    minHeight: 44,
  },
  primary: {
    backgroundColor: theme.colors.blue,
  },
  secondary: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  plain: {
    backgroundColor: 'transparent',
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.97 }],
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.semibold,
    letterSpacing: theme.typography.letterSpacing.normal,
  },
  labelPrimary: {
    color: '#ffffff',
  },
  labelSecondary: {
    color: theme.colors.blue,
  },
  labelPlain: {
    color: theme.colors.blue,
    fontWeight: theme.typography.fontWeight.medium,
  },
});
