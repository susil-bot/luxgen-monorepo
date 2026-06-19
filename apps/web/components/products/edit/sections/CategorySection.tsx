import { ProductEditSection } from '../ProductEditSection';

interface CategorySectionProps {
  category: string;
  onCategoryChange: (value: string) => void;
}

const SUGGESTIONS = ['Technology', 'Business', 'Design', 'Marketing', 'Language', 'Consumer Magazines in Magazines'];

export function CategorySection({ category, onCategoryChange }: CategorySectionProps) {
  return (
    <ProductEditSection
      title="Category"
      hint="Shopify Standard Product Taxonomy · LuxGen: course subject category"
    >
      <div className="ios-form-group">
        <label htmlFor="product-category">Category</label>
        <input
          id="product-category"
          className="ios-input"
          list="luxgen-category-suggestions"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          placeholder="Choose a course category"
        />
        <datalist id="luxgen-category-suggestions">
          {SUGGESTIONS.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>
      {category && (
        <p className="text-xs text-secondary">
          Suggested: <span className="badge badge-purple">{category}</span>
        </p>
      )}
    </ProductEditSection>
  );
}
