import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ApolloPersistProvider } from '../components/ApolloPersistProvider';
import { MobileBootstrap } from '../components/MobileBootstrap';
import { PasswordResetLinkHandler } from '../components/PasswordResetLinkHandler';
import { AuthProvider } from '../hooks/useAuth';
import { TenantProvider } from '../hooks/useTenant';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ApolloPersistProvider>
        <TenantProvider>
          <AuthProvider>
            <MobileBootstrap>
              <PasswordResetLinkHandler />
              <StatusBar style="auto" />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(learner)" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="courses/[id]" options={{ presentation: 'card' }} />
              </Stack>
            </MobileBootstrap>
          </AuthProvider>
        </TenantProvider>
      </ApolloPersistProvider>
    </SafeAreaProvider>
  );
}
