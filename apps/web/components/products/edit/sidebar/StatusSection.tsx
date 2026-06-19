import { ProductEditSection } from '../ProductEditSection';
import type { ProductStatus } from '../../../../lib/product-display';

interface StatusSectionProps {
  status: ProductStatus;
  onStatusChange: (status: ProductStatus) => void;
}

const OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: 'PUBLISHED', label: 'Active' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Archived' },
];

export function StatusSection({ status, onStatusChange }: StatusSectionProps) {
  return (
    <ProductEditSection title="Status">
      <select
        className="ios-input"
        value={status}
        onChange={(e) => onStatusChange(e.target.value as ProductStatus)}
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </ProductEditSection>
  );
}
