# Kicker Component

A small, prominent text component typically used for labels, categories, or section headers. Perfect for highlighting important information or categorizing content.

## Features

- **SSR Support**: Server-side rendering with theme injection
- **Multiple Variants**: Primary, secondary, success, error, warning, and info
- **Flexible Sizing**: Small, medium, and large sizes
- **Typography Options**: Font weight, alignment, and text transform
- **Icon Support**: Display icons alongside kicker content
- **Theme Integration**: Supports tenant-specific theming
- **Responsive Design**: Adapts to different screen sizes

## Usage

```tsx
import { Kicker } from '@luxgen/ui';

// Basic usage
<Kicker>Featured</Kicker>

// With different variants
<Kicker variant="primary">Primary</Kicker>
<Kicker variant="success">Success</Kicker>
<Kicker variant="error">Error</Kicker>
<Kicker variant="warning">Warning</Kicker>
<Kicker variant="info">Info</Kicker>
<Kicker variant="secondary">Secondary</Kicker>

// With different sizes
<Kicker size="small">Small</Kicker>
<Kicker size="medium">Medium</Kicker>
<Kicker size="large">Large</Kicker>

// With custom styling
<Kicker
  weight="bold"
  align="center"
  underline
>
  Styled kicker
</Kicker>

// With icon
<Kicker icon="🔖">Kicker with icon</Kicker>

// Without uppercase
<Kicker uppercase={false}>Not uppercase</Kicker>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tenantTheme` | `TenantTheme` | `defaultTheme` | Theme object for styling |
| `children` | `React.ReactNode` | - | Kicker content |
| `variant` | `'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'` | `'primary'` | Kicker variant |
| `size` | `'small' | 'medium' | 'large'` | `'medium'` | Kicker size |
| `weight` | `'light' | 'normal' | 'medium' | 'semibold' | 'bold'` | `'medium'` | Font weight |
| `align` | `'left' | 'center' | 'right'` | `'left'` | Text alignment |
| `uppercase` | `boolean` | `true` | Transform text to uppercase |
| `underline` | `boolean` | `false` | Add underline decoration |
| `icon` | `React.ReactNode` | - | Icon to display |
| `iconPosition` | `'left' | 'right'` | `'left'` | Icon position |
| `className` | `string` | `''` | Additional CSS classes |
| `style` | `CSSProperties` | `{}` | Inline styles |

## SSR Usage

```tsx
import { fetchKickerSSR } from '@luxgen/ui';

// Server-side rendering
const { html, styles } = await fetchKickerSSR(tenantId);
```

## Styling

The component uses CSS custom properties for theming:

```css
.kicker {
  font-family: var(--font-primary);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.kicker-primary {
  color: var(--color-primary);
}

.kicker-success {
  color: var(--color-success);
}
```

## Variants

- **primary**: Primary brand color
- **secondary**: Secondary text color
- **success**: Success green color
- **error**: Error red color
- **warning**: Warning yellow color
- **info**: Info blue color

## Sizes

- **small**: Compact size (0.75rem font, 0.05em letter-spacing)
- **medium**: Default size (0.875rem font, 0.1em letter-spacing)
- **large**: Large size (1rem font, 0.15em letter-spacing)

## Typography Options

### Font Weights
- **light**: 300
- **normal**: 400
- **medium**: 500
- **semibold**: 600
- **bold**: 700

### Text Alignment
- **left**: Left aligned (default)
- **center**: Center aligned
- **right**: Right aligned

### Text Transform
- **uppercase**: Transform to uppercase (default)
- **none**: No transformation

## Interactive Features

### Icons
```tsx
<Kicker icon="🔖">Kicker with icon</Kicker>
<Kicker icon={<Icon name="star" />}>Kicker with component icon</Kicker>
```

### Icon Position
```tsx
<Kicker icon="🔖" iconPosition="left">Left icon</Kicker>
<Kicker icon="🔖" iconPosition="right">Right icon</Kicker>
```

### Underline
```tsx
<Kicker underline>Underlined kicker</Kicker>
```

## Accessibility

- Proper semantic HTML structure
- Screen reader friendly
- Maintains text hierarchy
- Focus management
- ARIA attributes

## Testing

```tsx
import { render, screen } from '@testing-library/react';
import { Kicker } from '@luxgen/ui';

test('renders with content', () => {
  render(<Kicker>Test kicker</Kicker>);
  
  expect(screen.getByText('Test kicker')).toBeInTheDocument();
});

test('renders with different variants', () => {
  render(<Kicker variant="success">Success kicker</Kicker>);
  
  const kicker = screen.getByText('Success kicker');
  expect(kicker).toHaveClass('kicker-success');
});

test('renders with icon', () => {
  render(<Kicker icon="🔖">Kicker with icon</Kicker>);
  
  expect(screen.getByText('Kicker with icon')).toBeInTheDocument();
  expect(screen.getByText('🔖')).toBeInTheDocument();
});
```

## Examples

### Basic Kickers
```tsx
<Kicker>Featured</Kicker>
<Kicker>New</Kicker>
<Kicker>Popular</Kicker>
<Kicker>Trending</Kicker>
```

### Status Kickers
```tsx
<Kicker variant="success">Active</Kicker>
<Kicker variant="error">Inactive</Kicker>
<Kicker variant="warning">Pending</Kicker>
<Kicker variant="info">Processing</Kicker>
```

### Size Variations
```tsx
<Kicker size="small">Small</Kicker>
<Kicker size="medium">Medium</Kicker>
<Kicker size="large">Large</Kicker>
```

### Styled Kickers
```tsx
<Kicker weight="bold" align="center">
  Centered bold kicker
</Kicker>

<Kicker underline>
  Underlined kicker
</Kicker>

<Kicker uppercase={false}>
  Not uppercase kicker
</Kicker>
```

### Icon Kickers
```tsx
<Kicker icon="🔖">Kicker with icon</Kicker>
<Kicker icon="⭐" iconPosition="right">Right icon</Kicker>
```

### Custom Themed Kickers
```tsx
<Kicker
  tenantTheme={customTheme}
  variant="primary"
>
  Custom themed kicker
</Kicker>
```

### Complex Content
```tsx
<Kicker>
  <Icon name="star" />
  Featured
</Kicker>

<Kicker variant="success">
  <Icon name="check" />
  Verified
</Kicker>
```
