import { ProductEditSection } from '../ProductEditSection';

export function VariantsSection() {
  return (
    <ProductEditSection title="Variants" hint="Shopify: options · LuxGen: course tiers & bundles">
      <p className="text-sm text-secondary">Add options like tier, duration, or certificate level.</p>
      <button type="button" className="ios-btn-secondary text-sm mt-2" disabled>
        + Add options like size or color
      </button>
      <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--color-separator)' }}>
        <p className="text-sm font-medium text-primary mb-2">Purchase options</p>
        <button type="button" className="ios-btn-plain text-sm" disabled>
          Subscriptions — Phase 3
        </button>
      </div>
    </ProductEditSection>
  );
}
