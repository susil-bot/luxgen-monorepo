# AdminDashboardLayout Component

A comprehensive layout component that combines the AppLayout with the AdminDashboard, providing a complete admin interface with sidebar navigation, navbar, and dashboard content optimized for multi-tenant environments.

## Features

- **Complete Admin Interface**: Combines AppLayout with AdminDashboard for a full admin experience
- **Multi-Tenant Support**: Displays current tenant information and applies tenant-specific theming
- **Sidebar Navigation**: Collapsible sidebar with admin-specific navigation items
- **Responsive Design**: Adapts to different screen sizes with mobile-friendly navigation
- **Theme Integration**: Full integration with tenant theme system
- **User Management**: User menu with profile, settings, and logout options
- **Search Integration**: Built-in search functionality
- **Notification Support**: Notification system with count display

## Usage

```tsx
import { AdminDashboardLayout } from '@luxgen/ui';

const adminLayoutData = {
  currentTenant: {
    name: 'Ideavibes',
    subdomain: 'ideavibes',
    logo: '/logos/ideavibes.png'
  },
  user: {
    name: 'Admin User',
    email: 'admin@ideavibes.com',
    avatar: '/avatars/admin.jpg',
    initials: 'AU',
    role: 'Admin'
  },
  dashboardData: {
    title: 'Admin Dashboard',
    subtitle: 'System Overview',
    stats: {
      totalCourses: 12,
      activeStudents: 156,
      completionRate: 87,
      totalUsers: 1200
    },
    retentionData: [
      { date: 'Jan', value: 400, label: 'January' },
      { date: 'Feb', value: 450, label: 'February' }
    ],
    engagementData: [
      { id: '1', label: 'Quizzes', value: 30, color: '#3B82F6', percentage: 30 },
      { id: '2', label: 'Surveys', value: 15, color: '#10B981', percentage: 15 }
    ],
    activitiesData: [
      {
        id: '1',
        user: { name: 'John Doe', avatar: '/avatars/john.jpg', initials: 'JD' },
        action: 'Completed React Course',
        time: '2 hours ago',
        status: 'online'
      }
    ],
    surveyData: {
      id: '1',
      title: 'Q1 2024 Employee Survey',
      status: 'active',
      progress: 75,
      totalResponses: 150,
      targetResponses: 200,
      createdAt: '2024-01-15',
      expiresAt: '2024-02-15'
    },
    permissionData: [
      {
        id: '1',
        user: { name: 'Jane Smith', email: 'jane@example.com', initials: 'JS' },
        permission: 'admin',
        resource: 'User Management',
        requestedAt: '2024-01-20',
        status: 'pending'
      }
    ],
    quickActions: [
      { id: '1', label: 'Create Survey', onClick: () => console.log('Create Survey') },
      { id: '2', label: 'View Reports', onClick: () => console.log('View Reports') }
    ]
  }
};

<AdminDashboardLayout
  {...adminLayoutData}
  variant="default"
  showSearch={true}
  showNotifications={true}
  notificationCount={5}
  sidebarCollapsible={true}
  sidebarDefaultCollapsed={false}
  responsive={true}
  onUserAction={(action) => console.log('User action:', action)}
  onSearch={(query) => console.log('Search:', query)}
  onNotificationClick={() => console.log('Notifications clicked')}
  onRetentionPointClick={(point) => console.log('Retention point clicked:', point)}
  onEngagementSegmentClick={(segment) => console.log('Engagement segment clicked:', segment)}
  onActivityClick={(activity) => console.log('Activity clicked:', activity)}
  onSurveyView={(survey) => console.log('Survey view:', survey)}
  onPermissionApprove={(request) => console.log('Permission approved:', request)}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `currentTenant` | `object` | - | Current tenant information |
| `user` | `object` | `getDefaultUser()` | Current user information |
| `dashboardData` | `object` | `{}` | Dashboard data and configuration |
| `variant` | `'default' \| 'compact' \| 'detailed'` | `'default'` | Layout variant |
| `loading` | `boolean` | `false` | Show loading state |
| `showSearch` | `boolean` | `true` | Show search functionality |
| `showNotifications` | `boolean` | `true` | Show notifications |
| `notificationCount` | `number` | `0` | Number of notifications |
| `searchPlaceholder` | `string` | `'Search...'` | Search input placeholder |
| `sidebarCollapsible` | `boolean` | `true` | Allow sidebar to collapse |
| `sidebarDefaultCollapsed` | `boolean` | `false` | Default sidebar state |
| `responsive` | `boolean` | `true` | Enable responsive behavior |
| `mobileBreakpoint` | `number` | `768` | Mobile breakpoint in pixels |
| `tabletBreakpoint` | `number` | `1024` | Tablet breakpoint in pixels |
| `desktopBreakpoint` | `number` | `1280` | Desktop breakpoint in pixels |
| `onUserAction` | `function` | - | Callback for user menu actions |
| `onSearch` | `function` | - | Callback for search |
| `onNotificationClick` | `function` | - | Callback for notification clicks |
| `onRetentionPointClick` | `function` | - | Callback for retention chart clicks |
| `onEngagementSegmentClick` | `function` | - | Callback for engagement chart clicks |
| `onTrendsPointClick` | `function` | - | Callback for trends chart clicks |
| `onActivityClick` | `function` | - | Callback for activity clicks |
| `onSurveyView` | `function` | - | Callback for survey view |
| `onSurveyEdit` | `function` | - | Callback for survey edit |
| `onSurveyShare` | `function` | - | Callback for survey share |
| `onPermissionApprove` | `function` | - | Callback for permission approval |
| `onPermissionDeny` | `function` | - | Callback for permission denial |
| `onPermissionViewDetails` | `function` | - | Callback for permission details |

## Layout Structure

The AdminDashboardLayout combines:

1. **AppLayout**: Provides the main layout structure with sidebar and navbar
2. **AdminDashboard**: Renders the dashboard content with charts, stats, and management tools

## Multi-Tenant Features

- **Tenant Display**: Shows current tenant name and subdomain in the dashboard
- **Theme Integration**: Automatically applies tenant-specific colors and fonts
- **Navigation**: Tenant-specific navigation items and branding
- **Responsive Design**: Adapts to different screen sizes and tenant requirements

## Responsive Behavior

- **Mobile**: Sidebar collapses to overlay mode, dashboard content adapts to smaller screens
- **Tablet**: Sidebar can be toggled, dashboard uses medium-sized components
- **Desktop**: Full sidebar and dashboard with all features visible

## Accessibility

- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management for interactive elements

## Styling

The component uses modular CSS-in-JS styling with full theme integration. All styles are automatically applied based on the tenant theme configuration.
