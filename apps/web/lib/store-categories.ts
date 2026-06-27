/** Storefront product categories — GPT-selling taxonomy (not SEO slugs). */
export const STORE_CATEGORIES = [
  { id: 'all', label: 'All', emoji: '✦' },
  { id: 'men', label: 'Men', emoji: '⬡' },
  { id: 'women', label: 'Women', emoji: '◇' },
  { id: 'interior', label: 'Interior', emoji: '◈' },
  { id: 'dresses', label: 'Dresses', emoji: '◆' },
  { id: 'digital', label: 'Digital', emoji: '◎' },
] as const;

export type StoreCategoryId = (typeof STORE_CATEGORIES)[number]['id'];

export function categoryLabel(id: string): string {
  return STORE_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}
