import { client } from './client';

/** Avoid Apollo invariant 42 when clearing cache during in-flight queries. */
export async function safeClearApolloStore(): Promise<void> {
  try {
    client.stop();
    await client.clearStore();
  } catch {
    // Store reset while query was in flight — safe during logout / tab sync
  }
}

export async function safeResetApolloStore(): Promise<void> {
  try {
    await client.resetStore();
  } catch {
    try {
      client.stop();
      await client.clearStore();
    } catch {
      // ignore
    }
  }
}
