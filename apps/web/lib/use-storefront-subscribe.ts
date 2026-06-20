import { useCallback, useState } from 'react';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/router';

import { SUBSCRIBE_TO_BUNDLE } from '../graphql/queries/storefront';
import { buildLoginRedirect } from './auth-routes';
import { getStoredUser, isStoredSessionExpired } from './session';

export function useStorefrontSubscribe(returnPath: string) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [subscribeToBundle, { loading }] = useMutation(SUBSCRIBE_TO_BUNDLE);

  const subscribe = useCallback(
    async (bundleId: string) => {
      setError(null);

      if (isStoredSessionExpired() || !getStoredUser()?.id) {
        void router.push(buildLoginRedirect(returnPath));
        return;
      }

      try {
        await subscribeToBundle({ variables: { bundleId } });
        setSuccess(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Subscription failed');
      }
    },
    [returnPath, router, subscribeToBundle],
  );

  return { subscribe, loading, error, success };
}
