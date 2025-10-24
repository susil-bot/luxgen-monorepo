# GroupDashboardCard Component

A comprehensive dashboard card component designed for displaying group information with user statistics, progress tracking, and management actions.

## Features

- **User Statistics**: Display total users and active users with visual indicators
- **Member Avatars**: Show group members with overflow handling (+N indicator)
- **Role Badges**: Color-coded role indicators (Super Admin, Admin, Moderator, Member)
- **Progress Tracking**: Visual progress bars for group activity
- **Status Indicators**: Group status with color-coded badges
- **Action Buttons**: Edit, view details, and manage users functionality
- **Responsive Design**: Works on all screen sizes
- **Accessibility**: Proper ARIA labels and keyboard navigation

## Usage

```tsx
import { GroupDashboardCard } from '@luxgen/ui';

const groupData = {
  id: '1',
  name: 'Development Team',
  totalUsers: 8,
  activeUsers: 6,
  maxUsers: 10,
  role: 'Super Admin',
  progress: 7,
  maxProgress: 10,
  status: 'Active',
  members: [
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' },
    { id: '3', name: 'Bob Johnson' },
  ],
  tasks: 12,
  comments: 8,
};

<GroupDashboardCard
  group={groupData}
  onEdit={() => console.log('Edit group')}
  onViewDetails={() => console.log('View details')}
  onManageUsers={() => console.log('Manage users')}
  showActions={true}
/>
```

## Props

### GroupDashboardCardProps

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `group` | `GroupData` | ✅ | - | Group data object |
| `onEdit` | `() => void` | ❌ | - | Edit group callback |
| `onViewDetails` | `() => void` | ❌ | - | View details callback |
| `onManageUsers` | `() => void` | ❌ | - | Manage users callback |
| `className` | `string` | ❌ | `''` | Additional CSS classes |
| `showActions` | `boolean` | ❌ | `true` | Show action buttons |

### GroupData Interface

```typescript
interface GroupData {
  id: string;
  name: string;
  totalUsers: number;
  activeUsers: number;
  maxUsers?: number;
  role: 'Super Admin' | 'Admin' | 'Moderator' | 'Member';
  progress: number;
  maxProgress: number;
  status: 'Active' | 'Inactive' | 'Pending' | 'Backlog';
  members: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  tasks?: number;
  comments?: number;
}
```

## Design Elements

### Header Section
- **Total Users Display**: Shows "Total X Users" with member count
- **Member Avatars**: Overlapping circular avatars with overflow indicator
- **Avatar Overflow**: Shows "+N" when more than 3 members

### Role Badge
- **Centered Display**: Role badge in the center of the card
- **Color Coding**:
  - Super Admin: Blue
  - Admin: Purple
  - Moderator: Yellow
  - Member: Green

### Active Users Section
- **Progress Bar**: Visual representation of active vs total users
- **Percentage Display**: Shows active users ratio
- **Document Icon**: Purple icon indicating progress tracking

### Status Section
- **Edit User Label**: "Edit User" text with document icon
- **Status Badge**: Color-coded status indicator
- **Status Colors**:
  - Active: Green
  - Inactive: Gray
  - Pending: Yellow
  - Backlog: Orange

### Footer Section
- **User Avatar**: Default user icon
- **Add User Button**: Dashed border button for adding users
- **Task Counter**: Document icon with task count
- **Comment Counter**: Chat icon with comment count

### Actions Section
- **View Details**: Link to view group details
- **Edit Button**: Icon button for editing group

## Styling

The component uses Tailwind CSS classes for styling:

```css
/* Card Container */
.p-6.bg-white.rounded-lg.border.border-gray-200.shadow-sm

/* Hover Effects */
.hover:shadow-md.transition-shadow.duration-200

/* Progress Bar */
.h-3.bg-purple-500.transition-all.duration-300

/* Role Badges */
.px-3.py-1.rounded-full.text-sm.font-medium

/* Status Badges */
.px-2.py-1.rounded-full.text-xs.font-medium
```

## Color Schemes

### Role Colors
- **Super Admin**: `bg-blue-100 text-blue-800`
- **Admin**: `bg-purple-100 text-purple-800`
- **Moderator**: `bg-yellow-100 text-yellow-800`
- **Member**: `bg-green-100 text-green-800`

### Status Colors
- **Active**: `bg-green-100 text-green-800`
- **Inactive**: `bg-gray-100 text-gray-800`
- **Pending**: `bg-yellow-100 text-yellow-800`
- **Backlog**: `bg-orange-100 text-orange-800`

## Responsive Design

The component is fully responsive and adapts to different screen sizes:

- **Mobile**: Single column layout
- **Tablet**: Two column layout
- **Desktop**: Three column layout

## Accessibility

- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **ARIA Labels**: Proper labeling for screen readers
- **Focus Management**: Clear focus indicators
- **Color Contrast**: Meets WCAG guidelines

## Examples

### Basic Usage
```tsx
<GroupDashboardCard
  group={groupData}
  onEdit={handleEdit}
  onViewDetails={handleViewDetails}
  onManageUsers={handleManageUsers}
/>
```

### Without Actions
```tsx
<GroupDashboardCard
  group={groupData}
  showActions={false}
/>
```

### Custom Styling
```tsx
<GroupDashboardCard
  group={groupData}
  className="custom-card-class"
  onEdit={handleEdit}
/>
```

## Integration

The component integrates seamlessly with the LuxGen UI system:

- **Theme Support**: Uses the tenant theme system
- **SSR Support**: Server-side rendering compatible
- **TypeScript**: Full TypeScript support
- **Testing**: Jest and React Testing Library compatible

## Dependencies

- React 18+
- Tailwind CSS
- LuxGen UI Theme System
- LuxGen SSR Utilities

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- **Optimized Rendering**: Uses React.memo for performance
- **Lazy Loading**: Supports lazy loading of images
- **Bundle Size**: Minimal impact on bundle size
- **Memory Efficient**: Efficient memory usage

## Troubleshooting

### Common Issues

1. **Loading Spinner**: Ensure data is properly loaded before rendering
2. **Styling Issues**: Check Tailwind CSS configuration
3. **TypeScript Errors**: Verify interface definitions
4. **Responsive Issues**: Test on different screen sizes

### Debug Mode

Enable debug mode by adding `data-debug="true"` to the component:

```tsx
<GroupDashboardCard
  group={groupData}
  data-debug="true"
  onEdit={handleEdit}
/>
```

## Contributing

When contributing to this component:

1. Follow the existing code style
2. Add proper TypeScript types
3. Include accessibility features
4. Test on multiple screen sizes
5. Update documentation

## License

This component is part of the LuxGen UI library and follows the same licensing terms.
