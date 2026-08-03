import { useEffect, useState } from 'react';
import { subscribeSlowRequest } from '../../lib/slow-request-indicator';

/**
 * Shown only when a request has been in flight longer than the threshold
 * set in graphql/client.ts's slowRequestLink (currently ~2.5s) — covers
 * Render's free-tier cold start (30-60s) so a slow first request reads as
 * "the server is waking up" instead of looking frozen or broken.
 */
export function SlowRequestBanner() {
  const [active, setActive] = useState(false);

  useEffect(() => subscribeSlowRequest(setActive), []);

  if (!active) return null;

  return (
    <div
      role="status"
      className="fixed top-0 left-0 right-0 z-[200] bg-amber-500 px-4 py-2 text-center text-sm font-medium text-white shadow-md"
    >
      Waking up the server — this can take up to a minute on the first request. Hang tight…
    </div>
  );
}
