# NavBar Component

A comprehensive, responsive navigation bar component with tenant theming, user management, and modern UI features.

## Features

- **Responsive Design**: Mobile-first approach with collapsible mobile menu
- **Tenant Theming**: Supports custom tenant colors and branding
- **User Management**: User menu with profile, settings, and logout actions
- **Search Integration**: Optional search bar with custom handlers
- **Notifications**: Optional notification bell with count badge
- **Navigation Items**: Support for dropdown menus and external links
- **Accessibility**: Full keyboard navigation and screen reader support
- **Multiple Variants**: Default, transparent, and solid variants
- **Positioning**: Fixed, sticky, or static positioning options

## Usage

### Basic Usage

```tsx
import { NavBar, NavItem } from '@luxgen/ui';

const items: NavItem[] = [
  {
    id: 'home',
    label: 'Home',
    href: '/',
  },
  {
    id: 'about',
    label: 'About',
    href: '/about',
  },
  {
    id: 'services',
    label: 'Services',
    href: '/services',
    children: [
      {
        id: 'web-dev',
        label: 'Web Development',
        href: '/services/web-development',
      },
      {
        id: 'mobile-dev',
        label: 'Mobile Development',
        href: '/services/mobile-development',
      },
    ],
  },
];

<NavBar
  items={items}
  logo={{
    text: 'LuxGen',
    href: '/',
  }}
  showSearch={true}
  showNotifications={true}
  notificationCount={3}
/>
```

### With User Menu

```tsx
const user = {
  name: 'John Doe',
  email: 'john@example.com',
  role: 'Admin',
  tenant: {
    name: 'Demo Platform',
    subdomain: 'demo',
  },
};

<NavBar
  items={items}
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

### With Search

```tsx
<NavBar
  items={items}
  showSearch={true}
  searchPlaceholder="Search products..."
  onSearch={(query) => {
    console.log('Search query:', query);
    // Handle search logic
  }}
/>
```

### Different Variants

```tsx
// Transparent navbar (great for landing pages)
<NavBar
  variant="transparent"
  position="fixed"
  items={items}
/>

// Solid dark navbar
<NavBar
  variant="solid"
  items={items}
  user={user}
/>

// Default navbar
<NavBar
  variant="default"
  position="sticky"
  items={items}
/>
```

## Props

### NavBarProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tenantTheme` | `TenantTheme` | `defaultTheme` | Tenant-specific theme configuration |
| `logo` | `LogoConfig` | `{text: 'LuxGen', href: '/'}` | Logo configuration |
| `items` | `NavItem[]` | `[]` | Navigation items array |
| `user` | `UserMenu \| null` | `null` | User information for user menu |
| `onUserAction` | `(action: string) => void` | - | Callback for user actions |
| `onMobileMenuToggle` | `(isOpen: boolean) => void` | - | Callback for mobile menu toggle |
| `className` | `string` | `''` | Additional CSS classes |
| `variant` | `'default' \| 'transparent' \| 'solid'` | `'default'` | Visual variant |
| `position` | `'fixed' \| 'sticky' \| 'static'` | `'sticky'` | Positioning type |
| `showUserMenu` | `boolean` | `true` | Show user menu |
| `showMobileMenu` | `boolean` | `true` | Show mobile menu button |
| `showSearch` | `boolean` | `false` | Show search bar |
| `onSearch` | `(query: string) => void` | - | Search handler |
| `searchPlaceholder` | `string` | `'Search...'` | Search placeholder text |
| `showNotifications` | `boolean` | `false` | Show notifications bell |
| `notificationCount` | `number` | `0` | Notification count badge |
| `onNotificationClick` | `() => void` | - | Notification click handler |

### NavItem

| Prop | Type | Description |
|------|------|-------------|
| `id` | `string` | Unique identifier |
| `label` | `string` | Display text |
| `href` | `string` | Navigation URL |
| `icon` | `React.ReactNode` | Optional icon |
| `badge` | `string \| number` | Optional badge |
| `children` | `NavItem[]` | Dropdown menu items |
| `external` | `boolean` | Open in new tab |
| `disabled` | `boolean` | Disable the item |

### UserMenu

| Prop | Type | Description |
|------|------|-------------|
| `avatar` | `string` | User avatar URL |
| `name` | `string` | User's full name |
| `email` | `string` | User's email |
| `role` | `string` | User's role |
| `tenant` | `TenantInfo` | Tenant information |

## Styling

The NavBar component uses Tailwind CSS classes and supports custom styling through the `className` prop. It also respects tenant theme configurations for consistent branding.

### Custom Styling

```tsx
<NavBar
  className="custom-navbar border-b-2 border-green-500"
  items={items}
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

<NavBar
  tenantTheme={customTheme}
  items={items}
/>
```

## Accessibility

- Full keyboard navigation support
- Screen reader compatible
- ARIA labels and roles
- Focus management
- High contrast support

## Responsive Behavior

- **Desktop**: Full navigation with dropdowns and user menu
- **Tablet**: Collapsible navigation with mobile menu
- **Mobile**: Hamburger menu with slide-out navigation

## Examples

### E-commerce NavBar

```tsx
const ecommerceItems: NavItem[] = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'products', label: 'Products', href: '/products' },
  { id: 'categories', label: 'Categories', href: '/categories' },
  { id: 'about', label: 'About', href: '/about' },
  { id: 'contact', label: 'Contact', href: '/contact' },
];

<NavBar
  items={ecommerceItems}
  showSearch={true}
  searchPlaceholder="Search products..."
  showNotifications={true}
  notificationCount={5}
  user={user}
  onUserAction={handleUserAction}
/>
```

### Landing Page NavBar

```tsx
<NavBar
  variant="transparent"
  position="fixed"
  items={landingItems}
  logo={{
    text: 'LuxGen',
    href: '/',
  }}
  showUserMenu={false}
  showSearch={false}
/>
```

## Best Practices

1. **Keep navigation items concise** - Use clear, descriptive labels
2. **Limit dropdown items** - Too many items can overwhelm users
3. **Use badges sparingly** - Only for important notifications
4. **Test mobile experience** - Ensure touch targets are adequate
5. **Consider accessibility** - Use proper ARIA labels and keyboard navigation
6. **Optimize for performance** - Lazy load dropdown content if needed
