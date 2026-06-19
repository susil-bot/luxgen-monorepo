export type ProductStatus = 'DRAFT' | 'PUBLISHED' | 'COMPLETED' | 'CANCELLED' | 'ARCHIVED';

export interface GraphQLCourseProduct {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  updatedAt?: string;
  createdAt?: string;
  instructor?: { firstName?: string; lastName?: string } | null;
  students?: { id: string }[] | null;
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

  return {
    id: course.id,
    title: course.title,
    status: (course.status as ProductStatus) || 'DRAFT',
    inventory: course.students?.length ?? 0,
    productType: 'Course',
    vendor: vendor || '—',
    sku: `CRS-${course.id.slice(-6).toUpperCase()}`,
    price: '—',
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
