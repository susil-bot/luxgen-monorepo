# Logout Component

A comprehensive logout component for multi-tenant applications with role-based functionality, confirmation dialogs, and user information display.

## Features

- **Multiple Variants**: Default, compact, minimal, and danger variants
- **Confirmation Dialog**: Optional confirmation before logout
- **User Information**: Display user avatar, name, and role
- **Loading States**: Visual feedback during logout process
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Error Handling**: Graceful error handling with console logging
- **Customizable**: Flexible styling and behavior options

## Usage

### Basic Usage

```tsx
import { Logout } from '@luxgen/ui';

const MyComponent = () => {
  const handleLogout = async () => {
    // Clear session, redirect, etc.
    await clearSession();
    window.location.href = '/login';
  };

  return (
    <Logout
      onLogout={handleLogout}
      user={{
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'ADMIN',
        avatar: 'https://example.com/avatar.jpg'
      }}
    />
  );
};
```

### With Confirmation

```tsx
<Logout
  onLogout={handleLogout}
  onCancel={() => console.log('Logout cancelled')}
  showConfirmation={true}
  user={user}
/>
```

### Different Variants

```tsx
// Compact variant for headers
<Logout
  onLogout={handleLogout}
  variant="compact"
  user={user}
/>

// Minimal variant for dropdowns
<Logout
  onLogout={handleLogout}
  variant="minimal"
  user={user}
/>

// Danger variant for destructive actions
<Logout
  onLogout={handleLogout}
  variant="danger"
  user={user}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onLogout` | `() => Promise<void> \| void` | - | **Required.** Function called when logout is confirmed |
| `onCancel` | `() => void` | - | Function called when logout is cancelled |
| `user` | `LogoutUser` | - | User information to display |
| `variant` | `'default' \| 'compact' \| 'minimal' \| 'danger'` | `'default'` | Visual variant of the component |
| `showConfirmation` | `boolean` | `true` | Whether to show confirmation dialog |
| `className` | `string` | `''` | Additional CSS class name |
| `disabled` | `boolean` | `false` | Whether the logout button is disabled |
| `loading` | `boolean` | `false` | Whether the component is in loading state |

## User Object

```tsx
interface LogoutUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  initials?: string;
}
```

## Variants

### Default
- Full button with text and icon
- User information display
- Standard styling

### Compact
- Smaller button size
- Reduced padding and font size
- Suitable for headers and toolbars

### Minimal
- Icon-only button
- No text display
- Suitable for dropdowns and menus

### Danger
- Red color scheme
- Emphasizes destructive action
- Suitable for critical logout scenarios

## Styling

The component uses CSS-in-JS with modular styles. You can customize the appearance by:

1. **CSS Classes**: Add custom classes via the `className` prop
2. **Theme Integration**: The component respects your theme configuration
3. **Variant Styling**: Each variant has its own styling approach

## Accessibility

- **ARIA Labels**: Proper labeling for screen readers
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Proper focus handling in confirmation dialogs
- **Screen Reader Support**: Descriptive text and roles

## Error Handling

The component includes built-in error handling:

- **Async Error Handling**: Catches and logs logout errors
- **Loading States**: Visual feedback during async operations
- **Graceful Degradation**: Continues to function even if errors occur

## Examples

### Header Logout

```tsx
<header className="app-header">
  <div className="header-content">
    <h1>My App</h1>
    <Logout
      onLogout={handleLogout}
      variant="compact"
      user={currentUser}
    />
  </div>
</header>
```

### User Menu

```tsx
<div className="user-menu">
  <div className="user-info">
    <Logout
      onLogout={handleLogout}
      variant="minimal"
      user={currentUser}
    />
  </div>
</div>
```

### Admin Panel

```tsx
<div className="admin-panel">
  <Logout
    onLogout={handleLogout}
    variant="danger"
    showConfirmation={true}
    user={adminUser}
  />
</div>
```

## Testing

The component includes comprehensive Jest tests covering:

- Rendering with different props
- User interactions and event handling
- Variant styling and behavior
- Accessibility features
- Error handling scenarios
- Loading states and disabled states

Run tests with:

```bash
npm test Logout
```

## Dependencies

- React 16.8+ (hooks support)
- @testing-library/react (for testing)
- @testing-library/user-event (for user interactions)

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## License

MIT License - see LICENSE file for details.
