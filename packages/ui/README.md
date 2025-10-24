# LuxGen UI Package

A comprehensive React UI component library with tenant-aware theming, responsive design, and enterprise-grade features.

## Features

- **🏢 Multi-Tenant Support**: Automatic tenant detection and theme application
- **🎨 Theme System**: CSS custom properties with dynamic theme switching
- **📱 Responsive Design**: Mobile-first approach with breakpoint management
- **♿ Accessibility**: WCAG compliant with proper ARIA attributes
- **🔧 TypeScript**: Full TypeScript support with comprehensive type definitions
- **📊 Analytics**: Built-in analytics and performance tracking
- **🛡️ Error Handling**: Error boundaries and graceful fallbacks
- **🎯 SSR Support**: Server-side rendering with hydration

## Installation

```bash
npm install @luxgen/ui
```

## Quick Start

### Basic Setup

```jsx
import React from 'react';
import { 
  GlobalProvider, 
  ThemeProvider, 
  AppLayout,
  NavBar,
  Sidebar 
} from '@luxgen/ui';

const App = () => {
  return (
    <GlobalProvider>
      <ThemeProvider>
        <AppLayout
          sidebarSections={sidebarSections}
          user={user}
          onUserAction={handleUserAction}
        >
          <h1>Welcome to LuxGen</h1>
          <p>Your content goes here</p>
        </AppLayout>
      </ThemeProvider>
    </GlobalProvider>
  );
};
```

### With Custom Configuration

```jsx
import React from 'react';
import { 
  GlobalProvider, 
  ThemeProvider, 
  AppLayout,
  TenantDebug 
} from '@luxgen/ui';

const App = () => {
  const sidebarSections = [
    {
      id: 'main',
      title: 'Main Navigation',
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

  const handleUserAction = (action) => {
    console.log('User action:', action);
  };

  return (
    <GlobalProvider defaultTenant="demo">
      <ThemeProvider>
        <AppLayout
          sidebarSections={sidebarSections}
          user={user}
          onUserAction={handleUserAction}
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
```

## Core Components

### Layout Components

- **AppLayout**: Main layout wrapper with NavBar and Sidebar
- **PageLayout**: Simple page wrapper for basic layouts
- **PageWrapper**: Content wrapper with consistent spacing

### Navigation Components

- **NavBar**: Top navigation bar with search and user menu
- **Sidebar**: Collapsible sidebar navigation
- **Menu**: Additional menu components

### Form Components

- **Button**: Various button styles and states
- **Input**: Text input with validation
- **Select**: Dropdown selection
- **Checkbox**: Checkbox input
- **RadioGroup**: Radio button groups
- **Switch**: Toggle switch
- **Form**: Form wrapper with validation

### Display Components

- **Card**: Content cards with various styles
- **Modal**: Modal dialogs
- **Table**: Data tables
- **Badge**: Status badges
- **Text**: Typography components
- **Heading**: Heading components

### Utility Components

- **SearchBar**: Search input component
- **CountryLanguageDropdown**: Country and language selection
- **TenantDebug**: Debug panel for tenant information
- **ErrorBoundary**: Error boundary wrapper

## Tenant System

### Automatic Tenant Detection

The system automatically detects tenants from:

1. **Subdomain**: `ideavibes.localhost:3000` → `ideavibes` tenant
2. **Query Parameter**: `?tenant=demo` → `demo` tenant
3. **Default Fallback**: Falls back to `demo` tenant

### Tenant Configuration

```javascript
// Demo tenant (default)
{
  id: 'demo',
  name: 'Demo Company',
  subdomain: 'demo',
  branding: {
    logo: {
      text: 'LuxGen',
      href: '/'
    },
    colors: {
      primary: '#3B82F6'
    }
  },
  theme: {
    colors: {
      primary: '#3B82F6',
      background: '#F8FAFC'
    }
  }
}

// Idea Vibes tenant
{
  id: 'idea-vibes',
  name: 'Idea Vibes',
  subdomain: 'ideavibes',
  branding: {
    logo: {
      text: 'Idea Vibes',
      href: '/'
    },
    colors: {
      primary: '#8B5CF6'
    }
  },
  theme: {
    colors: {
      primary: '#8B5CF6',
      background: '#FAF5FF'
    }
  }
}
```

### Theme Application

Themes are applied through CSS custom properties:

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

## Context Providers

### GlobalProvider

Manages tenant detection and configuration:

```jsx
<GlobalProvider defaultTenant="demo">
  {children}
</GlobalProvider>
```

### ThemeProvider

Manages theme application and CSS custom properties:

```jsx
<ThemeProvider initialTheme={tenantConfig.theme}>
  {children}
</ThemeProvider>
```

## Hooks

### useGlobalContext

Access tenant configuration and detection:

```jsx
import { useGlobalContext } from '@luxgen/ui';

const MyComponent = () => {
  const { currentTenant, tenantConfig, isInitialized } = useGlobalContext();
  
  return (
    <div>
      <p>Current tenant: {currentTenant}</p>
      <p>Tenant name: {tenantConfig.name}</p>
    </div>
  );
};
```

### useTheme

Access current theme and theme functions:

```jsx
import { useTheme } from '@luxgen/ui';

const MyComponent = () => {
  const { theme, setTheme, applyTheme } = useTheme();
  
  return (
    <div style={{ color: theme.colors.primary }}>
      Themed content
    </div>
  );
};
```

## Responsive Design

### Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1023px
- **Desktop**: ≥ 1024px

### Responsive Components

All components automatically adapt to different screen sizes:

```jsx
<AppLayout
  responsive={true}
  mobileBreakpoint={640}
  tabletBreakpoint={768}
  desktopBreakpoint={1024}
>
  {content}
</AppLayout>
```

## Analytics Integration

### Automatic Tracking

Components automatically track:

- **Layout Events**: Initialization, responsive changes
- **User Interactions**: Clicks, form submissions
- **Performance Metrics**: Load times, render performance
- **Error Events**: Component errors with stack traces

### Custom Analytics

```jsx
import { useGlobalContext } from '@luxgen/ui';

const MyComponent = () => {
  const { trackLayoutEvent } = useGlobalContext();
  
  const handleClick = () => {
    trackLayoutEvent('custom_action', {
      action: 'button_click',
      target: 'custom_button'
    });
  };
  
  return <button onClick={handleClick}>Click me</button>;
};
```

## Error Handling

### Error Boundaries

Components include error boundaries that:

- **Catch Errors**: Prevent component crashes
- **Show Fallback UI**: User-friendly error messages
- **Track Errors**: Log errors to analytics
- **Allow Recovery**: Refresh buttons for error recovery

### Loading States

Components show loading states:

- **Initial Load**: Spinners while loading
- **Theme Application**: Smooth transitions
- **Responsive Changes**: Smooth breakpoint transitions

## Accessibility

### WCAG Compliance

All components are built with accessibility in mind:

- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA attributes
- **Color Contrast**: WCAG AA compliant colors
- **Focus Management**: Proper focus handling

### Skip Links

Layout components include skip links:

```html
<a href="#main-content">Skip to main content</a>
<main id="main-content">
  {content}
</main>
```

## TypeScript Support

### Type Definitions

All components include comprehensive TypeScript definitions:

```typescript
import { NavBar, NavBarProps, UserMenu } from '@luxgen/ui';

const MyComponent: React.FC<NavBarProps> = (props) => {
  return <NavBar {...props} />;
};
```

### Interface Definitions

```typescript
interface UserMenu {
  name: string;
  email: string;
  role?: string;
  avatar?: string;
}

interface NavBarProps {
  user?: UserMenu;
  onUserAction?: (action: string) => void;
  showSearch?: boolean;
  // ... more props
}
```

## SSR Support

### Server-Side Rendering

Components support SSR with hydration:

```jsx
import { withSSR } from '@luxgen/ui';

const MyComponent = withSSR(() => {
  return <div>SSR-safe component</div>;
});
```

### Hydration

Components automatically hydrate on the client:

```jsx
// Server renders with default theme
// Client hydrates with tenant-specific theme
<ThemeProvider initialTheme={serverTheme}>
  {children}
</ThemeProvider>
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

Components provide detailed console logging:

- `🏢 Tenant detected: { tenant, name, primaryColor }`
- `🎨 Applying theme: { primary, secondary, background }`
- `📊 Layout Event: { eventName, properties }`
- `✅ CSS Variables Applied: { primary, background }`

### Development Tools

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build package
npm run build

# Run tests
npm test

# Run linting
npm run lint
```

## Examples

### Complete Application

```jsx
import React from 'react';
import { 
  GlobalProvider, 
  ThemeProvider, 
  AppLayout,
  NavBar,
  Sidebar,
  TenantDebug 
} from '@luxgen/ui';

const App = () => {
  const sidebarSections = [
    {
      id: 'main',
      title: 'Main Navigation',
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
  };

  return (
    <GlobalProvider defaultTenant="demo">
      <ThemeProvider>
        <AppLayout
          sidebarSections={sidebarSections}
          user={user}
          onUserAction={handleUserAction}
          showSearch={true}
          onSearch={handleSearch}
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

export default App;
```

## Troubleshooting

### Common Issues

1. **Theme not applying**: Check that `ThemeProvider` is wrapping components
2. **Tenant not detected**: Verify subdomain or query parameter format
3. **Styling issues**: Check CSS custom properties are being applied
4. **Responsive issues**: Verify breakpoint values and responsive props

### Debug Steps

1. Check console for tenant detection logs
2. Verify CSS custom properties in DevTools
3. Check tenant configuration in debug panel
4. Verify context providers are properly set up

### Support

For issues and questions:

- Check the component documentation
- Review the console logs
- Test with different tenants
- Verify context provider setup
