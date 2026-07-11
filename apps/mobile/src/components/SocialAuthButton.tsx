import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, type ImageSourcePropType } from 'react-native';

import { useTheme } from '../theme/ThemeContext';

export type SocialProvider = 'google' | 'apple' | 'facebook';

const ICONS: Record<SocialProvider, ImageSourcePropType> = {
  google: require('../assets/images/google icon.png'),
  apple: require('../assets/images/apple icon.png'),
  facebook: require('../assets/images/facebook.png'),
};

const LABELS: Record<SocialProvider, string> = {
  google: 'Continue with Google',
  apple: 'Continue with Apple',
  facebook: 'Continue with Facebook',
};

type Props = {
  provider: SocialProvider;
  onPress?: () => void;
  /** Icon edge length — defaults scale with button padding */
  iconSize?: number;
};

/** Pill social login button with brand icon before the label. */
export function SocialAuthButton({ provider, onPress, iconSize = 25 }: Props) {
  const theme = useTheme();

  return (
    <TouchableOpacity
      style={[styles.button, { borderColor: '#d0d0d0', backgroundColor: '#ffffff' }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.row}>
        <Image source={ICONS[provider]} style={{ width: iconSize, height: iconSize }} resizeMode="contain" />
        <Text style={[styles.label, { color: theme.text }]} numberOfLines={1}>
          {LABELS[provider]}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 50,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    maxWidth: '100%',
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    flexShrink: 1,
  },
});
