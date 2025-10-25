# RecentActivities Component

A standalone, reusable component for displaying recent user activities with avatars, status indicators, and interactive elements.

## Features

- **Activity Feed**: Clean, organized display of recent user activities
- **User Avatars**: Automatic avatar generation with initials or custom images
- **Status Indicators**: Online/offline status with color-coded indicators
- **Interactive Elements**: Clickable activities with hover effects
- **Responsive Design**: Adapts to different screen sizes and container widths
- **Theme Integration**: Full support for tenant themes with fallbacks
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Empty States**: Graceful handling of empty activity lists

## Usage

```tsx
import { RecentActivities } from '@luxgen/ui';

const activities = [
  {
    id: '1',
    user: { name: 'John Doe', initials: 'JD' },
    action: 'Completed survey',
    time: '2 hours ago',
    status: 'online'
  },
  {
    id: '2',
    user: { name: 'Jane Smith', initials: 'JS' },
    action: 'Started training',
    time: '1 day ago',
    status: 'offline'
  }
];

<RecentActivities
  title="Recent Activities"
  activities={activities}
  maxItems={4}
  showStatus={true}
  onActivityClick={(activity) => console.log('Activity clicked:', activity)}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `'Recent Activities'` | Component title |
| `activities` | `Activity[]` | `[]` | Array of activity objects |
| `maxItems` | `number` | `4` | Maximum number of activities to display |
| `showStatus` | `boolean` | `true` | Show online/offline status indicators |
| `variant` | `'default' \| 'compact' \| 'detailed'` | `'default'` | Component variant |
| `onActivityClick` | `(activity: Activity) => void` | - | Activity click handler |
| `tenantTheme` | `TenantTheme` | `defaultTheme` | Theme object for styling |

## Activity Interface

```tsx
interface Activity {
  id: string;
  user: {
    name: string;
    avatar?: string;
    initials?: string;
  };
  action: string;
  time: string;
  status: 'online' | 'offline';
  avatarColor?: string;
}
```

## Variants

### Default
Standard size with full features and status indicators.

### Compact
Smaller size optimized for dashboards and sidebars.

### Detailed
Larger size with enhanced spacing for detailed activity feeds.

## Examples

### Basic Usage

```tsx
<RecentActivities
  title="Recent Activities"
  activities={activities}
  maxItems={5}
  showStatus={true}
/>
```

### With Custom Styling

```tsx
<RecentActivities
  title="User Activity Feed"
  activities={activities}
  maxItems={6}
  showStatus={true}
  variant="detailed"
  onActivityClick={(activity) => {
    console.log('Clicked activity:', activity);
    // Handle activity interaction
  }}
/>
```

### Compact Variant

```tsx
<RecentActivities
  title="Activities"
  activities={activities}
  maxItems={3}
  showStatus={false}
  variant="compact"
/>
```

### With Custom Avatars

```tsx
const activitiesWithAvatars = [
  {
    id: '1',
    user: { 
      name: 'John Doe', 
      avatar: '/path/to/avatar.jpg',
      initials: 'JD' 
    },
    action: 'Completed survey',
    time: '2 hours ago',
    status: 'online',
    avatarColor: '#3B82F6'
  }
];

<RecentActivities
  activities={activitiesWithAvatars}
  onActivityClick={(activity) => console.log('Activity:', activity)}
/>
```

## Avatar Generation

The component automatically generates avatars based on user information:

- **Custom Images**: Uses `user.avatar` if provided
- **Initials**: Uses `user.initials` or generates from `user.name`
- **Colors**: Uses `avatarColor` or generates consistent colors from name

## Status Indicators

- **Online**: Green dot indicator
- **Offline**: Red dot indicator
- **Customizable**: Colors can be themed through tenant theme

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

- **Efficient Rendering**: Optimized for large activity lists and frequent updates
- **Memoization**: Components are memoized to prevent unnecessary re-renders
- **Bundle Size**: Tree-shakeable components to minimize bundle impact
- **Lazy Loading**: Activities are rendered efficiently with proper virtualization

## Testing

The component includes comprehensive test coverage:

- **Rendering Tests**: Default props, custom styling, empty states
- **Interaction Tests**: Activity clicks, hover effects
- **Accessibility Tests**: Proper heading structure, keyboard navigation
- **Edge Cases**: Empty states, error handling, variant testing

Run tests with:
```bash
npm test RecentActivities.spec.js
```
