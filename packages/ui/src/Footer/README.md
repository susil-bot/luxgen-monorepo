# Footer Component

A responsive footer component with links and copyright information.

## Features

- **SSR Support**: Server-side rendering with theme injection
- **Responsive Design**: Adapts to mobile, tablet, and desktop screens
- **Link Navigation**: Configurable footer links
- **Theme Integration**: Supports tenant-specific theming
- **Accessibility**: Proper semantic HTML structure
- **Flexible Layout**: Centered content with responsive navigation

## Usage

```tsx
import { Footer } from '@luxgen/ui';

// Basic usage
<Footer
  links={[
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Contact', href: '/contact' },
  ]}
  copyright="© 2024 LuxGen. All rights reserved."
/>

// Without links
<Footer copyright="© 2024 My Company. All rights reserved." />

// With custom theme
<Footer
  tenantTheme={customTheme}
  links={links}
  copyright={copyright}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tenantTheme` | `TenantTheme` | `defaultTheme` | Theme object for styling |
| `links` | `FooterLink[]` | `[]` | Array of footer links |
| `copyright` | `string` | `'© 2024 LuxGen. All rights reserved.'` | Copyright text |
| `className` | `string` | `''` | Additional CSS classes |
| `style` | `CSSProperties` | `{}` | Inline styles |

## FooterLink Interface

```tsx
interface FooterLink {
  label: string;
  href: string;
}
```

## SSR Usage

```tsx
import { fetchFooterSSR } from '@luxgen/ui';

// Server-side rendering
const { html, styles } = await fetchFooterSSR(tenantId);
```

## Styling

The component uses CSS custom properties for theming:

```css
.footer {
  background-color: var(--color-surface);
  border-top: 1px solid var(--color-border);
  color: var(--color-text-secondary);
}

.footer-link {
  color: inherit;
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: var(--color-primary);
}
```

## Responsive Design

- **Mobile**: Vertical link layout with smaller text
- **Tablet**: Medium spacing and sizing
- **Desktop**: Horizontal link layout with full spacing

## Accessibility

- Uses semantic `<footer>` element
- Proper link structure
- Screen reader friendly
- Keyboard navigation support
- High contrast support

## Testing

```tsx
import { render, screen } from '@testing-library/react';
import { Footer } from '@luxgen/ui';

test('renders with links and copyright', () => {
  const links = [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ];
  
  render(
    <Footer 
      links={links} 
      copyright="© 2024 My Company. All rights reserved." 
    />
  );
  
  expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
  expect(screen.getByText('Terms of Service')).toBeInTheDocument();
  expect(screen.getByText('© 2024 My Company. All rights reserved.')).toBeInTheDocument();
});
```

## Examples

### Basic Footer
```tsx
<Footer
  links={[
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Contact', href: '/contact' },
  ]}
/>
```

### Footer with Many Links
```tsx
<Footer
  links={[
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Contact', href: '/contact' },
    { label: 'Help', href: '/help' },
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Support', href: '/support' },
  ]}
/>
```

### Footer with Custom Copyright
```tsx
<Footer
  links={links}
  copyright="© 2024 My Company. Made with ❤️"
/>
```

### Footer without Links
```tsx
<Footer copyright="© 2024 Simple Company. All rights reserved." />
```
