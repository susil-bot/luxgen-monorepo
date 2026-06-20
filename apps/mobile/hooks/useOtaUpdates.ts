import { useEffect } from 'react';
import * as Updates from 'expo-updates';

/** Check for EAS Update on launch (skipped in dev / Expo Go). */
export function useOtaUpdates() {
  useEffect(() => {
    if (__DEV__ || !Updates.isEnabled) return;

    let cancelled = false;
    (async () => {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (cancelled || !update.isAvailable) return;
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      } catch {
        // OTA failures should not block the learner app
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);
}
