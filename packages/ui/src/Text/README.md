# Text Component

A flexible text component for displaying text content with support for different variants, weights, colors, and theming.

## Features

- **SSR Support**: Server-side rendering with theme injection
- **Multiple Variants**: Caption, small, normal, large, lead, and muted text
- **Flexible Styling**: Font weight, alignment, and color options
- **Theme Integration**: Supports tenant-specific theming
- **Semantic HTML**: Support for different HTML elements (p, span, div, label)
- **Responsive Design**: Adapts to different screen sizes
- **Truncation**: Support for text truncation with ellipsis

## Usage

```tsx
import { Text } from '@luxgen/ui';

// Basic usage
<Text text="Default text content" />

// With different variants
<Text text="Small text" variant="small" />
<Text text="Large text" variant="large" />
<Text text="Lead text" variant="lead" />
<Text text="Caption text" variant="caption" />
<Text text="Muted text" variant="muted" />

// With custom styling
<Text
  text="Styled text"
  variant="normal"
  weight="bold"
  align="center"
  color="#8B5CF6"
/>

// With truncation
<Text
  text="Very long text that should be truncated"
  truncate
/>

// As different elements
<Text text="Span text" as="span" />
<Text text="Div text" as="div" />
<Text text="Label text" as="label" />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tenantTheme` | `TenantTheme` | `defaultTheme` | Theme object for styling |
| `text` | `string` | - | Text content |
| `variant` | `'normal' | 'muted' | 'small' | 'large' | 'lead' | 'caption'` | `'normal'` | Text variant |
| `weight` | `'light' | 'normal' | 'medium' | 'semibold' | 'bold'` | `'normal'` | Font weight |
| `align` | `'left' | 'center' | 'right' | 'justify'` | `'left'` | Text alignment |
| `color` | `string` | - | Custom text color |
| `variant` | `'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'` | `'primary'` | Color variant |
| `truncate` | `boolean` | `false` | Truncate long text with ellipsis |
| `as` | `'p' | 'span' | 'div' | 'label'` | `'p'` | HTML element to render |
| `className` | `string` | `''` | Additional CSS classes |
| `style` | `CSSProperties` | `{}` | Inline styles |

## SSR Usage

```tsx
import { fetchTextSSR } from '@luxgen/ui';

// Server-side rendering
const { html, styles } = await fetchTextSSR(tenantId);
```

## Styling

The component uses CSS custom properties for theming:

```css
.text {
  font-family: var(--font-primary);
  color: var(--color-text);
  margin: 0;
  line-height: 1.5;
}

.text-caption {
  font-size: 0.75rem;
  line-height: 1.4;
  color: var(--color-text-secondary);
}

.text-lead {
  font-size: 1.25rem;
  line-height: 1.4;
  font-weight: 500;
}

.text-muted {
  font-size: 1rem;
  color: var(--color-text-secondary);
}
```

## Variants

- **caption**: Small text for captions (0.75rem)
- **small**: Small text (0.875rem)
- **normal**: Default text size (1rem)
- **large**: Large text (1.125rem)
- **lead**: Prominent text (1.25rem, medium weight)
- **muted**: Muted text color

## Font Weights

- **light**: 300
- **normal**: 400
- **medium**: 500
- **semibold**: 600
- **bold**: 700

## Alignments

- **left**: Left aligned (default)
- **center**: Center aligned
- **right**: Right aligned
- **justify**: Justified text

## Color Variants

- **primary**: Default text color
- **secondary**: Secondary text color
- **success**: Success color
- **error**: Error color
- **warning**: Warning color
- **info**: Info color

## HTML Elements

- **p**: Paragraph element (default)
- **span**: Inline span element
- **div**: Block div element
- **label**: Label element

## Accessibility

- Proper semantic HTML structure
- Screen reader friendly
- Maintains text hierarchy
- Focus management
- ARIA attributes

## Testing

```tsx
import { render, screen } from '@testing-library/react';
import { Text } from '@luxgen/ui';

test('renders with text content', () => {
  render(<Text text="Test content" />);
  
  expect(screen.getByText('Test content')).toBeInTheDocument();
});

test('renders with different variants', () => {
  render(<Text text="Small text" variant="small" />);
  
  const text = screen.getByText('Small text');
  expect(text).toHaveClass('text-small');
});

test('renders as different elements', () => {
  render(<Text text="Span text" as="span" />);
  
  expect(screen.getByText('Span text').tagName).toBe('SPAN');
});
```

## Examples

### Basic Text
```tsx
<Text text="This is normal text content" />
```

### Variant Text
```tsx
<Text text="This is lead text" variant="lead" />
<Text text="This is small text" variant="small" />
<Text text="This is muted text" variant="muted" />
```

### Styled Text
```tsx
<Text
  text="This is styled text"
  weight="bold"
  align="center"
  color="#8B5CF6"
/>
```

### Colored Text
```tsx
<Text text="Success message" variant="success" />
<Text text="Error message" variant="error" />
<Text text="Warning message" variant="warning" />
```

### Truncated Text
```tsx
<Text
  text="This is a very long text that should be truncated when the container is too small"
  truncate
/>
```

### Different Elements
```tsx
<Text text="Paragraph text" as="p" />
<Text text="Inline text" as="span" />
<Text text="Block text" as="div" />
<Text text="Label text" as="label" />
```

### Custom Themed Text
```tsx
<Text
  tenantTheme={customTheme}
  text="Custom themed text"
/>
```
