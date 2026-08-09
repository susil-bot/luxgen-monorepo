/**
 * Recent searches (T-SRCH-06) — localStorage MVP, no backend persistence yet.
 * docs/TODO-search.md §7: "Auto-tracking: last 20 searches... query, result count, timestamp".
 */
export interface RecentSearchEntry {
  query: string;
  resultCount: number;
  ts: number;
}

const STORAGE_KEY = 'luxgen:recent-searches';
const MAX_ENTRIES = 20;

function readAll(): RecentSearchEntry[] {
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

function writeAll(entries: RecentSearchEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // localStorage unavailable (private mode, quota) — recent searches degrade to empty, no throw
  }
}

export function getRecentSearches(): RecentSearchEntry[] {
  return readAll();
}

/** Smart dedup: same query as the most recent entry just bumps its timestamp/count instead of duplicating. */
export function recordRecentSearch(query: string, resultCount: number): RecentSearchEntry[] {
  const trimmed = query.trim();
  if (!trimmed) return readAll();
  const existing = readAll().filter((e) => e.query.toLowerCase() !== trimmed.toLowerCase());
  const next = [{ query: trimmed, resultCount, ts: Date.now() }, ...existing].slice(0, MAX_ENTRIES);
  writeAll(next);
  return next;
}

export function removeRecentSearch(query: string): RecentSearchEntry[] {
  const next = readAll().filter((e) => e.query !== query);
  writeAll(next);
  return next;
}

export function clearRecentSearches(): void {
  writeAll([]);
}
