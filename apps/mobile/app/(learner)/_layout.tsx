import { Stack } from 'expo-router';

import { useTenant } from '../../hooks/useTenant';
import { ThemeProvider } from '../../src/theme/ThemeContext';

export default function LearnerLayout() {
  const { branding } = useTenant();

  return (
    <ThemeProvider branding={branding}>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
