# Card Component

A flexible card component for displaying content in a structured, visually appealing format. Perfect for showcasing information, images, and interactive content.

## Features

- **SSR Support**: Server-side rendering with theme injection
- **Multiple Variants**: Default, elevated, outlined, and filled styles
- **Flexible Sizing**: Small, medium, and large sizes
- **Interactive Options**: Clickable cards with hover effects
- **Image Support**: Images with configurable positioning
- **Header/Footer**: Custom header and footer content
- **Theme Integration**: Supports tenant-specific theming
- **Responsive Design**: Adapts to different screen sizes

## Usage

```tsx
import { Card } from '@luxgen/ui';

// Basic usage
<Card>
  <div>Card content</div>
</Card>

// With title and description
<Card
  title="Card Title"
  description="Card description"
>
  <div>Card content</div>
</Card>

// With icon
<Card
  title="Card Title"
  description="Card description"
  icon="🔖"
>
  <div>Card content</div>
</Card>

// With different variants
<Card variant="elevated">Elevated card</Card>
<Card variant="outlined">Outlined card</Card>
<Card variant="filled">Filled card</Card>

// With different sizes
<Card size="small">Small card</Card>
<Card size="medium">Medium card</Card>
<Card size="large">Large card</Card>

// Clickable card
<Card
  clickable
  onClick={() => console.log('Card clicked')}
>
  Clickable card content
</Card>

// With image
<Card
  title="Card with Image"
  image="https://example.com/image.jpg"
  imageAlt="Card image"
>
  <div>Card content</div>
</Card>

// With header and footer
<Card
  title="Card Title"
  header={<div>Custom header</div>}
  footer={<div>Custom footer</div>}
>
  <div>Card content</div>
</Card>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tenantTheme` | `TenantTheme` | `defaultTheme` | Theme object for styling |
| `children` | `React.ReactNode` | - | Card content |
| `title` | `React.ReactNode` | - | Card title |
| `description` | `React.ReactNode` | - | Card description |
| `icon` | `React.ReactNode` | - | Card icon |
| `variant` | `'default' | 'elevated' | 'outlined' | 'filled'` | `'default'` | Card variant |
| `size` | `'small' | 'medium' | 'large'` | `'medium'` | Card size |
| `padding` | `'none' | 'small' | 'medium' | 'large'` | `'medium'` | Card padding |
| `shadow` | `'none' | 'small' | 'medium' | 'large'` | `'medium'` | Card shadow |
| `hover` | `boolean` | `false` | Enable hover effects |
| `clickable` | `boolean` | `false` | Make card clickable |
| `onClick` | `() => void` | - | Click handler |
| `header` | `React.ReactNode` | - | Custom header content |
| `footer` | `React.ReactNode` | - | Custom footer content |
| `image` | `string` | - | Image URL |
| `imageAlt` | `string` | `''` | Image alt text |
| `imagePosition` | `'top' | 'bottom' | 'left' | 'right'` | `'top'` | Image position |
| `className` | `string` | `''` | Additional CSS classes |
| `style` | `CSSProperties` | `{}` | Inline styles |

## SSR Usage

```tsx
import { fetchCardSSR } from '@luxgen/ui';

// Server-side rendering
const { html, styles } = await fetchCardSSR(tenantId);
```

## Styling

The component uses CSS custom properties for theming:

```css
.card {
  font-family: var(--font-primary);
  color: var(--color-text);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card-default {
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
}

.card-elevated {
  background-color: var(--color-background);
  border: none;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
```

## Variants

- **default**: Standard border and background
- **elevated**: Elevated with shadow, no border
- **outlined**: Transparent background with thick border
- **filled**: Background color with no border

## Sizes

- **small**: Compact size (0.875rem font, 8rem min-height)
- **medium**: Default size (1rem font, 10rem min-height)
- **large**: Large size (1.125rem font, 12rem min-height)

## Interactive Features

### Clickable Cards
```tsx
<Card
  clickable
  onClick={() => handleCardClick()}
>
  Clickable content
</Card>
```

### Hover Effects
```tsx
<Card hover>
  Content with hover effects
</Card>
```

### Image Positioning
```tsx
<Card
  image="image.jpg"
  imagePosition="left"
>
  Content with left image
</Card>
```

## Accessibility

- Proper semantic HTML structure
- Keyboard navigation support
- Screen reader friendly
- Focus management
- ARIA attributes

## Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Card } from '@luxgen/ui';

test('renders with content', () => {
  render(<Card>Test content</Card>);
  
  expect(screen.getByText('Test content')).toBeInTheDocument();
});

test('renders with title', () => {
  render(<Card title="Test Title">Content</Card>);
  
  expect(screen.getByText('Test Title')).toBeInTheDocument();
});

test('calls onClick when clicked', () => {
  const onClick = jest.fn();
  render(<Card clickable onClick={onClick}>Content</Card>);
  
  const card = screen.getByText('Content').closest('.card');
  fireEvent.click(card!);
  
  expect(onClick).toHaveBeenCalledTimes(1);
});
```

## Examples

### Basic Card
```tsx
<Card>
  <div>Simple card content</div>
</Card>
```

### Card with Title and Description
```tsx
<Card
  title="Product Name"
  description="Product description"
>
  <div>Product details</div>
</Card>
```

### Elevated Card
```tsx
<Card variant="elevated" title="Featured Content">
  <div>Elevated card content</div>
</Card>
```

### Clickable Card
```tsx
<Card
  clickable
  onClick={() => navigate('/product/123')}
  title="Product Card"
>
  <div>Click to view product</div>
</Card>
```

### Card with Image
```tsx
<Card
  title="Image Card"
  image="https://example.com/image.jpg"
  imageAlt="Card image"
>
  <div>Card with image</div>
</Card>
```

### Card with Header and Footer
```tsx
<Card
  title="Card Title"
  header={<div>Custom header</div>}
  footer={<div>Custom footer</div>}
>
  <div>Card content</div>
</Card>
```

### Custom Themed Card
```tsx
<Card
  tenantTheme={customTheme}
  title="Themed Card"
>
  <div>Custom themed content</div>
</Card>
```
