# PermissionRequest Component

A standalone, reusable component for displaying and managing user permission requests with approval workflow, status indicators, and interactive elements.

## Features

- **Request Management**: Display and manage user permission requests
- **Status Indicators**: Color-coded status badges (Pending, Approved, Denied)
- **Approval Workflow**: Approve, deny, and view details actions
- **User Information**: Display user names, emails, and avatars
- **Request Details**: Show permission type, resource, reason, and timestamp
- **Responsive Design**: Adapts to different screen sizes and container widths
- **Theme Integration**: Full support for tenant themes with fallbacks
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Empty States**: Graceful handling of empty request lists

## Usage

```tsx
import { PermissionRequest } from '@luxgen/ui';

const requests = [
  {
    id: '1',
    user: { name: 'John Doe', email: 'john@example.com', initials: 'JD' },
    permission: 'Admin',
    resource: 'User Management',
    requestedAt: '2 hours ago',
    reason: 'Need to manage user accounts for new project',
    status: 'pending'
  },
  {
    id: '2',
    user: { name: 'Jane Smith', email: 'jane@example.com', initials: 'JS' },
    permission: 'Editor',
    resource: 'Content Management',
    requestedAt: '1 day ago',
    status: 'approved'
  }
];

<PermissionRequest
  title="Permission Requests"
  requests={requests}
  maxItems={5}
  showActions={true}
  onApprove={(request) => console.log('Approve:', request)}
  onDeny={(request) => console.log('Deny:', request)}
  onViewDetails={(request) => console.log('Details:', request)}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `'Permission Requests'` | Component title |
| `requests` | `PermissionRequest[]` | `[]` | Array of permission request objects |
| `maxItems` | `number` | `5` | Maximum number of requests to display |
| `showActions` | `boolean` | `true` | Show action buttons for pending requests |
| `variant` | `'default' \| 'compact' \| 'detailed'` | `'default'` | Component variant |
| `onApprove` | `(request: PermissionRequest) => void` | - | Approve request handler |
| `onDeny` | `(request: PermissionRequest) => void` | - | Deny request handler |
| `onViewDetails` | `(request: PermissionRequest) => void` | - | View details handler |
| `tenantTheme` | `TenantTheme` | `defaultTheme` | Theme object for styling |

## PermissionRequest Interface

```tsx
interface PermissionRequest {
  id: string;
  user: {
    name: string;
    email: string;
    avatar?: string;
    initials?: string;
  };
  permission: string;
  resource: string;
  requestedAt: string;
  reason?: string;
  status: 'pending' | 'approved' | 'denied';
  avatarColor?: string;
}
```

## Variants

### Default
Standard size with full features and action buttons.

### Compact
Smaller size optimized for dashboards and sidebars.

### Detailed
Larger size with enhanced spacing for detailed request information.

## Examples

### Basic Usage

```tsx
<PermissionRequest
  title="Permission Requests"
  requests={requests}
  maxItems={5}
  showActions={true}
/>
```

### With Custom Styling

```tsx
<PermissionRequest
  title="User Permission Requests"
  requests={requests}
  maxItems={10}
  showActions={true}
  variant="detailed"
  onApprove={(request) => {
    console.log('Approving request:', request);
    // Handle approval logic
  }}
  onDeny={(request) => {
    console.log('Denying request:', request);
    // Handle denial logic
  }}
  onViewDetails={(request) => {
    console.log('Viewing details:', request);
    // Open details modal
  }}
/>
```

### Compact Variant

```tsx
<PermissionRequest
  title="Requests"
  requests={requests}
  maxItems={3}
  showActions={false}
  variant="compact"
/>
```

### Without Actions

```tsx
<PermissionRequest
  title="Permission Status"
  requests={requests}
  maxItems={5}
  showActions={false}
/>
```

## Status Types

- **Pending**: Orange status badge for requests awaiting approval
- **Approved**: Green status badge for approved requests
- **Denied**: Red status badge for denied requests

## Action Buttons

- **Approve**: Green button to approve pending requests
- **Deny**: Red button to deny pending requests
- **Details**: Gray button to view request details

## Pending Count

The component automatically displays the number of pending requests in a badge when there are pending items.

## Avatar Generation

The component automatically generates avatars based on user information:

- **Custom Images**: Uses `user.avatar` if provided
- **Initials**: Uses `user.initials` or generates from `user.name`
- **Colors**: Uses `avatarColor` or generates consistent colors from name

## Styling

The component uses CSS-in-JS styling with full theme support:

- **Theme Colors**: All colors are theme-aware and will adapt to your tenant theme
- **CSS Classes**: Additional styling can be applied using the `className` prop
- **Variant Styles**: Different layout variants for different use cases
- **Hover Effects**: Smooth transitions and hover animations

## Accessibility

- **Semantic HTML**: Proper heading structure and landmark roles
- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Screen Reader Support**: ARIA labels and descriptions for all components
- **Focus Management**: Proper focus indicators and tab order
- **Color Contrast**: Meets WCAG 2.1 AA standards for color contrast

## Performance

- **Efficient Rendering**: Optimized for large request lists and frequent updates
- **Memoization**: Components are memoized to prevent unnecessary re-renders
- **Bundle Size**: Tree-shakeable components to minimize bundle impact
- **Lazy Loading**: Actions are loaded on demand for better performance

## Testing

The component includes comprehensive test coverage:

- **Rendering Tests**: Default props, custom styling, status display
- **Interaction Tests**: Button clicks, action handlers
- **Accessibility Tests**: Proper heading structure, keyboard navigation
- **Edge Cases**: Different statuses, empty states, variant testing

Run tests with:
```bash
npm test PermissionRequest.spec.js
```
