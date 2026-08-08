/**
 * Saved searches (T-SRCH-04) — localStorage MVP, no backend persistence yet.
 * docs/TODO-search.md §5: name + query, reopenable, listed at /search/saved.
 * Persistence: browser localStorage only (single device) — a server-backed version
 * (with notification digests) is out of scope for this MVP slice.
 */
export interface SavedSearchEntry {
  id: string;
  name: string;
  query: string;
  tenant: string;
  createdAt: number;
}

const STORAGE_KEY = 'luxgen:saved-searches';

function readAll(): SavedSearchEntry[] {
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

function writeAll(entries: SavedSearchEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // localStorage unavailable — saved searches degrade to session-only, no throw
  }
}

export function getSavedSearches(): SavedSearchEntry[] {
  return readAll().sort((a, b) => b.createdAt - a.createdAt);
}

export function saveSearch(name: string, query: string, tenant: string): SavedSearchEntry[] {
  const trimmedName = name.trim();
  const trimmedQuery = query.trim();
  if (!trimmedName || !trimmedQuery) return readAll();
  const entry: SavedSearchEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: trimmedName,
    query: trimmedQuery,
    tenant,
    createdAt: Date.now(),
  };
  const next = [entry, ...readAll()];
  writeAll(next);
  return next;
}

export function deleteSavedSearch(id: string): SavedSearchEntry[] {
  const next = readAll().filter((e) => e.id !== id);
  writeAll(next);
  return next;
}
