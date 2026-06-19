# ProductEdit

Shopify Admin–style product edit layout for LuxGen courses. Each sub-section follows the standard UI component structure (`ComponentName.tsx`, `fetcher.ts`, `fixture.ts`, `index.ts`).

## Usage

```tsx
import {
  ProductEditForm,
  mapCourseToProductEditState,
  buildCourseUpdateInput,
  productEditFixtures,
} from '@luxgen/ui';

<ProductEditForm
  tenant="demo"
  {...productEditFixtures.default}
  onSave={handleSave}
/>
```

## Structure

```
ProductEdit/
├── ProductEditForm.tsx       # Orchestrator
├── ProductEditLayout.tsx     # Two-column grid
├── ProductEditHeader.tsx
├── ProductEditSection.tsx    # Card wrapper
├── fetcher.ts                # Parse/serialize + course mapping
├── fixture.ts
├── styles.ts
├── translations.ts
├── sections/                 # Main column (Shopify left)
└── sidebar/                  # Right column
```

See `docs/PRODUCT_EDIT_LAYOUT.md` for Shopify → LuxGen section mapping.
