/**
 * Pinned searches (T-SRCH-11) — localStorage MVP, capped at 5 per docs/TODO-search.md §8.
 */
export interface PinnedSearchEntry {
  query: string;
  ts: number;
}

const STORAGE_KEY = 'luxgen:pinned-searches';
const MAX_PINNED = 5;

function readAll(): PinnedSearchEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(entries: PinnedSearchEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // localStorage unavailable — pins degrade to session-only, no throw
  }
}

export function getPinnedSearches(): PinnedSearchEntry[] {
  return readAll();
}

export function isPinned(query: string): boolean {
  const q = query.trim().toLowerCase();
  return readAll().some((e) => e.query.toLowerCase() === q);
}

/** No-op (returns current list unchanged) once MAX_PINNED is reached — surface this in the UI via isPinnedLimitReached(). */
export function pinSearch(query: string): PinnedSearchEntry[] {
  const trimmed = query.trim();
  if (!trimmed) return readAll();
  const current = readAll();
  if (current.some((e) => e.query.toLowerCase() === trimmed.toLowerCase())) return current;
  if (current.length >= MAX_PINNED) return current;
  const next = [...current, { query: trimmed, ts: Date.now() }];
  writeAll(next);
  return next;
}

export function unpinSearch(query: string): PinnedSearchEntry[] {
  const next = readAll().filter((e) => e.query.toLowerCase() !== query.trim().toLowerCase());
  writeAll(next);
  return next;
}

export function isPinnedLimitReached(): boolean {
  return readAll().length >= MAX_PINNED;
}
