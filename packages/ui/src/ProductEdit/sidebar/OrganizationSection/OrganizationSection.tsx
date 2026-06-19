import type { ProductEditMeta } from '../../fetcher';
import { ProductEditSection } from '../../ProductEditSection';
import { organizationSectionDefaults } from './fetcher';

export interface OrganizationSectionProps {
  meta: ProductEditMeta;
  onMetaChange: (patch: Partial<ProductEditMeta>) => void;
}

export function OrganizationSection({ meta, onMetaChange }: OrganizationSectionProps) {
  const tagsValue = meta.tags.join(', ');

  return (
    <ProductEditSection title="Product organization" hint="Shopify: type, vendor, collections, tags">
      <div className="space-y-4">
        <div className="ios-form-group">
          <label htmlFor="org-type">Type</label>
          <input
            id="org-type"
            className="ios-input"
            value={meta.productType}
            onChange={(e) => onMetaChange({ productType: e.target.value })}
          />
        </div>
        <div className="ios-form-group">
          <label htmlFor="org-vendor">Vendor</label>
          <input
            id="org-vendor"
            className="ios-input"
            value={meta.vendor}
            onChange={(e) => onMetaChange({ vendor: e.target.value })}
            placeholder="Instructor or publisher"
          />
        </div>
        <div className="ios-form-group">
          <label htmlFor="org-collections">Collections (Groups)</label>
          <input
            id="org-collections"
            className="ios-input"
            disabled
            placeholder={organizationSectionDefaults.collectionsPlaceholder}
          />
        </div>
        <div className="ios-form-group">
          <label htmlFor="org-tags">Tags</label>
          <input
            id="org-tags"
            className="ios-input"
            value={tagsValue}
            onChange={(e) =>
              onMetaChange({
                tags: e.target.value
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean),
              })
            }
            placeholder={organizationSectionDefaults.tagsPlaceholder}
          />
        </div>
      </div>
    </ProductEditSection>
  );
}
