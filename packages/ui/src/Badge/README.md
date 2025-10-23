# Badge Component

A flexible badge component for displaying status, labels, and notifications with support for different variants, sizes, and shapes.

## Features

- **SSR Support**: Server-side rendering with theme injection
- **Multiple Variants**: Primary, secondary, success, error, warning, and info
- **Flexible Sizing**: Small, medium, and large sizes
- **Shape Options**: Rounded, pill, and square shapes
- **Interactive**: Support for closable badges with close handlers
- **Icon Support**: Display icons alongside badge content
- **Dot Mode**: Simple dot indicator
- **Theme Integration**: Supports tenant-specific theming
- **Responsive Design**: Adapts to different screen sizes

## Usage

```tsx
import { Badge } from '@luxgen/ui';

// Basic usage
<Badge>Default badge</Badge>

// With different variants
<Badge variant="primary">Primary badge</Badge>
<Badge variant="success">Success badge</Badge>
<Badge variant="error">Error badge</Badge>
<Badge variant="warning">Warning badge</Badge>
<Badge variant="info">Info badge</Badge>
<Badge variant="secondary">Secondary badge</Badge>

// With different sizes
<Badge size="small">Small badge</Badge>
<Badge size="medium">Medium badge</Badge>
<Badge size="large">Large badge</Badge>

// With different shapes
<Badge shape="rounded">Rounded badge</Badge>
<Badge shape="pill">Pill badge</Badge>
<Badge shape="square">Square badge</Badge>

// As a dot indicator
<Badge dot />

// With close button
<Badge closable onClose={() => console.log('Closed')}>
  Closable badge
</Badge>

// With icon
<Badge icon="🔖">Badge with icon</Badge>

// With max width
<Badge maxWidth="200px">Badge with max width</Badge>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tenantTheme` | `TenantTheme` | `defaultTheme` | Theme object for styling |
| `children` | `React.ReactNode` | - | Badge content |
| `variant` | `'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'` | `'primary'` | Badge variant |
| `size` | `'small' | 'medium' | 'large'` | `'medium'` | Badge size |
| `shape` | `'rounded' | 'pill' | 'square'` | `'rounded'` | Badge shape |
| `dot` | `boolean` | `false` | Render as a dot indicator |
| `closable` | `boolean` | `false` | Show close button |
| `onClose` | `() => void` | - | Close button handler |
| `icon` | `React.ReactNode` | - | Icon to display |
| `maxWidth` | `string | number` | - | Maximum width |
| `className` | `string` | `''` | Additional CSS classes |
| `style` | `CSSProperties` | `{}` | Inline styles |

## SSR Usage

```tsx
import { fetchBadgeSSR } from '@luxgen/ui';

// Server-side rendering
const { html, styles } = await fetchBadgeSSR(tenantId);
```

## Styling

The component uses CSS custom properties for theming:

```css
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  font-family: var(--font-primary);
  font-weight: 500;
  border: 1px solid;
  transition: all 0.2s ease;
}

.badge-primary {
  color: var(--color-primary);
  background-color: var(--color-primary-20);
  border-color: var(--color-primary-40);
}

.badge-success {
  color: var(--color-success);
  background-color: var(--color-success-20);
  border-color: var(--color-success-40);
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

- **small**: Compact size (0.75rem font, 0.25rem padding)
- **medium**: Default size (0.875rem font, 0.375rem padding)
- **large**: Large size (1rem font, 0.5rem padding)

## Shapes

- **rounded**: Rounded corners (0.375rem border-radius)
- **pill**: Fully rounded (9999px border-radius)
- **square**: No rounding (0 border-radius)

## Interactive Features

### Closable Badges
```tsx
<Badge
  closable
  onClose={() => console.log('Badge closed')}
>
  Closable badge
</Badge>
```

### Dot Indicators
```tsx
<Badge dot />
```

### Icons
```tsx
<Badge icon="🔖">Badge with icon</Badge>
<Badge icon={<Icon name="star" />}>Badge with component icon</Badge>
```

## Accessibility

- Proper ARIA labels for close buttons
- Keyboard navigation support
- Screen reader friendly
- Focus management
- Color contrast compliance

## Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Badge } from '@luxgen/ui';

test('renders with content', () => {
  render(<Badge>Test badge</Badge>);
  
  expect(screen.getByText('Test badge')).toBeInTheDocument();
});

test('renders with different variants', () => {
  render(<Badge variant="success">Success badge</Badge>);
  
  const badge = screen.getByText('Success badge');
  expect(badge).toHaveClass('badge-success');
});

test('calls onClose when close button is clicked', () => {
  const onClose = jest.fn();
  render(<Badge closable onClose={onClose}>Closable badge</Badge>);
  
  const closeButton = screen.getByLabelText('Close badge');
  fireEvent.click(closeButton);
  
  expect(onClose).toHaveBeenCalledTimes(1);
});
```

## Examples

### Status Badges
```tsx
<Badge variant="success">Active</Badge>
<Badge variant="error">Inactive</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="info">Processing</Badge>
```

### Size Variations
```tsx
<Badge size="small">Small</Badge>
<Badge size="medium">Medium</Badge>
<Badge size="large">Large</Badge>
```

### Shape Variations
```tsx
<Badge shape="rounded">Rounded</Badge>
<Badge shape="pill">Pill</Badge>
<Badge shape="square">Square</Badge>
```

### Interactive Badges
```tsx
<Badge closable onClose={() => setShow(false)}>
  Dismissible badge
</Badge>

<Badge icon="🔖">Badge with icon</Badge>
```

### Dot Indicators
```tsx
<Badge dot />
<Badge dot variant="success" />
<Badge dot variant="error" />
```

### Custom Themed Badges
```tsx
<Badge
  tenantTheme={customTheme}
  variant="primary"
>
  Custom themed badge
</Badge>
```

### Complex Content
```tsx
<Badge>
  <Icon name="star" />
  Featured
</Badge>

<Badge variant="success">
  <Icon name="check" />
  Verified
</Badge>
```

### Responsive Badges
```tsx
<Badge maxWidth="200px">
  Long badge content that should be constrained
</Badge>
```
