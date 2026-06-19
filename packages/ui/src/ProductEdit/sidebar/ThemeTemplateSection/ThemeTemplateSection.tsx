import type { ProductEditMeta } from '../../fetcher';
import { ProductEditSection } from '../../ProductEditSection';
import { themeTemplates } from './fetcher';

export interface ThemeTemplateSectionProps {
  meta: ProductEditMeta;
  onMetaChange: (patch: Partial<ProductEditMeta>) => void;
}

export function ThemeTemplateSection({ meta, onMetaChange }: ThemeTemplateSectionProps) {
  return (
    <ProductEditSection title="Theme template" hint="Shopify: Online Store theme · LuxGen: learner page layout">
      <select
        className="ios-input"
        value={meta.themeTemplate}
        onChange={(e) => onMetaChange({ themeTemplate: e.target.value })}
      >
        {themeTemplates.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
    </ProductEditSection>
  );
}
