import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { NavBar, NavItem, UserMenu, Sidebar, SidebarSection } from '@luxgen/ui';
import { TenantBanner } from '../components/tenant/TenantBanner';

interface DashboardProps {
  tenant: string;
}

export default function Dashboard({ tenant }: DashboardProps) {
  const router = useRouter();
  const [user, setUser] = useState<UserMenu | null>(null);
  const [loading, setLoading] = useState(true);

  // Navigation items for the dashboard
  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/dashboard',
    },
    {
      id: 'courses',
      label: 'Courses',
      href: '/courses',
    },
    {
      id: 'students',
      label: 'Students',
      href: '/students',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      href: '/analytics',
    },
    {
      id: 'settings',
      label: 'Settings',
      href: '/settings',
    },
  ];

  // Sidebar sections for the dashboard
  const sidebarSections: SidebarSection[] = [
    {
      id: 'main',
      title: 'Main Navigation',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          href: '/dashboard',
          icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
            </svg>
          ),
        },
        {
          id: 'courses',
          label: 'Courses',
          href: '/courses',
          icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          ),
          children: [
            {
              id: 'all-courses',
              label: 'All Courses',
              href: '/courses/all',
            },
            {
              id: 'my-courses',
              label: 'My Courses',
              href: '/courses/my',
            },
            {
              id: 'course-analytics',
              label: 'Course Analytics',
              href: '/courses/analytics',
            },
          ],
        },
        {
          id: 'students',
          label: 'Students',
          href: '/students',
          icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          ),
          children: [
            {
              id: 'all-students',
              label: 'All Students',
              href: '/students/all',
            },
            {
              id: 'student-progress',
              label: 'Student Progress',
              href: '/students/progress',
            },
            {
              id: 'student-reports',
              label: 'Student Reports',
              href: '/students/reports',
            },
          ],
        },
        {
          id: 'analytics',
          label: 'Analytics',
          href: '/analytics',
          icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          ),
        },
        {
          id: 'groups',
          label: 'Groups',
          href: '/groups',
          icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          ),
          children: [
            {
              id: 'group-dashboard',
              label: 'Group Dashboard',
              href: '/groups/dashboard',
            },
            {
              id: 'all-groups',
              label: 'All Groups',
              href: '/groups',
            },
            {
              id: 'create-group',
              label: 'Create Group',
              href: '/groups/create',
            },
            {
              id: 'group-reports',
              label: 'Group Reports',
              href: '/groups/reports',
            },
          ],
        },
      ],
    },
    {
      id: 'settings',
      title: 'Settings',
      items: [
        {
          id: 'profile',
          label: 'Profile',
          href: '/profile',
          icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ),
        },
        {
          id: 'preferences',
          label: 'Preferences',
          href: '/preferences',
          icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ),
        },
        {
          id: 'notifications',
          label: 'Notifications',
          href: '/notifications',
          icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          ),
          badge: 3,
        },
      ],
    },
  ];

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    
    if (!token) {
      router.push('/login');
      return;
    }

    // Load user data from localStorage
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
      }
    }

    setLoading(false);
  }, [router]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar
        items={navItems}
        user={user}
        onUserAction={handleUserAction}
        showSearch={true}
        onSearch={handleSearch}
        searchPlaceholder="Search courses, students..."
        showNotifications={true}
        notificationCount={3}
        onNotificationClick={handleNotificationClick}
        logo={{
          text: 'LuxGen',
          href: '/dashboard',
        }}
        variant="default"
        position="sticky"
        className="shadow-sm"
      />
      
      <div className="flex">
        <Sidebar
          sections={sidebarSections}
          user={user}
          onUserAction={handleUserAction}
          onItemClick={(item) => {
            console.log('Sidebar item clicked:', item);
            // Handle sidebar item clicks
          }}
          logo={{
            text: 'LuxGen',
            href: '/dashboard',
          }}
          variant="default"
          position="fixed"
          width="normal"
          collapsible={true}
          defaultCollapsed={false}
          showUserSection={true}
          showLogo={true}
          className="shadow-sm"
        />
        <main className="flex-1 p-6 ml-64">
          <TenantBanner tenant={tenant} />
          <div className="mt-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Dashboard
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Total Courses
                </h3>
                <p className="text-3xl font-bold text-blue-600">12</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Active Students
                </h3>
                <p className="text-3xl font-bold text-green-600">156</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Completion Rate
                </h3>
                <p className="text-3xl font-bold text-purple-600">87%</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export const getServerSideProps = async (context: any) => {
  const host = context.req.headers.host;
  const tenant = host?.split('.')[0] || 'default';

  return {
    props: {
      tenant,
    },
  };
};
