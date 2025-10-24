import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { NavBar, NavItem, UserMenu } from '@luxgen/ui';
import { Sidebar } from '../components/layout/Sidebar';
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
        <Sidebar />
        <main className="flex-1 p-6">
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
