# PageWrapper Component

A main wrapper component for pages that provides consistent styling and layout across the application.

## Features

- **SSR Support**: Server-side rendering with theme injection
- **Theme Integration**: Supports tenant-specific theming
- **Responsive Design**: Adapts to different screen sizes
- **Accessibility**: Proper semantic HTML structure
- **Customizable**: Flexible padding and styling options

## Usage

```tsx
import { PageWrapper } from '@luxgen/ui';

// Basic usage
<PageWrapper>
  <h1>My Page Content</h1>
</PageWrapper>

// With custom padding
<PageWrapper padding="2rem">
  <h1>My Page Content</h1>
</PageWrapper>

// With custom theme
<PageWrapper tenantTheme={customTheme}>
  <h1>My Page Content</h1>
</PageWrapper>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tenantTheme` | `TenantTheme` | `defaultTheme` | Theme object for styling |
| `padding` | `string` | `'1rem'` | Padding for the wrapper |
| `className` | `string` | `''` | Additional CSS classes |
| `style` | `CSSProperties` | `{}` | Inline styles |
| `children` | `ReactNode` | - | Content to render |

## SSR Usage

```tsx
import { fetchPageWrapperSSR } from '@luxgen/ui';

// Server-side rendering
const { html, styles } = await fetchPageWrapperSSR(tenantId);
```

## Styling

The component uses CSS custom properties for theming:

```css
.page-wrapper {
  min-height: 100vh;
  width: 100%;
  background-color: var(--color-background);
  color: var(--color-text);
  font-family: var(--font-primary);
  padding: var(--spacing-md);
}
```

## Accessibility

- Uses semantic HTML structure
- Supports screen readers
- Maintains proper focus management
- Responsive design for all devices

## Testing

```tsx
import { render, screen } from '@testing-library/react';
import { PageWrapper } from '@luxgen/ui';

test('renders with default props', () => {
  render(<PageWrapper>Content</PageWrapper>);
  expect(screen.getByText('Content')).toBeInTheDocument();
});
```

## Examples

### Basic Page
```tsx
<PageWrapper>
  <Header />
  <main>
    <h1>Welcome to LuxGen</h1>
    <p>Your learning management system</p>
  </main>
  <Footer />
</PageWrapper>
```

### With Custom Theme
```tsx
const customTheme = {
  colors: {
    primary: '#8B5CF6',
    background: '#F3F4F6',
    // ... other theme properties
  },
  // ... other theme properties
};

<PageWrapper tenantTheme={customTheme}>
  <h1>Custom Themed Page</h1>
</PageWrapper>
```

### With Custom Padding
```tsx
<PageWrapper padding="2rem">
  <h1>Page with more padding</h1>
</PageWrapper>
```
