import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { SplashBookIcon } from '../components/SplashBookIcon';
import { useTheme } from '../theme/ThemeContext';
import { ONBOARDING_ROUTE } from '../../lib/guest-flow';

/** First screen before onboarding / sign-up — Codu book splash. */
export default function SplashScreen() {
  const theme = useTheme();
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace(ONBOARDING_ROUTE);
    }, 1800);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SplashBookIcon size={120} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
