const META_MARKER = '\n\n<!-- luxgen-product-meta\n';

export interface ParsedProductMeta {
  category: string;
  price: string;
  compareAtPrice: string;
  sku: string;
}

const DEFAULT_META: ParsedProductMeta = {
  category: '',
  price: '',
  compareAtPrice: '',
  sku: '',
};

/** Parse luxgen-product-meta JSON embedded in course.description (see ProductEdit fetcher). */
export function parseProductMetaFromDescription(description?: string | null): ParsedProductMeta {
  if (!description?.includes(META_MARKER)) return { ...DEFAULT_META };

  const start = description.indexOf(META_MARKER) + META_MARKER.length;
  const end = description.indexOf('\n-->', start);
  if (end < 0) return { ...DEFAULT_META };

  try {
    const parsed = JSON.parse(description.slice(start, end)) as Partial<ParsedProductMeta>;
    return { ...DEFAULT_META, ...parsed };
  } catch {
    return { ...DEFAULT_META };
  }
}

/** Convert admin price string (e.g. "49.00") to cents; returns null if invalid or empty. */
export function priceStringToCents(price: string | undefined): number | null {
  if (!price?.trim()) return null;
  const normalized = price.replace(/[^0-9.]/g, '');
  const value = Number.parseFloat(normalized);
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value * 100);
}

export function resolveProductPriceCents(description: string | undefined, fallbackCents: number): number {
  const meta = parseProductMetaFromDescription(description);
  return priceStringToCents(meta.price) ?? fallbackCents;
}

export interface CourseCommerceFields {
  priceCents?: number;
  compareAtPriceCents?: number;
  sku?: string;
  category?: string;
  currency?: string;
}

/** Extract commerce fields from luxgen-product-meta in course.description. */
export function commerceFromDescription(description?: string | null): CourseCommerceFields {
  const meta = parseProductMetaFromDescription(description);
  const priceCents = priceStringToCents(meta.price);
  const compareAtPriceCents = priceStringToCents(meta.compareAtPrice);
  const commerce: CourseCommerceFields = { currency: 'usd' };
  if (priceCents != null) commerce.priceCents = priceCents;
  if (compareAtPriceCents != null) commerce.compareAtPriceCents = compareAtPriceCents;
  if (meta.sku?.trim()) commerce.sku = meta.sku.trim();
  if (meta.category?.trim()) commerce.category = meta.category.trim();
  return commerce;
}

export function resolveCoursePriceCents(
  commerce: CourseCommerceFields | undefined | null,
  description: string | undefined,
  fallbackCents: number,
): number {
  if (commerce?.priceCents != null && commerce.priceCents >= 0) {
    return commerce.priceCents;
  }
  return resolveProductPriceCents(description, fallbackCents);
}
