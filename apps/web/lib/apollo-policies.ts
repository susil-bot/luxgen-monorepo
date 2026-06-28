/** Stable reference data — avoid double-fetch on every navigation (UI-145). */
export const CACHE_FIRST = 'cache-first' as const;

/** Frequently changing lists (orders, notifications). */
export const CACHE_AND_NETWORK = 'cache-and-network' as const;
