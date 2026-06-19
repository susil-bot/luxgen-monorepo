import type { OrderDetail } from '../../fetcher';
import { OrderDetailSection } from '../../OrderDetailSection';

export interface ConversionSectionProps {
  order: OrderDetail;
}

export function ConversionSection({ order }: ConversionSectionProps) {
  return (
    <OrderDetailSection title="Conversion summary" hint="Shopify: attribution · LuxGen: enrollment source">
      <p className="text-sm text-primary">{order.conversionSource}</p>
      <p className="text-xs text-tertiary mt-1">First visit → enrollment</p>
    </OrderDetailSection>
  );
}
