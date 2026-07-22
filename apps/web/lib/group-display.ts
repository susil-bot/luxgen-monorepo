/** Client-side filter for group list pages (name + description). */
export function filterGroupsBySearch<T extends { name: string; description?: string | null }>(
  groups: T[],
  query: string,
): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return groups;
  return groups.filter((g) => g.name.toLowerCase().includes(q) || (g.description ?? '').toLowerCase().includes(q));
}
