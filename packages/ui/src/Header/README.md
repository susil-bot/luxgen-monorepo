# Header Component

A responsive header component with logo and navigation menu support.

## Features

- **SSR Support**: Server-side rendering with theme injection
- **Responsive Design**: Adapts to mobile, tablet, and desktop screens
- **Navigation Menu**: Configurable menu items with click handlers
- **Logo Support**: Optional logo display
- **Theme Integration**: Supports tenant-specific theming
- **Accessibility**: Proper semantic HTML and ARIA attributes

## Usage

```tsx
import { Header } from '@luxgen/ui';

// Basic usage
<Header
  logoUrl="/logo.png"
  menuItems={[
    { id: 'home', label: 'Home', href: '/' },
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
  ]}
/>

// With menu click handler
<Header
  logoUrl="/logo.png"
  menuItems={menuItems}
  onMenuClick={(item) => console.log('Clicked:', item)}
/>

// With custom theme
<Header
  tenantTheme={customTheme}
  logoUrl="/logo.png"
  menuItems={menuItems}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tenantTheme` | `TenantTheme` | `defaultTheme` | Theme object for styling |
| `logoUrl` | `string` | - | URL of the logo image |
| `menuItems` | `MenuItem[]` | `[]` | Array of menu items |
| `onMenuClick` | `(item: MenuItem) => void` | - | Click handler for menu items |
| `className` | `string` | `''` | Additional CSS classes |
| `style` | `CSSProperties` | `{}` | Inline styles |

## MenuItem Interface

```tsx
interface MenuItem {
  id: string;
  label: string;
  href?: string;
  icon?: ReactNode;
  children?: MenuItem[];
}
```

## SSR Usage

```tsx
import { fetchHeaderSSR } from '@luxgen/ui';

// Server-side rendering
const { html, styles } = await fetchHeaderSSR(tenantId);
```

## Styling

The component uses CSS custom properties for theming:

```css
.header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

.header-nav-item {
  color: var(--color-text);
  font-weight: 500;
  transition: all 0.2s ease;
}

.header-nav-item:hover {
  background-color: var(--color-primary);
  color: white;
}
```

## Responsive Design

- **Mobile**: Compact navigation with smaller logo
- **Tablet**: Medium spacing and sizing
- **Desktop**: Full navigation with larger logo

## Accessibility

- Uses semantic `<header>` element
- Proper navigation structure
- Keyboard navigation support
- Screen reader friendly
- Focus management

## Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '@luxgen/ui';

test('renders with menu items', () => {
  const menuItems = [
    { id: 'home', label: 'Home', href: '/' },
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
  ];
  
  render(<Header menuItems={menuItems} />);
  
  expect(screen.getByText('Home')).toBeInTheDocument();
  expect(screen.getByText('Dashboard')).toBeInTheDocument();
});

test('calls onMenuClick when menu item is clicked', () => {
  const mockOnMenuClick = jest.fn();
  const menuItems = [
    { id: 'home', label: 'Home', href: '/' },
  ];
  
  render(
    <Header 
      menuItems={menuItems} 
      onMenuClick={mockOnMenuClick} 
    />
  );
  
  fireEvent.click(screen.getByText('Home'));
  expect(mockOnMenuClick).toHaveBeenCalledWith(menuItems[0]);
});
```

## Examples

### Basic Header
```tsx
<Header
  logoUrl="/logo.png"
  menuItems={[
    { id: 'home', label: 'Home', href: '/' },
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { id: 'courses', label: 'Courses', href: '/courses' },
  ]}
/>
```

### Header with Icons
```tsx
<Header
  logoUrl="/logo.png"
  menuItems={[
    { 
      id: 'home', 
      label: 'Home', 
      href: '/',
      icon: <HomeIcon />
    },
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      href: '/dashboard',
      icon: <DashboardIcon />
    },
  ]}
/>
```

### Header with Menu Click Handler
```tsx
<Header
  logoUrl="/logo.png"
  menuItems={menuItems}
  onMenuClick={(item) => {
    // Handle menu click
    if (item.href) {
      router.push(item.href);
    }
  }}
/>
```
