import { ProductEditSection } from '../ProductEditSection';
import type { ProductEditMeta } from '../../../../lib/product-edit-meta';

interface PricingSectionProps {
  meta: ProductEditMeta;
  onMetaChange: (patch: Partial<ProductEditMeta>) => void;
}

export function PricingSection({ meta, onMetaChange }: PricingSectionProps) {
  return (
    <ProductEditSection title="Pricing" hint="Shopify: price · LuxGen: links to billing plans">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="ios-form-group">
          <label htmlFor="price">Price</label>
          <input
            id="price"
            className="ios-input"
            value={meta.price}
            onChange={(e) => onMetaChange({ price: e.target.value })}
            placeholder="0.00"
          />
        </div>
        <div className="ios-form-group">
          <label htmlFor="compareAt">Compare-at price</label>
          <input
            id="compareAt"
            className="ios-input"
            value={meta.compareAtPrice}
            onChange={(e) => onMetaChange({ compareAtPrice: e.target.value })}
            placeholder="0.00"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-4 pt-1">
        <label className="flex items-center gap-2 text-sm text-secondary cursor-pointer">
          <input
            type="checkbox"
            checked={meta.chargeTax}
            onChange={(e) => onMetaChange({ chargeTax: e.target.checked })}
          />
          Charge tax
        </label>
      </div>
      <p className="text-xs text-tertiary">Stripe billing integration — configure plans on /billing</p>
    </ProductEditSection>
  );
}
