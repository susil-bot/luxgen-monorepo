---
title: Sidebar
---

A collapsible sidebar navigation component that provides hierarchical navigation with tenant-aware branding. The Sidebar supports multiple sections, expandable items, and responsive behavior.

## Purpose

To provide a consistent navigation experience with hierarchical menu structure, tenant-specific branding, and responsive collapsible behavior.

## Features

- **Hierarchical Navigation**: Support for nested menu items and sections
- **Collapsible Design**: Can be collapsed to save space
- **Tenant-Aware Branding**: Displays tenant logo and applies theme colors
- **Responsive Behavior**: Adapts to different screen sizes
- **User Section**: Optional user information display
- **Active State Management**: Highlights current page/route

## Props

| Property                    | Type                    | Default     | Description                                                                                                                        |
| --------------------------- | ----------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| sections                   | SidebarSection[]        | -           | Required array of sidebar sections                                                                                                |
| user                       | UserMenu                | -           | User information for user section                                                                                                 |
| onUserAction               | Function                | -           | Callback for user actions (profile, settings, logout)                                                                             |
| logo                       | Object                  | -           | Logo configuration (src, alt, text, href)                                                                                         |
| className                  | String                  | ''          | Additional CSS classes                                                                                                             |
| variant                    | String                  | 'default'   | Sidebar variant ('default', 'compact', 'minimal')                                                                                |
| position                   | String                  | 'static'    | Sidebar position ('fixed', 'absolute', 'static')                                                                                 |
| width                      | String                  | 'normal'    | Sidebar width ('normal', 'wide', 'narrow')                                                                                        |
| collapsible                | Boolean                 | true        | Allow sidebar to be collapsed                                                                                                     |
| defaultCollapsed           | Boolean                 | false       | Start with sidebar collapsed                                                                                                       |
| showUserSection            | Boolean                 | true        | Show user section at bottom                                                                                                        |
| showLogo                   | Boolean                 | true        | Show logo at top                                                                                                                   |
| responsive                 | Boolean                 | true        | Enable responsive behavior                                                                                                         |
| mobileBreakpoint           | Number                  | 640         | Mobile breakpoint in pixels                                                                                                        |
| tabletBreakpoint           | Number                  | 768         | Tablet breakpoint in pixels                                                                                                       |
| desktopBreakpoint          | Number                  | 1024        | Desktop breakpoint in pixels                                                                                                      |

## Component Usage

### Basic Usage

```jsx
import { Sidebar } from '@luxgen/ui';

const sections = [
  {
    id: 'main',
    title: 'Main Navigation',
    items: [
      { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
      { id: 'users', label: 'Users', href: '/users' }
    ]
  }
];

<Sidebar
  sections={sections}
  user={user}
  onUserAction={handleUserAction}
/>
```

### With Nested Items

```jsx
const sections = [
  {
    id: 'main',
    title: 'Main Navigation',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/dashboard',
        icon: <DashboardIcon />
      },
      {
        id: 'users',
        label: 'Users',
        href: '/users',
        icon: <UsersIcon />,
        children: [
          { id: 'user-list', label: 'User List', href: '/users/list' },
          { id: 'user-roles', label: 'User Roles', href: '/users/roles' }
        ]
      }
    ]
  }
];

<Sidebar
  sections={sections}
  user={user}
  onUserAction={handleUserAction}
/>
```

### With Multiple Sections

```jsx
const sections = [
  {
    id: 'main',
    title: 'Main Navigation',
    items: [
      { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
      { id: 'users', label: 'Users', href: '/users' }
    ]
  },
  {
    id: 'settings',
    title: 'Settings',
    items: [
      { id: 'profile', label: 'Profile', href: '/profile' },
      { id: 'preferences', label: 'Preferences', href: '/preferences' }
    ]
  }
];

<Sidebar
  sections={sections}
  user={user}
  onUserAction={handleUserAction}
/>
```

## SidebarSection Interface

```typescript
interface SidebarSection {
  id: string;                    // Unique section identifier
  title?: string;               // Optional section title
  items: SidebarItem[];         // Array of sidebar items
  collapsible?: boolean;        // Allow section to be collapsed
  defaultCollapsed?: boolean;    // Start with section collapsed
}
```

## SidebarItem Interface

```typescript
interface SidebarItem {
  id: string;                    // Unique item identifier
  label: string;                 // Display text
  href?: string;                 // Link URL
  icon?: React.ReactNode;        // Optional icon
  badge?: string | number;       // Optional badge
  children?: SidebarItem[];      // Nested items
  external?: boolean;            // External link
  disabled?: boolean;            // Disabled state
  active?: boolean;              // Active state
  onClick?: () => void;         // Click handler
}
```

## Styling Variants

### Default Variant

```jsx
<Sidebar variant="default" />
```

- Standard width (256px)
- White background
- Right border
- Standard spacing

### Compact Variant

```jsx
<Sidebar variant="compact" />
```

- Narrower width (192px)
- Smaller text and icons
- Reduced spacing
- More items visible

### Minimal Variant

```jsx
<Sidebar variant="minimal" />
```

- Transparent background
- No borders
- Minimal styling
- Clean appearance

## Width Options

### Normal Width

```jsx
<Sidebar width="normal" />
```

- 256px width when expanded
- 64px width when collapsed

### Wide Width

```jsx
<Sidebar width="wide" />
```

- 320px width when expanded
- 64px width when collapsed

### Narrow Width

```jsx
<Sidebar width="narrow" />
```

- 192px width when expanded
- 64px width when collapsed

## Position Options

### Fixed Position

```jsx
<Sidebar position="fixed" />
```

- Fixed to viewport
- Overlays content
- Requires margin-left on content

### Absolute Position

```jsx
<Sidebar position="absolute" />
```

- Positioned relative to parent
- Overlays content
- Use within positioned container

### Static Position

```jsx
<Sidebar position="static" />
```

- Normal document flow
- Part of layout
- Recommended for most use cases

## Collapsible Behavior

### Collapsible Sidebar

```jsx
<Sidebar
  collapsible={true}
  defaultCollapsed={false}
/>
```

- Toggle button in header
- Smooth collapse animation
- Icon-only mode when collapsed

### Non-Collapsible Sidebar

```jsx
<Sidebar
  collapsible={false}
/>
```

- Always expanded
- No toggle button
- Consistent width

## User Section

### With User Information

```jsx
<Sidebar
  showUserSection={true}
  user={{
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    avatar: '/avatar.jpg'
  }}
  onUserAction={handleUserAction}
/>
```

### User Actions

The `onUserAction` callback receives the following actions:

- `'profile'`: User clicked on profile
- `'settings'`: User clicked on settings
- `'logout'`: User clicked on logout

## Logo Section

### With Logo

```jsx
<Sidebar
  showLogo={true}
  logo={{
    src: '/logo.png',
    alt: 'Company Logo',
    text: 'My Company',
    href: '/'
  }}
/>
```

### Logo Behavior

- **Expanded**: Shows logo image and text
- **Collapsed**: Shows only logo image or first letter
- **Clickable**: Links to home page
- **Theme-aware**: Uses tenant colors

## Responsive Design

### Desktop Behavior (≥1024px)

- Full sidebar visible
- All features available
- Collapsible if enabled

### Tablet Behavior (768px-1023px)

- Sidebar may be hidden
- Touch-friendly interface
- Simplified navigation

### Mobile Behavior (<768px)

- Overlay sidebar
- Touch gestures
- Simplified interface

## Active State Management

### Automatic Active Detection

The sidebar automatically detects the active item based on the current URL:

```jsx
// Current URL: /users/list
// Active item: { id: 'user-list', href: '/users/list' }
```

### Manual Active State

```jsx
const sections = [
  {
    id: 'main',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/dashboard',
        active: true  // Manually set as active
      }
    ]
  }
];
```

## Icons and Badges

### With Icons

```jsx
import { DashboardIcon, UsersIcon } from '@luxgen/ui';

const sections = [
  {
    id: 'main',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/dashboard',
        icon: <DashboardIcon />
      },
      {
        id: 'users',
        label: 'Users',
        href: '/users',
        icon: <UsersIcon />
      }
    ]
  }
];
```

### With Badges

```jsx
const sections = [
  {
    id: 'main',
    items: [
      {
        id: 'notifications',
        label: 'Notifications',
        href: '/notifications',
        badge: 5
      },
      {
        id: 'messages',
        label: 'Messages',
        href: '/messages',
        badge: 'New'
      }
    ]
  }
];
```

## External Links

### External Link Handling

```jsx
const sections = [
  {
    id: 'main',
    items: [
      {
        id: 'external-docs',
        label: 'Documentation',
        href: 'https://docs.example.com',
        external: true
      }
    ]
  }
];
```

External links open in a new tab automatically.

## Disabled Items

### Disabled State

```jsx
const sections = [
  {
    id: 'main',
    items: [
      {
        id: 'feature',
        label: 'Coming Soon',
        href: '/feature',
        disabled: true
      }
    ]
  }
];
```

Disabled items are not clickable and have reduced opacity.

## Click Handlers

### Custom Click Handlers

```jsx
const sections = [
  {
    id: 'main',
    items: [
      {
        id: 'custom-action',
        label: 'Custom Action',
        onClick: () => {
          console.log('Custom action clicked');
          // Handle custom logic
        }
      }
    ]
  }
];
```

## Examples

### Complete Example

```jsx
import React from 'react';
import { Sidebar } from '@luxgen/ui';
import { 
  DashboardIcon, 
  UsersIcon, 
  SettingsIcon,
  LogoutIcon 
} from '@luxgen/ui';

const MySidebar = () => {
  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    avatar: '/avatar.jpg'
  };

  const handleUserAction = (action) => {
    switch (action) {
      case 'profile':
        router.push('/profile');
        break;
      case 'settings':
        router.push('/settings');
        break;
      case 'logout':
        localStorage.removeItem('authToken');
        router.push('/login');
        break;
    }
  };

  const sections = [
    {
      id: 'main',
      title: 'Main Navigation',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          href: '/dashboard',
          icon: <DashboardIcon />
        },
        {
          id: 'users',
          label: 'Users',
          href: '/users',
          icon: <UsersIcon />,
          children: [
            { id: 'user-list', label: 'User List', href: '/users/list' },
            { id: 'user-roles', label: 'User Roles', href: '/users/roles' }
          ]
        }
      ]
    },
    {
      id: 'settings',
      title: 'Settings',
      items: [
        {
          id: 'profile',
          label: 'Profile',
          href: '/profile',
          icon: <SettingsIcon />
        }
      ]
    }
  ];

  return (
    <Sidebar
      sections={sections}
      user={user}
      onUserAction={handleUserAction}
      variant="default"
      position="fixed"
      width="normal"
      collapsible={true}
      defaultCollapsed={false}
      showUserSection={true}
      showLogo={true}
    />
  );
};

export default MySidebar;
```

### With Custom Styling

```jsx
<Sidebar
  className="custom-sidebar"
  sections={sections}
  user={user}
  onUserAction={handleUserAction}
  style={{
    backgroundColor: 'var(--color-surface)',
    borderRight: '1px solid var(--color-border)'
  }}
/>
```

## Troubleshooting

### Common Issues

1. **Items not clickable**: Check `href` or `onClick` props
2. **Active state not working**: Verify URL matching logic
3. **Collapse not working**: Check `collapsible` prop
4. **Icons not showing**: Verify icon components are imported

### Debug Steps

1. Check console for navigation logs
2. Verify section and item structure
3. Test click handlers
4. Check responsive behavior