---
title: NavBar
---

A responsive navigation bar component that provides tenant-aware branding, user authentication, search functionality, and notifications. The NavBar automatically adapts to different screen sizes and applies tenant-specific theming.

## Purpose

To provide a consistent navigation experience across all pages with tenant-specific branding, user management, and interactive features.

## Features

- **Tenant-Aware Branding**: Automatically displays tenant logo and colors
- **Responsive Design**: Adapts to mobile, tablet, and desktop
- **User Authentication**: User menu with profile, settings, and logout
- **Search Functionality**: Optional search bar with custom handlers
- **Notifications**: Optional notification bell with badge count
- **Mobile Menu**: Hamburger menu for mobile devices

## Props

| Property                    | Type                    | Default     | Description                                                                                                                        |
| --------------------------- | ----------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| logo                        | Object                  | -           | Logo configuration (src, alt, text, href)                                                                                         |
| user                        | UserMenu                | null        | User information for authentication                                                                                               |
| onUserAction                | Function                | -           | Callback for user actions (profile, settings, logout)                                                                             |
| onMobileMenuToggle          | Function                | -           | Callback for mobile menu toggle                                                                                                   |
| className                   | String                  | ''          | Additional CSS classes                                                                                                             |
| variant                     | String                  | 'default'   | NavBar variant ('default', 'transparent', 'solid', 'minimal')                                                                     |
| position                    | String                  | 'sticky'    | NavBar position ('fixed', 'sticky', 'static')                                                                                     |
| showUserMenu                | Boolean                 | true        | Show user menu                                                                                                                     |
| showMobileMenu              | Boolean                 | true        | Show mobile menu button                                                                                                            |
| showSearch                  | Boolean                 | false       | Show search bar                                                                                                                     |
| onSearch                    | Function                | -           | Callback for search functionality                                                                                                  |
| searchPlaceholder           | String                  | 'Search...' | Placeholder text for search input                                                                                                  |
| showNotifications           | Boolean                 | false       | Show notifications                                                                                                                  |
| notificationCount           | Number                  | 0           | Number of notifications to display                                                                                                 |
| onNotificationClick         | Function                | -           | Callback for notification interactions                                                                                              |
| responsive                  | Boolean                 | true        | Enable responsive behavior                                                                                                          |
| mobileBreakpoint            | Number                  | 640         | Mobile breakpoint in pixels                                                                                                        |
| tabletBreakpoint            | Number                  | 768         | Tablet breakpoint in pixels                                                                                                        |
| desktopBreakpoint           | Number                  | 1024        | Desktop breakpoint in pixels                                                                                                       |

## Component Usage

### Basic Usage

```jsx
import { NavBar } from '@luxgen/ui';

<NavBar
  user={user}
  onUserAction={handleUserAction}
  showSearch={true}
  onSearch={handleSearch}
  showNotifications={true}
  notificationCount={3}
  onNotificationClick={handleNotificationClick}
/>
```

### With Custom Logo

```jsx
<NavBar
  logo={{
    src: '/logo.png',
    alt: 'Company Logo',
    text: 'My Company',
    href: '/'
  }}
  user={user}
  onUserAction={handleUserAction}
/>
```

### With Search Functionality

```jsx
const handleSearch = (query) => {
  console.log('Search query:', query);
  // Implement search logic
};

<NavBar
  showSearch={true}
  onSearch={handleSearch}
  searchPlaceholder="Search products..."
  user={user}
  onUserAction={handleUserAction}
/>
```

### With Notifications

```jsx
const handleNotificationClick = () => {
  console.log('Notifications clicked');
  // Navigate to notifications page
};

<NavBar
  showNotifications={true}
  notificationCount={5}
  onNotificationClick={handleNotificationClick}
  user={user}
  onUserAction={handleUserAction}
/>
```

## User Menu

### UserMenu Interface

```typescript
interface UserMenu {
  avatar?: string;           // User avatar image URL
  name: string;              // User's full name
  email: string;             // User's email address
  role?: string;             // User's role (Admin, User, etc.)
  tenant?: {                 // Tenant information
    name: string;
    subdomain: string;
  };
}
```

### User Actions

The `onUserAction` callback receives the following actions:

- `'profile'`: User clicked "Your Profile"
- `'settings'`: User clicked "Settings"  
- `'logout'`: User clicked "Sign out"

```jsx
const handleUserAction = (action) => {
  switch (action) {
    case 'profile':
      router.push('/profile');
      break;
    case 'settings':
      router.push('/settings');
      break;
    case 'logout':
      // Clear authentication
      localStorage.removeItem('authToken');
      router.push('/login');
      break;
  }
};
```

## Responsive Design

### Desktop Layout (≥1024px)

```
[Logo]                    [Search Bar]              [Notifications] [User Menu]
```

### Tablet Layout (768px-1023px)

```
[Logo]                                    [Notifications] [User Menu]
```

### Mobile Layout (<768px)

```
[Logo]                                    [User Menu] [☰]
```

## Styling Variants

### Default Variant

```jsx
<NavBar variant="default" />
```

- White background
- Bottom border
- Subtle shadow

### Transparent Variant

```jsx
<NavBar variant="transparent" />
```

- Transparent background
- White text
- No border or shadow

### Solid Variant

```jsx
<NavBar variant="solid" />
```

- Primary color background
- White text
- Medium shadow

### Minimal Variant

```jsx
<NavBar variant="minimal" />
```

- White background
- No border or shadow
- Clean appearance

## Position Options

### Fixed Position

```jsx
<NavBar position="fixed" />
```

- Always visible at top
- Overlays content
- Requires padding-top on content

### Sticky Position

```jsx
<NavBar position="sticky" />
```

- Sticks to top when scrolling
- Part of document flow
- Recommended for most use cases

### Static Position

```jsx
<NavBar position="static" />
```

- Normal document flow
- Scrolls with content
- Use for embedded navigation

## Tenant Integration

### Automatic Logo Detection

The NavBar automatically uses tenant-specific branding:

```javascript
// Demo tenant
{
  branding: {
    logo: {
      text: 'LuxGen',
      href: '/'
    }
  }
}

// Idea Vibes tenant  
{
  branding: {
    logo: {
      text: 'Idea Vibes',
      href: '/'
    }
  }
}
```

### Theme Colors

Logo text color automatically uses the tenant's primary theme color:

```css
.navbar-logo {
  color: var(--color-primary);
}
```

## Accessibility

### Skip Links

The NavBar includes proper skip link functionality for keyboard navigation.

### ARIA Attributes

- `role="navigation"` on the nav element
- `aria-expanded` on mobile menu button
- `aria-controls` on menu toggles
- `aria-label` on interactive elements

### Keyboard Navigation

- **Tab**: Navigate through interactive elements
- **Enter/Space**: Activate buttons and links
- **Escape**: Close open menus
- **Arrow Keys**: Navigate within menus

## Mobile Menu

### Mobile Menu Button

The mobile menu button appears on screens smaller than the tablet breakpoint:

```jsx
<NavBar
  showMobileMenu={true}
  onMobileMenuToggle={(isOpen) => {
    console.log('Mobile menu:', isOpen ? 'opened' : 'closed');
  }}
/>
```

### Mobile Menu Content

The mobile menu includes:

- Search bar (if enabled)
- User menu items
- Additional navigation items

## Search Functionality

### Search Input

```jsx
<NavBar
  showSearch={true}
  onSearch={(query) => {
    // Handle search
    console.log('Searching for:', query);
  }}
  searchPlaceholder="Search products..."
/>
```

### Search Form Submission

The search input submits on Enter key press and calls the `onSearch` callback with the query string.

## Notifications

### Notification Bell

```jsx
<NavBar
  showNotifications={true}
  notificationCount={5}
  onNotificationClick={() => {
    // Navigate to notifications
    router.push('/notifications');
  }}
/>
```

### Notification Badge

The notification bell displays a red badge with the count when `notificationCount > 0`.

## Examples

### Complete Example

```jsx
import React from 'react';
import { NavBar } from '@luxgen/ui';

const MyPage = () => {
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

  const handleSearch = (query) => {
    console.log('Searching for:', query);
    // Implement search logic
  };

  const handleNotificationClick = () => {
    router.push('/notifications');
  };

  return (
    <NavBar
      user={user}
      onUserAction={handleUserAction}
      showSearch={true}
      onSearch={handleSearch}
      searchPlaceholder="Search products..."
      showNotifications={true}
      notificationCount={3}
      onNotificationClick={handleNotificationClick}
      variant="default"
      position="sticky"
    />
  );
};

export default MyPage;
```

### With Custom Styling

```jsx
<NavBar
  className="custom-navbar"
  user={user}
  onUserAction={handleUserAction}
  style={{
    backgroundColor: 'var(--color-primary)',
    color: 'white'
  }}
/>
```

## Troubleshooting

### Common Issues

1. **Logo not showing**: Check tenant configuration and logo props
2. **User menu not working**: Verify `onUserAction` callback is provided
3. **Search not working**: Check `onSearch` callback and `showSearch` prop
4. **Mobile menu not responsive**: Verify breakpoint values

### Debug Steps

1. Check console for tenant detection logs
2. Verify user object structure
3. Check callback function implementations
4. Test responsive behavior at different screen sizes