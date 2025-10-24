# Sidebar Component

A comprehensive, responsive sidebar component with sub-menu support, optimized for performance with separate components for sub-menu items.

## Features

- **Responsive Design**: Mobile-first approach with collapsible sidebar
- **Sub-menu Support**: Nested navigation with expandable sections
- **Performance Optimized**: Separate components for sub-menu items
- **Tenant Theming**: Supports custom tenant colors and branding
- **User Management**: User section with profile, settings, and logout actions
- **Accessibility**: Full keyboard navigation and screen reader support
- **Multiple Variants**: Default, compact, and minimal variants
- **Flexible Positioning**: Fixed, sticky, or static positioning options
- **Context Management**: SidebarProvider for global state management

## Usage

### Basic Usage

```tsx
import { Sidebar, SidebarSection } from '@luxgen/ui';

const sections: SidebarSection[] = [
  {
    id: 'main',
    title: 'Main Navigation',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/dashboard',
        icon: <DashboardIcon />,
      },
      {
        id: 'courses',
        label: 'Courses',
        href: '/courses',
        icon: <CoursesIcon />,
        children: [
          {
            id: 'all-courses',
            label: 'All Courses',
            href: '/courses/all',
          },
          {
            id: 'my-courses',
            label: 'My Courses',
            href: '/courses/my',
          },
        ],
      },
    ],
  },
];

<Sidebar
  sections={sections}
  logo={{
    text: 'LuxGen',
    href: '/',
  }}
  collapsible={true}
  defaultCollapsed={false}
/>
```

### With User Section

```tsx
const user = {
  name: 'John Doe',
  email: 'john@example.com',
  role: 'Admin',
  avatar: '/path/to/avatar.jpg',
};

<Sidebar
  sections={sections}
  user={user}
  onUserAction={(action) => {
    switch (action) {
      case 'profile':
        router.push('/profile');
        break;
      case 'settings':
        router.push('/settings');
        break;
      case 'logout':
        handleLogout();
        break;
    }
  }}
/>
```

### With Context Provider

```tsx
import { SidebarProvider, useSidebar } from '@luxgen/ui';

function App() {
  return (
    <SidebarProvider
      defaultCollapsed={false}
      onItemClick={(item) => console.log('Item clicked:', item)}
      onUserAction={(action) => console.log('User action:', action)}
    >
      <Sidebar sections={sections} />
    </SidebarProvider>
  );
}
```

### Different Variants

```tsx
// Compact sidebar
<Sidebar
  variant="compact"
  sections={sections}
  width="narrow"
/>

// Minimal sidebar
<Sidebar
  variant="minimal"
  sections={sections}
  width="narrow"
/>

// Default sidebar
<Sidebar
  variant="default"
  sections={sections}
  width="normal"
/>
```

## Components

### Sidebar

Main sidebar component with full functionality.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `sections` | `SidebarSection[]` | `[]` | Array of sidebar sections |
| `logo` | `LogoConfig` | `{text: 'LuxGen', href: '/'}` | Logo configuration |
| `user` | `UserInfo \| null` | `null` | User information |
| `onUserAction` | `(action: string) => void` | - | User action handler |
| `className` | `string` | `''` | Additional CSS classes |
| `variant` | `'default' \| 'compact' \| 'minimal'` | `'default'` | Visual variant |
| `position` | `'fixed' \| 'sticky' \| 'static'` | `'fixed'` | Positioning type |
| `width` | `'narrow' \| 'normal' \| 'wide'` | `'normal'` | Sidebar width |
| `showUserSection` | `boolean` | `true` | Show user section |
| `showLogo` | `boolean` | `true` | Show logo section |
| `collapsible` | `boolean` | `true` | Allow collapsing |
| `defaultCollapsed` | `boolean` | `false` | Start collapsed |
| `onToggle` | `(collapsed: boolean) => void` | - | Toggle handler |
| `onItemClick` | `(item: SidebarItem) => void` | - | Item click handler |

### SidebarItem

Individual sidebar item component with sub-menu support.

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `item` | `SidebarItem` | Item configuration |
| `isActive` | `boolean` | Active state |
| `isCollapsed` | `boolean` | Collapsed state |
| `onClick` | `() => void` | Click handler |
| `variant` | `string` | Visual variant |
| `depth` | `number` | Nesting depth |
| `className` | `string` | Additional CSS classes |

### SidebarSection

Sidebar section component for organizing items.

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `section` | `SidebarSection` | Section configuration |
| `isExpanded` | `boolean` | Expanded state |
| `isCollapsed` | `boolean` | Collapsed state |
| `onToggle` | `() => void` | Toggle handler |
| `onItemClick` | `(item: SidebarItem) => void` | Item click handler |
| `variant` | `string` | Visual variant |
| `className` | `string` | Additional CSS classes |

### SidebarProvider

Context provider for sidebar state management.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Child components |
| `defaultCollapsed` | `boolean` | `false` | Start collapsed |
| `onItemClick` | `(item: SidebarItem) => void` | - | Item click handler |
| `onUserAction` | `(action: string) => void` | - | User action handler |
| `onToggle` | `(collapsed: boolean) => void` | - | Toggle handler |

## Data Types

### SidebarItem

```typescript
interface SidebarItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  badge?: string | number;
  children?: SidebarItem[];
  external?: boolean;
  disabled?: boolean;
  active?: boolean;
  onClick?: () => void;
}
```

### SidebarSection

```typescript
interface SidebarSection {
  id: string;
  title?: string;
  items: SidebarItem[];
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}
```

## Performance Optimization

### Separate Components

The sidebar uses separate components for sub-menu items to improve performance:

- **SidebarItem**: Memoized component for individual items
- **SidebarSection**: Memoized component for sections
- **SidebarProvider**: Context-based state management

### Memoization

```tsx
// SidebarItem is memoized to prevent unnecessary re-renders
const SidebarItem = memo(SidebarItemComponent);

// SidebarSection is memoized for section-level optimization
const SidebarSection = memo(SidebarSectionComponent);
```

### Context Management

```tsx
// Use context for global sidebar state
const { isCollapsed, toggleCollapsed, expandedSections } = useSidebar();
```

## Styling

### Custom Styling

```tsx
<Sidebar
  className="custom-sidebar border-r-2 border-green-500"
  sections={sections}
/>
```

### Tenant Theming

```tsx
const customTheme = {
  colors: {
    primary: '#10b981',
    secondary: '#6b7280',
  },
};

<Sidebar
  tenantTheme={customTheme}
  sections={sections}
/>
```

## Accessibility

- Full keyboard navigation support
- Screen reader compatible
- ARIA labels and roles
- Focus management
- High contrast support

## Responsive Behavior

- **Desktop**: Full sidebar with all features
- **Tablet**: Collapsible sidebar with touch support
- **Mobile**: Minimal sidebar with essential navigation

## Examples

### Dashboard Sidebar

```tsx
const dashboardSections: SidebarSection[] = [
  {
    id: 'main',
    title: 'Main',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/dashboard',
        icon: <DashboardIcon />,
      },
      {
        id: 'analytics',
        label: 'Analytics',
        href: '/analytics',
        icon: <AnalyticsIcon />,
      },
    ],
  },
  {
    id: 'content',
    title: 'Content',
    items: [
      {
        id: 'courses',
        label: 'Courses',
        href: '/courses',
        icon: <CoursesIcon />,
        children: [
          {
            id: 'all-courses',
            label: 'All Courses',
            href: '/courses/all',
          },
          {
            id: 'my-courses',
            label: 'My Courses',
            href: '/courses/my',
          },
        ],
      },
    ],
  },
];

<Sidebar
  sections={dashboardSections}
  user={user}
  onUserAction={handleUserAction}
  collapsible={true}
  variant="default"
  width="normal"
/>
```

### Compact Sidebar

```tsx
<Sidebar
  sections={sections}
  variant="compact"
  width="narrow"
  collapsible={true}
  defaultCollapsed={true}
/>
```

## Best Practices

1. **Use separate components** for sub-menu items to improve performance
2. **Memoize components** to prevent unnecessary re-renders
3. **Use context** for global sidebar state management
4. **Keep sections organized** with clear titles and logical grouping
5. **Test accessibility** with keyboard navigation and screen readers
6. **Optimize for mobile** with touch-friendly navigation
7. **Use consistent icons** for better visual hierarchy
8. **Limit nesting depth** to avoid complex navigation structures