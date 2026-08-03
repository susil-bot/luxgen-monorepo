/** Product edit data layer — parse/serialize course description, map GraphQL course → form state. */

const SEO_MARKER = '\n\n<!-- luxgen-seo\n';
const META_MARKER = '\n\n<!-- luxgen-product-meta\n';

export type ProductStatus = 'DRAFT' | 'PUBLISHED' | 'COMPLETED' | 'CANCELLED' | 'ARCHIVED';

export interface ProductSeo {
  metaTitle: string;
  metaDescription: string;
  urlHandle: string;
}

export interface ProductEditMeta {
  category: string;
  productType: string;
  vendor: string;
  tags: string[];
  collectionIds: string[];
  price: string;
  compareAtPrice: string;
  chargeTax: boolean;
  sku: string;
  barcode: string;
  trackInventory: boolean;
  maxEnrollments: number | null;
  sellWhenOutOfStock: boolean;
  themeTemplate: string;
}

export interface ProductEditFormState {
  title: string;
  bodyHtml: string;
  seo: ProductSeo;
  meta: ProductEditMeta;
  status: ProductStatus;
  enrollmentCount: number;
}

export interface CourseProductSource {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  updatedAt?: string;
  createdAt?: string;
  instructor?: { firstName?: string; lastName?: string } | null;
  students?: { id: string }[] | null;
  commerce?: {
    priceCents?: number | null;
    compareAtPriceCents?: number | null;
    sku?: string | null;
    category?: string | null;
    currency?: string | null;
  } | null;
}

const DEFAULT_SEO: ProductSeo = {
  metaTitle: '',
  metaDescription: '',
  urlHandle: '',
};

export const DEFAULT_PRODUCT_EDIT_META: ProductEditMeta = {
  category: '',
  productType: 'Course',
  vendor: '',
  tags: [],
  collectionIds: [],
  price: '',
  compareAtPrice: '',
  chargeTax: false,
  sku: '',
  barcode: '',
  trackInventory: true,
  maxEnrollments: null,
  sellWhenOutOfStock: false,
  themeTemplate: 'default',
};

export function centsToPriceString(cents: number | null | undefined): string {
  if (cents == null || !Number.isFinite(cents)) return '';
  return (cents / 100).toFixed(2);
}

export function priceStringToCents(price: string | undefined): number | null {
  if (!price?.trim()) return null;
  const normalized = price.replace(/[^0-9.]/g, '');
  const value = Number.parseFloat(normalized);
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value * 100);
}

export function commerceInputFromMeta(meta: ProductEditMeta): {
  priceCents?: number;
  compareAtPriceCents?: number;
  sku?: string;
  category?: string;
  currency: string;
} {
  const commerce: {
    priceCents?: number;
    compareAtPriceCents?: number;
    sku?: string;
    category?: string;
    currency: string;
  } = { currency: 'usd' };
  const priceCents = priceStringToCents(meta.price);
  const compareAtPriceCents = priceStringToCents(meta.compareAtPrice);
  if (priceCents != null) commerce.priceCents = priceCents;
  if (compareAtPriceCents != null) commerce.compareAtPriceCents = compareAtPriceCents;
  if (meta.sku?.trim()) commerce.sku = meta.sku.trim();
  if (meta.category?.trim()) commerce.category = meta.category.trim();
  return commerce;
}

export function statusBadgeClass(status: ProductStatus): string {
  switch (status) {
    case 'PUBLISHED':
      return 'badge-green';
    case 'DRAFT':
      return 'badge-orange';
    case 'COMPLETED':
      return 'badge-blue';
    case 'CANCELLED':
    case 'ARCHIVED':
      return 'badge-gray';
    default:
      return 'badge-gray';
  }
}

export function statusDisplayLabel(status: ProductStatus): string {
  if (status === 'PUBLISHED') return 'Active';
  if (status === 'DRAFT') return 'Draft';
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function courseVendor(course: CourseProductSource): string {
  const vendor = course.instructor
    ? `${course.instructor.firstName ?? ''} ${course.instructor.lastName ?? ''}`.trim()
    : '';
  return vendor || '—';
}

function defaultSku(courseId: string): string {
  return `CRS-${courseId.slice(-6).toUpperCase()}`;
}

export function parseProductDescription(raw: string | null | undefined): {
  bodyHtml: string;
  seo: ProductSeo;
} {
  const text = raw ?? '';
  const idx = text.indexOf(SEO_MARKER);
  if (idx === -1) {
    return { bodyHtml: text, seo: { ...DEFAULT_SEO } };
  }

  const bodyHtml = text.slice(0, idx);
  const jsonPart = text
    .slice(idx + SEO_MARKER.length)
    .replace(/\n-->$/, '')
    .trim();

  try {
    return { bodyHtml, seo: { ...DEFAULT_SEO, ...JSON.parse(jsonPart) } as ProductSeo };
  } catch {
    return { bodyHtml: text, seo: { ...DEFAULT_SEO } };
  }
}

export function serializeProductDescription(bodyHtml: string, seo: ProductSeo): string {
  const trimmed = bodyHtml.trim();
  const hasSeo = seo.metaTitle || seo.metaDescription || seo.urlHandle;
  if (!hasSeo) return trimmed;
  return `${trimmed}${SEO_MARKER}${JSON.stringify(seo)}\n-->`;
}

export function parseProductMeta(raw: string | null | undefined): {
  contentWithoutMeta: string;
  meta: ProductEditMeta;
} {
  const text = raw ?? '';
  const idx = text.indexOf(META_MARKER);
  if (idx === -1) {
    return { contentWithoutMeta: text, meta: { ...DEFAULT_PRODUCT_EDIT_META } };
  }

  const contentWithoutMeta = text.slice(0, idx);
  const jsonPart = text
    .slice(idx + META_MARKER.length)
    .replace(/\n-->$/, '')
    .trim();

  try {
    return {
      contentWithoutMeta,
      meta: { ...DEFAULT_PRODUCT_EDIT_META, ...JSON.parse(jsonPart) } as ProductEditMeta,
    };
  } catch {
    return { contentWithoutMeta: text, meta: { ...DEFAULT_PRODUCT_EDIT_META } };
  }
}

function appendProductMeta(content: string, meta: ProductEditMeta): string {
  const base = content.trim();
  // Always persist meta so type/theme/inventory toggles and empty price clears survive reload.
  return `${base}${META_MARKER}${JSON.stringify(meta)}\n-->`;
}

export function parseProductEditRecord(raw: string | null | undefined): {
  bodyHtml: string;
  seo: ProductSeo;
  meta: ProductEditMeta;
} {
  const { contentWithoutMeta, meta } = parseProductMeta(raw);
  const { bodyHtml, seo } = parseProductDescription(contentWithoutMeta);
  return { bodyHtml, seo, meta };
}

export function serializeProductEditRecord(bodyHtml: string, seo: ProductSeo, meta: ProductEditMeta): string {
  return appendProductMeta(serializeProductDescription(bodyHtml, seo), meta);
}

export function mapCourseToProductEditState(course: CourseProductSource): ProductEditFormState {
  const parsed = parseProductEditRecord(course.description);
  const vendor = courseVendor(course);
  const sku = defaultSku(course.id);
  const commerce = course.commerce;

  return {
    title: course.title ?? '',
    bodyHtml: parsed.bodyHtml,
    seo: parsed.seo.metaTitle ? parsed.seo : { ...parsed.seo, metaTitle: course.title ?? '' },
    status: (course.status as ProductStatus) ?? 'DRAFT',
    enrollmentCount: course.students?.length ?? 0,
    meta: {
      ...parsed.meta,
      vendor: parsed.meta.vendor || vendor,
      sku: parsed.meta.sku || commerce?.sku || sku,
      category: parsed.meta.category || commerce?.category || '',
      productType: parsed.meta.productType || 'Course',
      price: parsed.meta.price || centsToPriceString(commerce?.priceCents ?? null),
      compareAtPrice: parsed.meta.compareAtPrice || centsToPriceString(commerce?.compareAtPriceCents ?? null),
    },
  };
}

export function buildCourseUpdateInput(
  state: Pick<ProductEditFormState, 'title' | 'bodyHtml' | 'seo' | 'meta' | 'status'>,
): {
  title: string;
  description: string;
  status: ProductStatus;
  commerce: ReturnType<typeof commerceInputFromMeta>;
} {
  return {
    title: state.title.trim(),
    description: serializeProductEditRecord(state.bodyHtml, state.seo, state.meta),
    status: state.status,
    commerce: commerceInputFromMeta(state.meta),
  };
}

export function buildCourseCreateInput(
  state: Pick<ProductEditFormState, 'title' | 'bodyHtml' | 'seo' | 'meta'>,
  instructorId: string,
  tenantId: string,
): {
  title: string;
  description: string;
  instructorId: string;
  tenantId: string;
  commerce: ReturnType<typeof commerceInputFromMeta>;
} {
  return {
    title: state.title.trim(),
    description: serializeProductEditRecord(state.bodyHtml, state.seo, state.meta),
    instructorId,
    tenantId,
    commerce: commerceInputFromMeta(state.meta),
  };
}
