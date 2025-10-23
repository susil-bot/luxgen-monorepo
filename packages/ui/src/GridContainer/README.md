# GridContainer Component

A responsive grid container component for creating flexible layouts.

## Features

- **SSR Support**: Server-side rendering with theme injection
- **Responsive Design**: Automatically adapts to different screen sizes
- **Flexible Columns**: Configurable number of columns
- **Custom Gap**: Adjustable spacing between grid items
- **Theme Integration**: Supports tenant-specific theming
- **CSS Grid**: Uses modern CSS Grid for layout

## Usage

```tsx
import { GridContainer } from '@luxgen/ui';

// Basic usage
<GridContainer columns={3} gap="1rem">
  <div>Grid Item 1</div>
  <div>Grid Item 2</div>
  <div>Grid Item 3</div>
</GridContainer>

// With custom columns and gap
<GridContainer columns={4} gap="2rem">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
  <div>Item 4</div>
</GridContainer>

// With custom theme
<GridContainer
  tenantTheme={customTheme}
  columns={2}
  gap="1.5rem"
>
  <div>Item 1</div>
  <div>Item 2</div>
</GridContainer>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tenantTheme` | `TenantTheme` | `defaultTheme` | Theme object for styling |
| `columns` | `number` | `3` | Number of columns |
| `gap` | `string` | `'1rem'` | Gap between grid items |
| `className` | `string` | `''` | Additional CSS classes |
| `style` | `CSSProperties` | `{}` | Inline styles |
| `children` | `ReactNode` | - | Grid items to render |

## SSR Usage

```tsx
import { fetchGridContainerSSR } from '@luxgen/ui';

// Server-side rendering
const { html, styles } = await fetchGridContainerSSR(tenantId);
```

## Styling

The component uses CSS Grid for layout:

```css
.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

/* Responsive breakpoints */
@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .grid-container {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

## Responsive Design

- **Mobile**: Single column layout
- **Tablet**: Two column layout
- **Desktop**: Three column layout (or specified columns)

## Accessibility

- Uses semantic HTML structure
- Maintains proper reading order
- Supports keyboard navigation
- Screen reader friendly

## Testing

```tsx
import { render, screen } from '@testing-library/react';
import { GridContainer } from '@luxgen/ui';

test('renders with specified columns', () => {
  render(
    <GridContainer columns={2} gap="1rem">
      <div>Item 1</div>
      <div>Item 2</div>
    </GridContainer>
  );
  
  const gridContainer = screen.getByText('Item 1').parentElement;
  expect(gridContainer).toHaveStyle('grid-template-columns: repeat(2, 1fr)');
  expect(gridContainer).toHaveStyle('gap: 1rem');
});
```

## Examples

### Basic Grid
```tsx
<GridContainer columns={3} gap="1rem">
  <Card title="Card 1" />
  <Card title="Card 2" />
  <Card title="Card 3" />
</GridContainer>
```

### Responsive Grid
```tsx
<GridContainer columns={4} gap="1.5rem">
  <ProductCard product={product1} />
  <ProductCard product={product2} />
  <ProductCard product={product3} />
  <ProductCard product={product4} />
</GridContainer>
```

### Single Column Layout
```tsx
<GridContainer columns={1} gap="2rem">
  <ArticleCard article={article1} />
  <ArticleCard article={article2} />
  <ArticleCard article={article3} />
</GridContainer>
```

### Custom Styling
```tsx
<GridContainer
  columns={2}
  gap="2rem"
  className="custom-grid"
  style={{ padding: '2rem' }}
>
  <div>Custom Item 1</div>
  <div>Custom Item 2</div>
</GridContainer>
```
