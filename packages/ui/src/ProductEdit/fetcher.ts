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
  const jsonPart = text.slice(idx + SEO_MARKER.length).replace(/\n-->$/, '').trim();

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
  const jsonPart = text.slice(idx + META_MARKER.length).replace(/\n-->$/, '').trim();

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
  const hasValues = Object.entries(meta).some(([k, v]) => {
    if (k === 'productType' || k === 'themeTemplate' || k === 'trackInventory') return false;
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === 'boolean') return v !== DEFAULT_PRODUCT_EDIT_META[k as keyof ProductEditMeta];
    return v !== '' && v !== null;
  });
  if (!hasValues) return base;
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

export function serializeProductEditRecord(
  bodyHtml: string,
  seo: ProductSeo,
  meta: ProductEditMeta,
): string {
  return appendProductMeta(serializeProductDescription(bodyHtml, seo), meta);
}

export function mapCourseToProductEditState(course: CourseProductSource): ProductEditFormState {
  const parsed = parseProductEditRecord(course.description);
  const vendor = courseVendor(course);
  const sku = defaultSku(course.id);

  return {
    title: course.title ?? '',
    bodyHtml: parsed.bodyHtml,
    seo: parsed.seo.metaTitle ? parsed.seo : { ...parsed.seo, metaTitle: course.title ?? '' },
    status: (course.status as ProductStatus) ?? 'DRAFT',
    enrollmentCount: course.students?.length ?? 0,
    meta: {
      ...parsed.meta,
      vendor: parsed.meta.vendor || vendor,
      sku: parsed.meta.sku || sku,
      productType: parsed.meta.productType || 'Course',
    },
  };
}

export function buildCourseUpdateInput(state: Pick<ProductEditFormState, 'title' | 'bodyHtml' | 'seo' | 'meta' | 'status'>): {
  title: string;
  description: string;
  status: ProductStatus;
} {
  return {
    title: state.title.trim(),
    description: serializeProductEditRecord(state.bodyHtml, state.seo, state.meta),
    status: state.status,
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
} {
  return {
    title: state.title.trim(),
    description: serializeProductEditRecord(state.bodyHtml, state.seo, state.meta),
    instructorId,
    tenantId,
  };
}
