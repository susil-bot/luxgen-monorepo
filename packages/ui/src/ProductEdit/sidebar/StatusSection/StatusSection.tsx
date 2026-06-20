import type { ProductStatus } from '../../fetcher';
import { ProductEditSection } from '../../ProductEditSection';
import { statusOptions } from './fetcher';

export interface StatusSectionProps {
  status: ProductStatus;
  onStatusChange: (status: ProductStatus) => void;
}

export function StatusSection({ status, onStatusChange }: StatusSectionProps) {
  return (
    <ProductEditSection title="Status">
      <select className="ios-input" value={status} onChange={(e) => onStatusChange(e.target.value as ProductStatus)}>
        {statusOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </ProductEditSection>
  );
}
