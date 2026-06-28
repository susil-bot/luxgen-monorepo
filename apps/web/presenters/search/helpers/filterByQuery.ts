/** Case-insensitive substring match for client-side search filtering. */
export function filterByQuery<T>(items: T[], query: string, toSearchableText: (item: T) => string): T[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];
  return items.filter((item) => toSearchableText(item).toLowerCase().includes(needle));
}
