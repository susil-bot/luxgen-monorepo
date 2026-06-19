import { ProductEditSection } from '../ProductEditSection';
import type { ProductEditMeta } from '../../../../lib/product-edit-meta';

interface ThemeTemplateSectionProps {
  meta: ProductEditMeta;
  onMetaChange: (patch: Partial<ProductEditMeta>) => void;
}

const TEMPLATES = [
  { value: 'default', label: 'Default product' },
  { value: 'course-hero', label: 'Course hero' },
  { value: 'minimal', label: 'Minimal learner page' },
];

export function ThemeTemplateSection({ meta, onMetaChange }: ThemeTemplateSectionProps) {
  return (
    <ProductEditSection title="Theme template" hint="Shopify: Online Store theme · LuxGen: learner page layout">
      <select
        className="ios-input"
        value={meta.themeTemplate}
        onChange={(e) => onMetaChange({ themeTemplate: e.target.value })}
      >
        {TEMPLATES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
    </ProductEditSection>
  );
}
