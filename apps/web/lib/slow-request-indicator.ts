// Render's free tier spins the API down after 15 minutes of inactivity and
// takes 30-60s to cold-start back up. Fast requests (the overwhelming
// majority) should never show any UI for this — only a request that's
// actually taking unusually long should surface a "waking up" message, so
// this tracks in-flight-too-long state via a simple counter + pub/sub
// rather than tying UI directly to every request's loading state.

type Listener = (active: boolean) => void;

const listeners = new Set<Listener>();
let slowCount = 0;

function notify(): void {
  const active = slowCount > 0;
  listeners.forEach((listener) => listener(active));
}

/**
 * Call when a request crosses the "this is taking a while" threshold.
 * Returns a function to call once the request actually finishes (success
 * or error) so the indicator clears correctly even if multiple slow
 * requests overlap.
 */
export function markSlowRequestStart(): () => void {
  slowCount += 1;
  notify();
  let ended = false;
  return () => {
    if (ended) return;
    ended = true;
    slowCount = Math.max(0, slowCount - 1);
    notify();
  };
}

export function subscribeSlowRequest(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
