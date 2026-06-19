import { ProductEditSection } from '../../ProductEditSection';
import { categoryMetafieldTags, productMetafields, variantMetafieldLabels } from './fetcher';

export function MetafieldsSection() {
  return (
    <>
      <ProductEditSection
        title="Category metafields"
        hint="Shopify taxonomy extras · LuxGen: subject-specific fields"
      >
        <div
          className="rounded-xl p-4 space-y-3"
          style={{ background: 'var(--color-fill-quaternary)', border: '1px solid var(--color-separator)' }}
        >
          <p className="text-xs text-tertiary">Language version, media access, theme tags — Phase 3 API</p>
          <div className="flex flex-wrap gap-2">
            {categoryMetafieldTags.map((tag) => (
              <span key={tag} className="badge badge-gray">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </ProductEditSection>

      <ProductEditSection title="Product metafields">
        <ul className="space-y-3">
          {productMetafields.map((field) => (
            <li key={field.id} className="ios-form-group mb-0">
              <label htmlFor={field.id}>{field.label}</label>
              <input id={field.id} className="ios-input" disabled placeholder="—" />
            </li>
          ))}
        </ul>
      </ProductEditSection>

      <ProductEditSection title="Variant metafields" hint="Google Shopping / channel fields">
        <ul className="space-y-3">
          {variantMetafieldLabels.map((label) => (
            <li key={label} className="ios-form-group mb-0">
              <label>{label}</label>
              <input className="ios-input" disabled placeholder="—" />
            </li>
          ))}
        </ul>
      </ProductEditSection>
    </>
  );
}
