import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { SnackbarProvider, useSnackbar, PageLayout, getDefaultNavItems, getDefaultMenuItems, getDefaultUser, getDefaultLogo } from '@luxgen/ui';

const GroupsPageContent: React.FC = () => {
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
        <title>Groups - LuxGen</title>
        <meta name="description" content="Manage your groups and team members" />
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
        searchPlaceholder="Search groups, users..."
        logo={getDefaultLogo()}
        menuPosition="top"
        menuVariant="default"
        menuCollapsible={true}
        menuDefaultCollapsed={false}
        responsive={true}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Groups</h1>
                <p className="mt-2 text-gray-600">Manage your groups and team members</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => router.push('/groups/create')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  Create Group
                </button>
                <button
                  onClick={() => router.push('/groups/analytics')}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200"
                >
                  View Analytics
                </button>
              </div>
            </div>
          </div>

          {/* Groups List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">All Groups</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Sample Groups */}
                <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Development Team</h3>
                  <p className="text-sm text-gray-600 mb-4">Software development team</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">8 members</span>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      View Details
                    </button>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Marketing Team</h3>
                  <p className="text-sm text-gray-600 mb-4">Marketing and communications</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">5 members</span>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      View Details
                    </button>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Sales Team</h3>
                  <p className="text-sm text-gray-600 mb-4">Sales and customer relations</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">12 members</span>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    </>
  );
};

export default function Groups() {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={3}>
      <GroupsPageContent />
    </SnackbarProvider>
  );
}
