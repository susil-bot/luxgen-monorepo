import {
  centsToPriceString,
  parseProductEditRecord,
  type ProductStatus as UiProductStatus,
} from '@luxgen/ui';

export type ProductStatus = UiProductStatus;

export interface GraphQLCourseProduct {
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

export interface ProductTableRow {
  id: string;
  title: string;
  status: ProductStatus;
  inventory: number;
  productType: string;
  vendor: string;
  sku: string;
  price: string;
  updatedAt: string;
}

export function courseToProductRow(course: GraphQLCourseProduct): ProductTableRow {
  const vendor = course.instructor
    ? `${course.instructor.firstName ?? ''} ${course.instructor.lastName ?? ''}`.trim()
    : '—';

  const parsed = parseProductEditRecord(course.description);
  const priceFromCommerce = centsToPriceString(course.commerce?.priceCents ?? null);
  const price = priceFromCommerce || parsed.meta.price || '—';
  const sku =
    course.commerce?.sku?.trim() ||
    parsed.meta.sku?.trim() ||
    `CRS-${course.id.slice(-6).toUpperCase()}`;

  return {
    id: course.id,
    title: course.title,
    status: (course.status as ProductStatus) || 'DRAFT',
    inventory: course.students?.length ?? 0,
    productType: parsed.meta.productType || 'Course',
    vendor: parsed.meta.vendor || vendor || '—',
    sku,
    price,
    updatedAt: course.updatedAt ?? course.createdAt ?? '',
  };
}

export function formatProductDate(iso: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '—';
  }
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
