# UserDashboardLayout Component

A user-focused layout component that combines the PageLayout with the UserDashboard, providing a complete user interface with navbar and dashboard content optimized for multi-tenant learning management systems.

## Features

- **Complete User Interface**: Combines PageLayout with UserDashboard for a full user experience
- **Multi-Tenant Support**: Displays current tenant information and applies tenant-specific theming
- **Clean Navigation**: Simple navbar without sidebar for user-focused experience
- **Responsive Design**: Adapts to different screen sizes with mobile-friendly navigation
- **Theme Integration**: Full integration with tenant theme system
- **User Management**: User menu with profile, settings, and logout options
- **Search Integration**: Built-in search functionality
- **Notification Support**: Notification system with count display

## Usage

```tsx
import { UserDashboardLayout } from '@luxgen/ui';

const userLayoutData = {
  currentTenant: {
    name: 'Ideavibes',
    subdomain: 'ideavibes',
    logo: '/logos/ideavibes.png'
  },
  user: {
    name: 'John Doe',
    email: 'john@ideavibes.com',
    avatar: '/avatars/john.jpg',
    initials: 'JD',
    role: 'Student'
  },
  dashboardData: {
    title: 'Welcome to Ideavibes',
    subtitle: 'Your learning management dashboard',
    stats: {
      totalCourses: 12,
      activeStudents: 156,
      completionRate: 87,
      myCourses: 5,
      completedCourses: 3,
      inProgressCourses: 2
    },
    myCourses: [
      {
        id: '1',
        title: 'Advanced React Development',
        description: 'Learn advanced React concepts and patterns',
        progress: 75,
        status: 'in-progress',
        instructor: 'Jane Smith',
        duration: '8 weeks',
        thumbnail: '/thumbnails/react.jpg',
        lastAccessed: '2 hours ago'
      }
    ],
    recentActivities: [
      {
        id: '1',
        type: 'course',
        title: 'Completed React Fundamentals Quiz',
        courseTitle: 'Advanced React Development',
        time: '1 hour ago',
        status: 'completed'
      }
    ],
    announcements: [
      {
        id: '1',
        title: 'New Course Available',
        content: 'Introduction to TypeScript is now available',
        author: 'Admin Team',
        createdAt: '2024-01-20',
        priority: 'medium',
        isRead: false
      }
    ],
    quickActions: [
      { id: '1', label: 'Browse Courses', onClick: () => console.log('Browse Courses') },
      { id: '2', label: 'View Progress', onClick: () => console.log('View Progress') }
    ]
  }
};

<UserDashboardLayout
  {...userLayoutData}
  variant="default"
  showSearch={true}
  showNotifications={true}
  notificationCount={3}
  responsive={true}
  onUserAction={(action) => console.log('User action:', action)}
  onSearch={(query) => console.log('Search:', query)}
  onNotificationClick={() => console.log('Notifications clicked')}
  onCourseClick={(course) => console.log('Course clicked:', course)}
  onActivityClick={(activity) => console.log('Activity clicked:', activity)}
  onAnnouncementClick={(announcement) => console.log('Announcement clicked:', announcement)}
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
| `responsive` | `boolean` | `true` | Enable responsive behavior |
| `mobileBreakpoint` | `number` | `768` | Mobile breakpoint in pixels |
| `tabletBreakpoint` | `number` | `1024` | Tablet breakpoint in pixels |
| `desktopBreakpoint` | `number` | `1280` | Desktop breakpoint in pixels |
| `onUserAction` | `function` | - | Callback for user menu actions |
| `onSearch` | `function` | - | Callback for search |
| `onNotificationClick` | `function` | - | Callback for notification clicks |
| `onCourseClick` | `function` | - | Callback for course clicks |
| `onActivityClick` | `function` | - | Callback for activity clicks |
| `onAnnouncementClick` | `function` | - | Callback for announcement clicks |

## Layout Structure

The UserDashboardLayout combines:

1. **PageLayout**: Provides the main layout structure with navbar only (no sidebar)
2. **UserDashboard**: Renders the user-focused dashboard content with courses, activities, and announcements

## Multi-Tenant Features

- **Tenant Display**: Shows current tenant name and subdomain in the dashboard
- **Theme Integration**: Automatically applies tenant-specific colors and fonts
- **User Context**: Displays user-specific information and preferences
- **Responsive Design**: Adapts to different screen sizes and tenant requirements

## User-Focused Features

- **My Courses**: Personal course overview with progress tracking
- **Recent Activities**: User activity feed with course-specific actions
- **Announcements**: Important updates and notifications
- **Quick Actions**: Fast access to common user tasks
- **Progress Tracking**: Visual progress indicators for courses
- **Status Management**: Clear status indicators for courses and activities

## Responsive Behavior

- **Mobile**: Dashboard content adapts to smaller screens with stacked layout
- **Tablet**: Dashboard uses medium-sized components with optimized spacing
- **Desktop**: Full dashboard with all features visible and optimal spacing

## Accessibility

- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management for interactive elements

## Styling

The component uses modular CSS-in-JS styling with full theme integration. All styles are automatically applied based on the tenant theme configuration.
