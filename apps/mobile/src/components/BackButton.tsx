import React from 'react';
import { StyleSheet, TouchableOpacity, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useTheme } from '../theme/ThemeContext';

type Props = {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  /** Icon color — defaults to theme text */
  color?: string;
  size?: number;
};

/** Standard app back control (iOS-style chevron) — SVG so we don't need expo-font. */
export function BackButton({ onPress, style, color, size = 28 }: Props) {
  const theme = useTheme();
  const stroke = color ?? theme.text;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.hit, style]}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      accessibilityRole="button"
      accessibilityLabel="Go back"
    >
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M15 18l-6-6 6-6" stroke={stroke} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  hit: {
    alignSelf: 'flex-start',
    justifyContent: 'center',
    paddingVertical: 2,
    marginLeft: -4,
  },
});
