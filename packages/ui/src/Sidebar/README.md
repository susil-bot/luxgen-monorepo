# Sidebar Component

A collapsible sidebar navigation component with responsive design and theme support.

## Features

- **Collapsible**: Toggle between expanded and collapsed states
- **SSR Support**: Server-side rendering with theme injection
- **Responsive Design**: Adapts to mobile, tablet, and desktop screens
- **Navigation Menu**: Configurable menu items
- **Theme Integration**: Supports tenant-specific theming
- **Accessibility**: Proper semantic HTML and ARIA attributes
- **Smooth Animations**: CSS transitions for state changes

## Usage

```tsx
import { Sidebar } from '@luxgen/ui';

// Basic usage
<Sidebar
  menuItems={[
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { id: 'courses', label: 'Courses', href: '/courses' },
  ]}
/>

// With toggle handler
<Sidebar
  menuItems={menuItems}
  onToggle={(collapsed) => console.log('Sidebar collapsed:', collapsed)}
/>

// With custom theme
<Sidebar
  tenantTheme={customTheme}
  menuItems={menuItems}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tenantTheme` | `TenantTheme` | `defaultTheme` | Theme object for styling |
| `menuItems` | `MenuItem[]` | `[]` | Array of menu items |
| `collapsed` | `boolean` | `false` | Initial collapsed state |
| `onToggle` | `(collapsed: boolean) => void` | - | Toggle handler |
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
import { fetchSidebarSSR } from '@luxgen/ui';

// Server-side rendering
const { html, styles } = await fetchSidebarSSR(tenantId);
```

## Styling

The component uses CSS custom properties for theming:

```css
.sidebar {
  background-color: var(--color-surface);
  border-right: 1px solid var(--color-border);
  transition: width 0.3s ease;
}

.sidebar.collapsed {
  width: 4rem;
}

.sidebar:not(.collapsed) {
  width: 16rem;
}

.sidebar-nav-item {
  color: var(--color-text);
  transition: all 0.2s ease;
}

.sidebar-nav-item:hover {
  background-color: var(--color-primary);
  color: white;
}
```

## Responsive Design

- **Mobile**: Full-width overlay with slide animation
- **Tablet**: Medium width (14rem)
- **Desktop**: Full width (16rem)

## Accessibility

- Uses semantic `<aside>` element
- Proper navigation structure
- Keyboard navigation support
- Screen reader friendly
- ARIA labels for toggle button
- Tooltips for collapsed state

## Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from '@luxgen/ui';

test('renders with menu items', () => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { id: 'courses', label: 'Courses', href: '/courses' },
  ];
  
  render(<Sidebar menuItems={menuItems} />);
  
  expect(screen.getByText('Dashboard')).toBeInTheDocument();
  expect(screen.getByText('Courses')).toBeInTheDocument();
});

test('toggles collapsed state', () => {
  const mockOnToggle = jest.fn();
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
  ];
  
  render(
    <Sidebar 
      menuItems={menuItems} 
      onToggle={mockOnToggle} 
    />
  );
  
  const toggleButton = screen.getByLabelText('Collapse sidebar');
  fireEvent.click(toggleButton);
  
  expect(mockOnToggle).toHaveBeenCalledWith(true);
});
```

## Examples

### Basic Sidebar
```tsx
<Sidebar
  menuItems={[
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { id: 'courses', label: 'Courses', href: '/courses' },
    { id: 'students', label: 'Students', href: '/students' },
  ]}
/>
```

### Collapsed Sidebar
```tsx
<Sidebar
  collapsed={true}
  menuItems={menuItems}
/>
```

### Sidebar with Icons
```tsx
<Sidebar
  menuItems={[
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      href: '/dashboard',
      icon: <DashboardIcon />
    },
    { 
      id: 'courses', 
      label: 'Courses', 
      href: '/courses',
      icon: <CoursesIcon />
    },
  ]}
/>
```

### Sidebar with Toggle Handler
```tsx
<Sidebar
  menuItems={menuItems}
  onToggle={(collapsed) => {
    // Update layout or state based on sidebar state
    setLayout({ sidebarCollapsed: collapsed });
  }}
/>
```
