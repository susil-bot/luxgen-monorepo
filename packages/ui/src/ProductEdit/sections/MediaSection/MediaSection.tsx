import { ProductEditSection } from '../../ProductEditSection';
import { mediaSectionDefaults } from './fetcher';

export interface MediaSectionProps {
  thumbnailUrl?: string | null;
}

export function MediaSection({ thumbnailUrl }: MediaSectionProps) {
  return (
    <ProductEditSection title="Media" hint="Shopify: product images · LuxGen: course thumbnail & preview">
      <div className="flex flex-wrap gap-3">
        {thumbnailUrl ? (
          <div
            className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0"
            style={{ border: '1px solid var(--color-separator)' }}
          >
            <img src={thumbnailUrl} alt="" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div
            className="w-24 h-24 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
            style={{ background: 'var(--color-fill-quaternary)', border: '1px dashed var(--color-separator)' }}
          >
            📘
          </div>
        )}
        <button
          type="button"
          className="w-24 h-24 rounded-xl flex items-center justify-center text-2xl text-tertiary flex-shrink-0"
          style={{ background: 'var(--color-fill-quaternary)', border: '1px dashed var(--color-separator)' }}
          disabled
          title={mediaSectionDefaults.uploadPhaseLabel}
        >
          +
        </button>
      </div>
      <p className="text-xs text-tertiary">{mediaSectionDefaults.helperText}</p>
    </ProductEditSection>
  );
}
