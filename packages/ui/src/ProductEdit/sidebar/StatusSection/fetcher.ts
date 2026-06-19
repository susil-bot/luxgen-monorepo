import type { ProductStatus } from '../../fetcher';

export const statusOptions: { value: ProductStatus; label: string }[] = [
  { value: 'PUBLISHED', label: 'Active' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Archived' },
];
