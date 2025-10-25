# AdminDashboard Component

A comprehensive admin dashboard component designed for admin and superadmin interfaces, featuring analytics, user management, and system monitoring capabilities with multi-tenant support.

## Features

- **Multi-Tenant Support**: Displays current tenant information and applies tenant-specific theming
- **Statistics Cards**: Display key metrics with trends and visual indicators
- **Interactive Charts**: User retention trends, engagement breakdown, and engagement trends
- **Recent Activities**: Real-time activity feed with user avatars and status indicators
- **Survey Management**: Last survey overview with progress tracking
- **Permission Requests**: Admin approval workflow for user permissions
- **Quick Actions**: Fast access to common administrative tasks
- **Responsive Design**: Optimized for desktop and tablet viewing
- **Theme Support**: Full integration with tenant theme system

## Usage

```tsx
import { AdminDashboard } from '@luxgen/ui';

const adminDashboardData = {
  title: 'Admin Dashboard',
  subtitle: 'System Overview',
  currentTenant: {
    name: 'Ideavibes',
    subdomain: 'ideavibes',
    logo: '/logos/ideavibes.png'
  },
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
};

<AdminDashboard
  {...adminDashboardData}
  variant="default"
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
| `title` | `string` | `'Admin Dashboard'` | Main dashboard title |
| `subtitle` | `string` | - | Dashboard subtitle |
| `currentTenant` | `object` | - | Current tenant information |
| `stats` | `object` | - | Statistics data (totalCourses, activeStudents, completionRate, etc.) |
| `retentionData` | `array` | `[]` | User retention data for charts |
| `engagementData` | `array` | `[]` | Engagement breakdown data |
| `trendsData` | `array` | `[]` | Engagement trends data |
| `activitiesData` | `array` | `[]` | Recent activities data |
| `surveyData` | `object` | - | Last survey information |
| `permissionData` | `array` | `[]` | Permission requests data |
| `quickActions` | `array` | `[]` | Quick action buttons |
| `variant` | `'default' \| 'compact' \| 'detailed'` | `'default'` | Dashboard layout variant |
| `loading` | `boolean` | `false` | Show loading state |
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

## Multi-Tenant Features

- **Tenant Display**: Shows current tenant name and subdomain
- **Theme Integration**: Automatically applies tenant-specific colors and fonts
- **Responsive Design**: Adapts to different screen sizes and tenant requirements
- **Isolation**: Each tenant's data is properly isolated and themed

## Variants

- **default**: Standard layout with balanced spacing
- **compact**: Condensed layout for smaller screens
- **detailed**: Expanded layout with more spacing and larger components

## Styling

The component uses modular CSS-in-JS styling with full theme integration. All styles are automatically applied based on the tenant theme configuration.

## Accessibility

- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
