import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';

import { parseResetTokenFromUrl } from '../lib/tenant-link';

/** Opens learner reset-password when app is launched from email deep link */
export function PasswordResetLinkHandler() {
  const router = useRouter();

  useEffect(() => {
    const openReset = (url: string | null) => {
      if (!url) return;
      const token = parseResetTokenFromUrl(url);
      if (!token) return;
      router.push({ pathname: '/(learner)/reset-password', params: { token } });
    };

    void Linking.getInitialURL().then(openReset);
    const subscription = Linking.addEventListener('url', ({ url }) => openReset(url));
    return () => subscription.remove();
  }, [router]);

  return null;
}
