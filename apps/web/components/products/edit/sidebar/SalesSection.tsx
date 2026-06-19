import { ProductEditSection } from '../ProductEditSection';

interface SalesSectionProps {
  enrollmentCount: number;
}

export function SalesSection({ enrollmentCount }: SalesSectionProps) {
  return (
    <ProductEditSection title="Sales" hint="Shopify: past 90 days · LuxGen: enrollments">
      <ul className="space-y-2 text-sm">
        <li className="flex justify-between">
          <span className="text-secondary">Enrollments</span>
          <span className="font-medium text-primary">{enrollmentCount}</span>
        </li>
        <li className="flex justify-between">
          <span className="text-secondary">Learners</span>
          <span className="font-medium text-primary">{enrollmentCount}</span>
        </li>
        <li className="flex justify-between">
          <span className="text-secondary">Net sales</span>
          <span className="font-medium text-primary">—</span>
        </li>
      </ul>
      <button type="button" className="ios-btn-plain text-sm mt-2" disabled>
        View details
      </button>
    </ProductEditSection>
  );
}
