import { ProductEditSection } from '../../ProductEditSection';
import { deliverySectionDefaults } from './fetcher';

/** Shopify "Shipping" → LuxGen digital delivery (LMS has no physical ship) */
export function DeliverySection() {
  return (
    <ProductEditSection title="Delivery" hint="Shopify: Shipping · LuxGen: digital course delivery">
      <label className="flex items-center gap-2 text-sm text-primary cursor-pointer mb-4">
        <input type="checkbox" checked disabled />
        Digital product
      </label>
      <p className="text-sm text-secondary mb-4">
        This course is delivered online. Physical shipping does not apply.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 opacity-60">
        <div className="ios-form-group">
          <label>Access package</label>
          <select className="ios-input" disabled>
            <option>{deliverySectionDefaults.accessPackage}</option>
          </select>
        </div>
        <div className="ios-form-group">
          <label>Estimated completion</label>
          <input className="ios-input" placeholder="e.g. 8 weeks" disabled />
        </div>
      </div>
    </ProductEditSection>
  );
}
