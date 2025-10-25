# UserDashboard Component

A user-focused dashboard component designed for regular users in a multi-tenant learning management system, featuring course management, activity tracking, and personalized content.

## Features

- **Multi-Tenant Support**: Displays current tenant information and applies tenant-specific theming
- **Statistics Cards**: Display user-specific metrics (courses, progress, etc.)
- **My Courses**: Personal course overview with progress tracking
- **Recent Activities**: User activity feed with course-specific actions
- **Announcements**: Important updates and notifications
- **Quick Actions**: Fast access to common user tasks
- **Responsive Design**: Optimized for desktop and mobile viewing
- **Theme Support**: Full integration with tenant theme system

## Usage

```tsx
import { UserDashboard } from '@luxgen/ui';

const userDashboardData = {
  title: 'Welcome to Ideavibes',
  subtitle: 'Your learning management dashboard',
  currentTenant: {
    name: 'Ideavibes',
    subdomain: 'ideavibes',
    logo: '/logos/ideavibes.png'
  },
  user: {
    name: 'John Doe',
    email: 'john@example.com',
    avatar: '/avatars/john.jpg',
    initials: 'JD',
    role: 'Student'
  },
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
};

<UserDashboard
  {...userDashboardData}
  variant="default"
  onCourseClick={(course) => console.log('Course clicked:', course)}
  onActivityClick={(activity) => console.log('Activity clicked:', activity)}
  onAnnouncementClick={(announcement) => console.log('Announcement clicked:', announcement)}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `'Welcome to Ideavibes'` | Main dashboard title |
| `subtitle` | `string` | `'Your learning management dashboard'` | Dashboard subtitle |
| `currentTenant` | `object` | - | Current tenant information |
| `user` | `object` | - | Current user information |
| `stats` | `object` | - | User statistics (totalCourses, activeStudents, completionRate, etc.) |
| `myCourses` | `array` | `[]` | User's enrolled courses |
| `recentActivities` | `array` | `[]` | Recent user activities |
| `announcements` | `array` | `[]` | Important announcements |
| `quickActions` | `array` | `[]` | Quick action buttons |
| `variant` | `'default' \| 'compact' \| 'detailed'` | `'default'` | Dashboard layout variant |
| `loading` | `boolean` | `false` | Show loading state |
| `onCourseClick` | `function` | - | Callback for course clicks |
| `onActivityClick` | `function` | - | Callback for activity clicks |
| `onAnnouncementClick` | `function` | - | Callback for announcement clicks |

## Multi-Tenant Features

- **Tenant Display**: Shows current tenant name and subdomain
- **Theme Integration**: Automatically applies tenant-specific colors and fonts
- **User Context**: Displays user-specific information and preferences
- **Responsive Design**: Adapts to different screen sizes and tenant requirements

## Variants

- **default**: Standard layout with balanced spacing
- **compact**: Condensed layout for smaller screens
- **detailed**: Expanded layout with more spacing and larger components

## Course Management

- **Progress Tracking**: Visual progress bars for each course
- **Status Indicators**: Clear status badges (Not Started, In Progress, Completed)
- **Instructor Information**: Course instructor details
- **Last Accessed**: When the user last accessed the course

## Activity Tracking

- **Activity Types**: Different icons for courses, quizzes, assignments, and announcements
- **Status Indicators**: Visual status dots for activity completion
- **Course Context**: Shows which course the activity belongs to
- **Time Stamps**: When the activity occurred

## Announcements

- **Priority Levels**: Color-coded priority badges (low, medium, high)
- **Author Information**: Who posted the announcement
- **Read Status**: Visual indicators for read/unread announcements
- **Content Preview**: Brief content preview with full details on click

## Styling

The component uses modular CSS-in-JS styling with full theme integration. All styles are automatically applied based on the tenant theme configuration.

## Accessibility

- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management for interactive elements
