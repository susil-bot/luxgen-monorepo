import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useMutation } from '@apollo/client';

import { REGISTER_PUSH_TOKEN } from '../graphql/queries';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function resolveExpoPushToken(): Promise<string | null> {
  if (!Device.isDevice) {
    return null;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

  const tokenResult = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);

  return tokenResult.data;
}

/** Register device push token with API after login. */
export function usePushNotifications(userId: string | undefined) {
  const [registerPushToken] = useMutation(REGISTER_PUSH_TOKEN);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    (async () => {
      try {
        const token = await resolveExpoPushToken();
        if (!token || cancelled) return;
        await registerPushToken({ variables: { token } });
      } catch {
        // Push is optional — simulator / denied permission should not block app
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, registerPushToken]);
}
