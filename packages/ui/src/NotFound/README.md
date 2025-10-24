# NotFound Component

A comprehensive 404 page component with customizable content, search functionality, and navigation options.

## Features

- **Multiple Variants**: Default, minimal, and detailed layouts
- **Search Integration**: Built-in search form with custom handlers
- **Navigation Options**: Go back and go home functionality
- **Custom Actions**: Support for additional action buttons
- **Responsive Design**: Mobile-first responsive layout
- **Theme Support**: Tenant-specific theming
- **Accessibility**: Screen reader support and keyboard navigation
- **Illustrations**: Optional 404 illustrations and animations

## Usage

### Basic Usage

```tsx
import { NotFound } from '@luxgen/ui';

function Custom404Page() {
  return (
    <NotFound />
  );
}
```

### With Custom Content

```tsx
import { NotFound } from '@luxgen/ui';

function Custom404Page() {
  return (
    <NotFound
      title="Page Not Found"
      description="The page you are looking for does not exist."
      showSearch={true}
      showNavigation={true}
    />
  );
}
```

### With Custom Handlers

```tsx
import { NotFound } from '@luxgen/ui';
import { useRouter } from 'next/router';

function Custom404Page() {
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <NotFound
      onGoHome={handleGoHome}
      onGoBack={handleGoBack}
      onSearch={handleSearch}
    />
  );
}
```

### Different Variants

```tsx
// Minimal variant
<NotFound variant="minimal" />

// Detailed variant with search
<NotFound 
  variant="detailed"
  showSearch={true}
  searchPlaceholder="Search for pages, groups, or users..."
/>

// Default variant
<NotFound variant="default" />
```

### With Custom Actions

```tsx
import { NotFound } from '@luxgen/ui';

function Custom404Page() {
  const customActions = (
    <div className="mt-8 text-center">
      <p className="text-sm text-gray-500 mb-4">
        Need help? Try these popular pages:
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <button onClick={() => router.push('/dashboard')}>
          Dashboard
        </button>
        <button onClick={() => router.push('/groups')}>
          Groups
        </button>
        <button onClick={() => router.push('/users')}>
          Users
        </button>
      </div>
    </div>
  );

  return (
    <NotFound
      customActions={customActions}
      variant="detailed"
    />
  );
}
```

### With Tenant Theming

```tsx
import { NotFound } from '@luxgen/ui';

function Custom404Page() {
  const tenantTheme = {
    colors: {
      primary: '#1E40AF',
      secondary: '#64748B',
      accent: '#059669',
      background: '#FFFFFF',
      text: '#1F2937',
      muted: '#6B7280',
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
    },
  };

  return (
    <NotFound
      tenantTheme={tenantTheme}
      title="Demo Platform - Page Not Found"
      description="This page doesn't exist in the Demo Platform."
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tenantTheme` | `TenantTheme` | `defaultTheme` | Tenant-specific theme configuration |
| `title` | `string` | `'Page Not Found'` | Main title text |
| `description` | `string` | `'The page you are looking for does not exist or has been moved.'` | Description text |
| `showSearch` | `boolean` | `true` | Whether to show search form |
| `showNavigation` | `boolean` | `true` | Whether to show navigation buttons |
| `onSearch` | `(query: string) => void` | - | Search form submit handler |
| `onGoHome` | `() => void` | - | Go home button click handler |
| `onGoBack` | `() => void` | - | Go back button click handler |
| `searchPlaceholder` | `string` | `'Search...'` | Search input placeholder |
| `className` | `string` | `''` | Additional CSS classes |
| `variant` | `'default' \| 'minimal' \| 'detailed'` | `'default'` | Layout variant |
| `showIllustration` | `boolean` | `true` | Whether to show 404 illustration |
| `customActions` | `React.ReactNode` | - | Custom action buttons |

## Variants

### Default
- Standard 404 page with illustration
- Search form and navigation buttons
- Balanced layout for most use cases

### Minimal
- Clean, simple layout
- Essential navigation only
- Perfect for mobile or simple designs

### Detailed
- Comprehensive 404 page
- Enhanced search functionality
- Additional help text and actions
- Best for complex applications

## Styling

The component uses Tailwind CSS classes and supports custom styling through the `className` prop. You can also use the exported `notFoundStyles` object for consistent styling:

```tsx
import { notFoundStyles } from '@luxgen/ui/src/NotFound/styles';

// Use predefined styles
const customStyles = notFoundStyles.title.detailed;
```

## Accessibility

- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Focus Management**: Clear focus indicators
- **Color Contrast**: Meets WCAG AA standards

## Responsive Design

The component is fully responsive with breakpoints:
- **Mobile**: Stacked layout, full-width buttons
- **Tablet**: Optimized spacing and sizing
- **Desktop**: Side-by-side layout, enhanced spacing

## Examples

### Next.js 404 Page

```tsx
// pages/404.tsx
import { NotFound } from '@luxgen/ui';

export default function Custom404() {
  return (
    <NotFound
      title="Page Not Found"
      description="The page you are looking for does not exist."
      showSearch={true}
      showNavigation={true}
      variant="detailed"
    />
  );
}
```

### With Asset Management

```tsx
import { NotFound, AssetManagerProvider } from '@luxgen/ui';

export default function Custom404() {
  return (
    <AssetManagerProvider tenantId="demo">
      <NotFound
        title="Demo Platform - Page Not Found"
        description="This page doesn't exist in the Demo Platform."
        showIllustration={true}
        variant="detailed"
      />
    </AssetManagerProvider>
  );
}
```

### Custom Styling

```tsx
import { NotFound } from '@luxgen/ui';

export default function Custom404() {
  return (
    <NotFound
      className="bg-gradient-to-br from-blue-50 to-indigo-100"
      title="Custom 404"
      description="This is a custom styled 404 page."
      variant="detailed"
    />
  );
}
```

## Best Practices

1. **Consistent Branding**: Use tenant-specific themes for consistent branding
2. **Helpful Navigation**: Provide relevant navigation options for your users
3. **Search Integration**: Implement meaningful search functionality
4. **Mobile Optimization**: Test on various screen sizes
5. **Accessibility**: Ensure keyboard navigation and screen reader support

## Troubleshooting

### Common Issues

1. **Styling Conflicts**: Use CSS specificity or `!important` for overrides
2. **Router Issues**: Ensure proper router setup for navigation handlers
3. **Theme Not Applied**: Check tenant theme configuration
4. **Mobile Layout**: Test responsive breakpoints

### Debug Tips

- Use browser dev tools to inspect styling
- Test keyboard navigation
- Verify screen reader compatibility
- Check console for JavaScript errors

## Related Components

- `AssetManager`: For managing tenant-specific assets
- `NavBar`: For consistent navigation
- `Layout`: For page structure
- `Theme`: For styling configuration
