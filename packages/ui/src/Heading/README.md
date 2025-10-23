# Heading Component

A flexible heading component for creating semantic headings with support for different levels, sizes, weights, and theming.

## Features

- **SSR Support**: Server-side rendering with theme injection
- **Semantic HTML**: Proper heading levels (h1-h6)
- **Flexible Sizing**: Multiple size options and responsive design
- **Theme Integration**: Supports tenant-specific theming
- **Typography Control**: Font weight, alignment, and color options
- **Accessibility**: Proper heading structure for screen readers
- **Responsive Design**: Adapts to different screen sizes

## Usage

```tsx
import { Heading } from '@luxgen/ui';

// Basic usage
<Heading level={1} text="Main Heading" />

// With different levels
<Heading level={2} text="Section Heading" />
<Heading level={3} text="Subsection Heading" />

// With custom styling
<Heading
  level={1}
  text="Custom Heading"
  size="5xl"
  weight="bold"
  align="center"
  variant="success"
/>

// With truncation
<Heading
  level={2}
  text="Very long heading that should be truncated"
  truncate
/>

// With custom color
<Heading
  level={2}
  text="Colored Heading"
  color="#8B5CF6"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tenantTheme` | `TenantTheme` | `defaultTheme` | Theme object for styling |
| `level` | `1 | 2 | 3 | 4 | 5 | 6` | - | Heading level (h1-h6) |
| `text` | `string` | - | Heading text content |
| `size` | `'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl'` | - | Custom size override |
| `weight` | `'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black'` | `'semibold'` | Font weight |
| `align` | `'left' | 'center' | 'right' | 'justify'` | `'left'` | Text alignment |
| `color` | `string` | - | Custom text color |
| `variant` | `'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'` | `'primary'` | Color variant |
| `truncate` | `boolean` | `false` | Truncate long text with ellipsis |
| `className` | `string` | `''` | Additional CSS classes |
| `style` | `CSSProperties` | `{}` | Inline styles |

## SSR Usage

```tsx
import { fetchHeadingSSR } from '@luxgen/ui';

// Server-side rendering
const { html, styles } = await fetchHeadingSSR(tenantId);
```

## Styling

The component uses CSS custom properties for theming:

```css
.heading {
  font-family: var(--font-primary);
  color: var(--color-text);
  margin: 0;
  line-height: 1.2;
}

.heading-6xl {
  font-size: 3.75rem;
  line-height: 1;
}

.heading-primary {
  color: var(--color-text);
}

.heading-success {
  color: var(--color-success);
}
```

## Heading Levels

- **H1**: Main page title (6xl by default)
- **H2**: Section headings (5xl by default)
- **H3**: Subsection headings (4xl by default)
- **H4**: Sub-subsection headings (3xl by default)
- **H5**: Minor headings (2xl by default)
- **H6**: Small headings (xl by default)

## Sizes

- **6xl**: 3.75rem (60px)
- **5xl**: 3rem (48px)
- **4xl**: 2.25rem (36px)
- **3xl**: 1.875rem (30px)
- **2xl**: 1.5rem (24px)
- **xl**: 1.25rem (20px)
- **lg**: 1.125rem (18px)
- **md**: 1rem (16px)
- **sm**: 0.875rem (14px)

## Font Weights

- **light**: 300
- **normal**: 400
- **medium**: 500
- **semibold**: 600
- **bold**: 700
- **extrabold**: 800
- **black**: 900

## Variants

- **primary**: Default text color
- **secondary**: Secondary text color
- **success**: Success color
- **error**: Error color
- **warning**: Warning color
- **info**: Info color

## Accessibility

- Proper semantic HTML structure
- Screen reader friendly
- Maintains heading hierarchy
- Focus management
- ARIA attributes

## Testing

```tsx
import { render, screen } from '@testing-library/react';
import { Heading } from '@luxgen/ui';

test('renders with correct heading level', () => {
  render(<Heading level={1} text="Main Heading" />);
  
  expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  expect(screen.getByText('Main Heading')).toBeInTheDocument();
});

test('renders with custom styling', () => {
  render(
    <Heading
      level={2}
      text="Custom Heading"
      size="5xl"
      weight="bold"
      align="center"
    />
  );
  
  const heading = screen.getByRole('heading', { level: 2 });
  expect(heading).toHaveClass('heading-5xl');
  expect(heading).toHaveStyle('text-align: center');
  expect(heading).toHaveStyle('font-weight: bold');
});
```

## Examples

### Basic Headings
```tsx
<Heading level={1} text="Page Title" />
<Heading level={2} text="Section Title" />
<Heading level={3} text="Subsection Title" />
```

### Styled Headings
```tsx
<Heading
  level={1}
  text="Welcome to LuxGen"
  size="6xl"
  weight="bold"
  align="center"
  variant="primary"
/>
```

### Colored Headings
```tsx
<Heading
  level={2}
  text="Success Message"
  variant="success"
/>

<Heading
  level={3}
  text="Error Message"
  variant="error"
/>
```

### Truncated Headings
```tsx
<Heading
  level={2}
  text="This is a very long heading that should be truncated when the container is too small"
  truncate
/>
```

### Custom Themed Headings
```tsx
<Heading
  tenantTheme={customTheme}
  level={2}
  text="Custom Themed Heading"
/>
```

### Responsive Headings
```tsx
<Heading
  level={1}
  text="Responsive Heading"
  size="6xl"
  // Automatically scales down on mobile
/>
```
