---
title: AppLayout
---

A comprehensive layout component used to wrap page content with common elements including a `NavBar`, `Sidebar`, and main content area. This component provides tenant-aware theming, responsive design, and analytics integration.

**_Note_**: In order to use this component, you MUST have a `GlobalProvider` and `ThemeProvider` connected at a higher level in your application.

## Purpose

To present the main content of a page inside a consistent layout structure with navigation, sidebar, and tenant-specific theming.

## Features

- **Tenant-Aware Theming**: Automatically applies tenant-specific colors, logos, and branding
- **Responsive Design**: Adapts to mobile, tablet, and desktop screen sizes
- **Analytics Integration**: Tracks user interactions and performance metrics
- **Error Handling**: Graceful error states with fallback UI
- **Accessibility**: Skip links and proper ARIA attributes

## Development

### Required Context

The `AppLayout` component requires the following context providers:

- `GlobalProvider`: Provides tenant configuration and detection
- `ThemeProvider`: Manages theme application and CSS custom properties

### Required State

The component uses the following context hooks:

- `useGlobalContext()`: Access to current tenant and configuration
- `useTheme()`: Access to current theme and theme application functions

## Props

| Property                    | Type                    | Default     | Description                                                                                                                        |
| --------------------------- | ----------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| children                    | ReactNode               | -           | Required page content to wrap                                                                                                      |
| tenantTheme                 | TenantTheme             | defaultTheme| Optional tenant-specific theme override                                                                                           |
| navItems                    | NavItem[]               | []          | Navigation items for the NavBar                                                                                                   |
| sidebarSections             | SidebarSection[]        | []          | Sidebar sections and items                                                                                                         |
| menuItems                   | MenuItem[]              | []          | Menu items for additional navigation                                                                                              |
| user                        | UserMenu                | -           | User information for user menu                                                                                                     |
| onUserAction                | Function                | -           | Callback for user actions (profile, settings, logout)                                                                             |
| onSearch                    | Function                | -           | Callback for search functionality                                                                                                  |
| onNotificationClick        | Function                | -           | Callback for notification interactions                                                                                             |
| showSearch                  | Boolean                 | true        | Show search bar in NavBar                                                                                                          |
| showNotifications           | Boolean                 | true        | Show notifications in NavBar                                                                                                       |
| notificationCount           | Number                  | 0           | Number of notifications to display                                                                                                 |
| searchPlaceholder           | String                  | 'Search...' | Placeholder text for search input                                                                                                  |
| logo                        | Object                  | -           | Logo configuration (src, alt, text, href)                                                                                         |
| className                   | String                  | ''          | Additional CSS classes                                                                                                             |
| menuPosition                | String                  | 'top'       | Position of menu layer ('top', 'bottom', 'left', 'right')                                                                         |
| menuVariant                 | String                  | 'default'   | Menu variant ('default', 'compact', 'minimal')                                                                                   |
| menuCollapsible             | Boolean                 | true        | Allow menu to be collapsed                                                                                                         |
| menuDefaultCollapsed        | Boolean                 | false       | Start with menu collapsed                                                                                                          |
| sidebarCollapsible          | Boolean                 | true        | Allow sidebar to be collapsed                                                                                                     |
| sidebarDefaultCollapsed     | Boolean                 | false       | Start with sidebar collapsed                                                                                                       |
| responsive                  | Boolean                 | true        | Enable responsive behavior                                                                                                         |
| mobileBreakpoint            | Number                  | 640         | Mobile breakpoint in pixels                                                                                                        |
| tabletBreakpoint            | Number                  | 768         | Tablet breakpoint in pixels                                                                                                        |
| desktopBreakpoint           | Number                  | 1024        | Desktop breakpoint in pixels                                                                                                       |

## Component Usage

### Basic Usage

```jsx
import { AppLayout, GlobalProvider, ThemeProvider } from '@luxgen/ui';

<GlobalProvider>
  <ThemeProvider>
    <AppLayout
      sidebarSections={sidebarSections}
      user={user}
      onUserAction={handleUserAction}
      onSearch={handleSearch}
      showSearch={true}
      showNotifications={true}
      notificationCount={3}
    >
      <h1>Page Content</h1>
      <p>Your page content goes here</p>
    </AppLayout>
  </ThemeProvider>
</GlobalProvider>
```



<AppLayout
  navItems={navItems}
  sidebarSections={sidebarSections}
  user={user}
  onUserAction={handleUserAction}
>
  {content}
</AppLayout>
```

### With Search and Notifications

```jsx
<AppLayout
  showSearch={true}
  onSearch={(query) => console.log('Search:', query)}
  searchPlaceholder="Search dashboard..."
  showNotifications={true}
  notificationCount={5}
  onNotificationClick={() => console.log('Notifications clicked')}
>
  {content}
</AppLayout>
```

## Accessibility

### Skip Link for ADA

The main content includes a skip link for keyboard and screen reader users:

```html
<main id="main-content" tabIndex="-1">
  {children}
</main>
```

The skip link allows users to jump directly to the main content, bypassing navigation elements.

### ARIA Attributes

The component includes proper ARIA attributes:

- `role="navigation"` on navigation elements
- `aria-expanded` on collapsible elements
- `aria-controls` on toggle buttons
- `aria-label` on interactive elements

## Tenant Integration

### Automatic Tenant Detection

The component automatically detects the current tenant from:

1. **Subdomain**: `ideavibes.localhost:3000` → `ideavibes` tenant
2. **Query Parameter**: `?tenant=demo` → `demo` tenant
3. **Default Fallback**: Falls back to `demo` tenant

### Theme Application

Tenant themes are automatically applied through:

- **CSS Custom Properties**: `--color-primary`, `--color-background`, etc.
- **Component Styling**: Logo colors, background colors, text colors
- **Dynamic Updates**: Themes update when switching tenants

### Example Tenant Configurations

```javascript
// Demo tenant (default)
{
  id: 'demo',
  name: 'Demo Company',
  theme: {
    colors: {
      primary: '#3B82F6',    // Blue
      background: '#F8FAFC'
    }
  }
}

// Idea Vibes tenant
{
  id: 'idea-vibes',
  name: 'Idea Vibes',
  theme: {
    colors: {
      primary: '#8B5CF6',    // Purple
      background: '#FAF5FF'
    }
  }
}
```

## Analytics Integration

### Automatic Tracking

The component automatically tracks:

- **Layout Events**: Initialization, responsive changes, errors
- **User Interactions**: Menu toggles, search queries, notifications
- **Performance Metrics**: Load times, render performance
- **Error Events**: Layout errors with stack traces

### Custom Analytics

```jsx
// Track custom events
const handleCustomAction = () => {
  // Your custom logic
  trackLayoutEvent('custom_action', {
    action: 'button_click',
    target: 'custom_button'
  });
};
```

## Error Handling

### Error Boundaries

The component includes error boundaries that:

- **Catch Errors**: Prevent layout crashes
- **Show Fallback UI**: User-friendly error messages
- **Track Errors**: Log errors to analytics
- **Allow Recovery**: Refresh button for error recovery

### Loading States

The component shows loading states:

- **Initial Load**: Spinner while loading tenant configuration
- **Theme Application**: Smooth transitions when applying themes
- **Responsive Changes**: Smooth transitions between breakpoints

## Responsive Design

### Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1023px  
- **Desktop**: ≥ 1024px

### Responsive Behavior

- **Mobile**: Collapsible sidebar, hamburger menu
- **Tablet**: Simplified navigation, touch-friendly interface
- **Desktop**: Full navigation, search bar, complete feature set

## Styling

### CSS Custom Properties

The component uses CSS custom properties for theming:

```css
:root {
  --color-primary: #3B82F6;
  --color-secondary: #1E40AF;
  --color-background: #F8FAFC;
  --color-surface: #FFFFFF;
  --color-text: #1F2937;
  /* ... more properties */
}
```

### Theme Classes

```css
.app-layout {
  background-color: var(--color-background);
  color: var(--color-text);
}

.navbar {
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

.sidebar {
  background-color: var(--color-surface);
  border-right: 1px solid var(--color-border);
}
```

## Development

### Debug Mode

Enable debug mode to see tenant information:

```jsx
import { TenantDebug } from '@luxgen/ui';

<AppLayout>
  {content}
  <TenantDebug />
</AppLayout>
```

### Console Logging

The component provides detailed console logging:

- `🏢 Tenant detected: { tenant, name, primaryColor }`
- `🎨 Applying theme: { primary, secondary, background }`
- `📊 Layout Event: { eventName, properties }`
- `✅ CSS Variables Applied: { primary, background }`

## Examples

### Complete Example

```jsx
import React from 'react';
import { 
  AppLayout, 
  GlobalProvider, 
  ThemeProvider,
  TenantDebug 
} from '@luxgen/ui';

const MyPage = () => {
  const handleUserAction = (action) => {
    console.log('User action:', action);
  };

  const handleSearch = (query) => {
    console.log('Search query:', query);
  };

  const sidebarSections = [
    {
      id: 'main',
      title: 'Main',
      items: [
        { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
        { id: 'users', label: 'Users', href: '/users' }
      ]
    }
  ];

  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin'
  };

  return (
    <GlobalProvider>
      <ThemeProvider>
        <AppLayout
          sidebarSections={sidebarSections}
          user={user}
          onUserAction={handleUserAction}
          onSearch={handleSearch}
          showSearch={true}
          showNotifications={true}
          notificationCount={3}
        >
          <h1>Welcome to LuxGen</h1>
          <p>Your content goes here</p>
        </AppLayout>
        <TenantDebug />
      </ThemeProvider>
    </GlobalProvider>
  );
};

export default MyPage;
```

## Troubleshooting

### Common Issues

1. **Theme not applying**: Check that `ThemeProvider` is wrapping the component
2. **Tenant not detected**: Verify subdomain or query parameter format
3. **Styling issues**: Check CSS custom properties are being applied
4. **Responsive issues**: Verify breakpoint values and responsive prop

### Debug Steps

1. Check console for tenant detection logs
2. Verify CSS custom properties in DevTools
3. Check tenant configuration in debug panel
4. Verify context providers are properly set up
