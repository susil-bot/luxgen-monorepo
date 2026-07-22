import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme/ThemeContext';

export type AuthLoadingVariant = 'sign-in' | 'sign-up';

type Props = {
  visible: boolean;
  variant?: AuthLoadingVariant;
  title?: string;
  subtitle?: string;
};

const DEFAULTS: Record<AuthLoadingVariant, { title: string; subtitle: string }> = {
  'sign-up': {
    title: 'Your Sign up . . .',
    subtitle: 'Please wait for a second!',
  },
  'sign-in': {
    title: 'Your Sign in . . .',
    subtitle: 'Please wait for a second!',
  },
};

/** Centered loading popup shown while sign-in / sign-up requests are in flight. */
export function AuthLoadingModal({ visible, variant = 'sign-in', title, subtitle }: Props) {
  const theme = useTheme();
  const copy = DEFAULTS[variant];

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color={theme.btnPrimary} style={styles.spinner} />
          <Text style={[styles.title, { color: theme.text }]}>{title ?? copy.title}</Text>
          <Text style={[styles.subtitle, { color: theme.subtext }]}>{subtitle ?? copy.subtitle}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  card: {
    width: '100%',
    maxWidth: 280,
    backgroundColor: '#ffffff',
    borderRadius: 28,
    paddingVertical: 36,
    paddingHorizontal: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  spinner: {
    marginBottom: 20,
    transform: [{ scale: 1.15 }],
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
