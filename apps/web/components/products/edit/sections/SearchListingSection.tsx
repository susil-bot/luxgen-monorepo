import { ProductEditSection } from '../ProductEditSection';
import type { ProductSeo } from '../../../../lib/product-edit-meta';

interface SearchListingSectionProps {
  seo: ProductSeo;
  productTitle: string;
  tenant: string;
  onSeoChange: (patch: Partial<ProductSeo>) => void;
}

export function SearchListingSection({ seo, productTitle, tenant, onSeoChange }: SearchListingSectionProps) {
  const handle = seo.urlHandle || productTitle.toLowerCase().replace(/\s+/g, '-').slice(0, 48);
  const previewTitle = seo.metaTitle || productTitle || 'Product title';
  const previewDesc = seo.metaDescription || 'Add a meta description for search engines.';
  const previewUrl = `https://${tenant}.localhost/products/${handle}`;

  return (
    <ProductEditSection title="Search engine listing">
      <div
        className="rounded-xl p-4 space-y-1"
        style={{ background: 'var(--color-fill-quaternary)', border: '1px solid var(--color-separator)' }}
      >
        <p className="text-base font-medium" style={{ color: 'var(--color-blue)' }}>
          {previewTitle}
        </p>
        <p className="text-xs text-secondary">{previewUrl}</p>
        <p className="text-sm text-secondary line-clamp-2">{previewDesc}</p>
      </div>
      <button
        type="button"
        className="ios-btn-plain text-sm"
        onClick={() => {
          const el = document.getElementById('luxgen-seo-fields');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        Edit SEO fields ↓
      </button>
      <div id="luxgen-seo-fields" className="space-y-4 pt-2">
        <div className="ios-form-group">
          <label htmlFor="metaTitle">Page title</label>
          <input
            id="metaTitle"
            className="ios-input"
            value={seo.metaTitle}
            onChange={(e) => onSeoChange({ metaTitle: e.target.value })}
            maxLength={70}
          />
        </div>
        <div className="ios-form-group">
          <label htmlFor="metaDescription">Meta description</label>
          <textarea
            id="metaDescription"
            className="ios-input min-h-[80px]"
            value={seo.metaDescription}
            onChange={(e) => onSeoChange({ metaDescription: e.target.value })}
            maxLength={160}
          />
        </div>
        <div className="ios-form-group">
          <label htmlFor="urlHandle">URL handle</label>
          <input
            id="urlHandle"
            className="ios-input"
            value={seo.urlHandle}
            onChange={(e) => onSeoChange({ urlHandle: e.target.value })}
            placeholder={handle}
          />
        </div>
      </div>
    </ProductEditSection>
  );
}
