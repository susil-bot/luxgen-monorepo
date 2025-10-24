# Page Template with Navbar and Subnavigation

This template shows how to create pages with consistent navbar and subnavigation (menu layer) across all pages in the LuxGen application.

## Template Structure

```tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { 
  SnackbarProvider, 
  useSnackbar, 
  PageLayout, 
  getDefaultNavItems, 
  getDefaultMenuItems, 
  getDefaultUser, 
  getDefaultLogo 
} from '@luxgen/ui';

const YourPageContent: React.FC = () => {
  const router = useRouter();
  const { showSuccess, showError, showInfo } = useSnackbar();
  const [user, setUser] = useState<any>(null);

  // Load user data
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser({
          name: `${parsedUser.firstName} ${parsedUser.lastName}`,
          email: parsedUser.email,
          role: parsedUser.role,
          tenant: parsedUser.tenant,
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
        setUser(getDefaultUser());
      }
    } else {
      setUser(getDefaultUser());
    }
  }, []);

  // Handle user actions
  const handleUserAction = (action: 'profile' | 'settings' | 'logout') => {
    switch (action) {
      case 'profile':
        router.push('/profile');
        break;
      case 'settings':
        router.push('/settings');
        break;
      case 'logout':
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        router.push('/login');
        break;
    }
  };

  // Handle search
  const handleSearch = (query: string) => {
    console.log('Search query:', query);
    // TODO: Implement search functionality
  };

  // Handle notifications
  const handleNotificationClick = () => {
    console.log('Notification clicked');
    // TODO: Implement notification functionality
  };

  return (
    <>
      <Head>
        <title>Your Page Title - LuxGen</title>
        <meta name="description" content="Your page description" />
      </Head>

      <PageLayout
        navItems={getDefaultNavItems()}
        menuItems={getDefaultMenuItems()}
        user={user}
        onUserAction={handleUserAction}
        onSearch={handleSearch}
        onNotificationClick={handleNotificationClick}
        showSearch={true}
        showNotifications={true}
        notificationCount={3}
        searchPlaceholder="Search..."
        logo={getDefaultLogo()}
        menuPosition="top"
        menuVariant="default"
        menuCollapsible={true}
        menuDefaultCollapsed={false}
        responsive={true}
      >
        {/* Your page content goes here */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Page Title</h1>
          <p className="mt-2 text-gray-600">Your page description</p>
          
          {/* Your page content */}
        </div>
      </PageLayout>
    </>
  );
};

export default function YourPage() {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={3}>
      <YourPageContent />
    </SnackbarProvider>
  );
}
```

## Key Components

### 1. **PageLayout Component**
- Provides consistent navbar and subnavigation
- Handles responsive design
- Manages user authentication state
- Includes search and notification functionality

### 2. **Default Navigation**
- `getDefaultNavItems()`: Standard navigation items
- `getDefaultMenuItems()`: Subnavigation menu items
- `getDefaultUser()`: Default user data
- `getDefaultLogo()`: Application logo

### 3. **Required Imports**
```tsx
import { 
  SnackbarProvider, 
  useSnackbar, 
  PageLayout, 
  getDefaultNavItems, 
  getDefaultMenuItems, 
  getDefaultUser, 
  getDefaultLogo 
} from '@luxgen/ui';
```

## Features Included

### ✅ **Navbar Features:**
- Logo and branding
- Navigation items
- User menu with profile, settings, logout
- Search functionality
- Notifications
- Responsive design

### ✅ **Subnavigation (Menu Layer):**
- Quick Actions menu
- Recent Groups menu
- Admin Tools menu
- Collapsible menu items
- Hierarchical navigation
- Responsive positioning

### ✅ **User Management:**
- User authentication state
- Profile management
- Role-based access
- Tenant-specific data

### ✅ **Responsive Design:**
- Mobile-first approach
- Tablet optimization
- Desktop layout
- Touch-friendly interactions

## Customization Options

### **Navigation Items**
```tsx
const customNavItems = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
  { id: 'custom', label: 'Custom Page', href: '/custom' },
  // Add your custom navigation items
];
```

### **Menu Items**
```tsx
const customMenuItems = [
  {
    id: 'custom-actions',
    label: 'Custom Actions',
    icon: <YourIcon />,
    children: [
      {
        id: 'action-1',
        label: 'Action 1',
        href: '/action-1',
        icon: <ActionIcon />,
      },
    ],
  },
];
```

### **Layout Options**
```tsx
<PageLayout
  menuPosition="top"           // 'top' | 'bottom' | 'left' | 'right'
  menuVariant="default"       // 'default' | 'compact' | 'minimal'
  menuCollapsible={true}      // Enable/disable menu collapsing
  menuDefaultCollapsed={false} // Default collapsed state
  responsive={true}           // Enable responsive design
  showSearch={true}          // Show/hide search
  showNotifications={true}   // Show/hide notifications
  notificationCount={3}      // Number of notifications
/>
```

## Examples

### **Dashboard Page**
```tsx
// apps/web/pages/groups/dashboard.tsx
<PageLayout
  navItems={getDefaultNavItems()}
  menuItems={getDefaultMenuItems()}
  user={user}
  onUserAction={handleUserAction}
  onSearch={handleSearch}
  onNotificationClick={handleNotificationClick}
>
  {/* Dashboard content */}
</PageLayout>
```

### **Groups Page**
```tsx
// apps/web/pages/groups/index.tsx
<PageLayout
  navItems={getDefaultNavItems()}
  menuItems={getDefaultMenuItems()}
  user={user}
  onUserAction={handleUserAction}
  onSearch={handleSearch}
  onNotificationClick={handleNotificationClick}
>
  {/* Groups content */}
</PageLayout>
```

## Benefits

### ✅ **Consistency:**
- Same navbar and subnavigation across all pages
- Consistent user experience
- Unified branding and styling

### ✅ **Maintainability:**
- Single source of truth for navigation
- Easy to update navigation items
- Centralized user management

### ✅ **Performance:**
- Optimized rendering
- Efficient state management
- Responsive design

### ✅ **Accessibility:**
- Keyboard navigation
- Screen reader support
- ARIA labels and descriptions

## Usage Guidelines

1. **Always use PageLayout** for pages that need navbar and subnavigation
2. **Use default navigation items** unless you need custom navigation
3. **Implement user action handlers** for profile, settings, and logout
4. **Add search functionality** for better user experience
5. **Handle notifications** appropriately
6. **Test responsive design** on different screen sizes

This template ensures that all pages have consistent navbar and subnavigation, providing a unified user experience across the entire application.
