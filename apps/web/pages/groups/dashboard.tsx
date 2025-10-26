import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { SnackbarProvider, useSnackbar, AppLayout, getDefaultNavItems, getDefaultUser, getDefaultLogo, getDefaultSidebarSections, Button } from '@luxgen/ui';

interface GroupDashboardData {
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

const GroupDashboardPageContent: React.FC = () => {
  const router = useRouter();
  const { showSuccess, showError, showInfo } = useSnackbar();
  const [user, setUser] = useState<any>(null);
  const [groups, setGroups] = useState<GroupDashboardData[]>([
    {
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
        { id: '4', name: 'Alice Brown' },
        { id: '5', name: 'Charlie Wilson' },
      ],
      tasks: 12,
      comments: 8,
    },
    {
      id: '2',
      name: 'Marketing Team',
      totalUsers: 5,
      activeUsers: 4,
      maxUsers: 8,
      role: 'Admin',
      progress: 5,
      maxProgress: 10,
      status: 'Active',
      members: [
        { id: '1', name: 'Sarah Davis' },
        { id: '2', name: 'Mike Wilson' },
        { id: '3', name: 'Lisa Brown' },
      ],
      tasks: 8,
      comments: 15,
    },
    {
      id: '3',
      name: 'Sales Team',
      totalUsers: 12,
      activeUsers: 9,
      maxUsers: 15,
      role: 'Moderator',
      progress: 3,
      maxProgress: 10,
      status: 'Pending',
      members: [
        { id: '1', name: 'Tom Wilson' },
        { id: '2', name: 'Emma Davis' },
        { id: '3', name: 'David Lee' },
        { id: '4', name: 'Sophie Chen' },
      ],
      tasks: 5,
      comments: 3,
    },
  ]);

  const handleEditGroup = (groupId: string) => {
    router.push(`/groups/${groupId}/edit`);
  };

  const handleViewDetails = (groupId: string) => {
    router.push(`/groups/${groupId}`);
  };

  const handleManageUsers = (groupId: string) => {
    router.push(`/groups/${groupId}/members`);
  };

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
        <title>Group Dashboard - LuxGen</title>
        <meta name="description" content="Group management dashboard for admins and super admins" />
      </Head>

             <AppLayout
               sidebarSections={getDefaultSidebarSections()}
               user={user}
               onUserAction={handleUserAction}
               onSearch={handleSearch}
               onNotificationClick={handleNotificationClick}
               showSearch={true}
               showNotifications={true}
               notificationCount={3}
               searchPlaceholder="Search groups, users..."
               logo={getDefaultLogo()}
               sidebarCollapsible={true}
               sidebarDefaultCollapsed={false}
               responsive={true}
             >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Group Dashboard</h1>
                <p className="mt-2 text-gray-600">Manage and monitor your groups</p>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => router.push('/groups/create')}
                  className="px-4 py-2"
                >
                  Create Group
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => router.push('/groups/analytics')}
                  className="px-4 py-2"
                >
                  View Analytics
                </Button>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Groups</p>
                  <p className="text-2xl font-semibold text-gray-900">{groups.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {groups.reduce((sum, group) => sum + group.totalUsers, 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {groups.reduce((sum, group) => sum + group.activeUsers, 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {groups.reduce((sum, group) => sum + (group.tasks || 0), 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Groups Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <div key={group.id} className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{group.name}</h3>
                <p className="text-sm text-gray-600 mb-4">Total Users: {group.totalUsers}</p>
                <p className="text-sm text-gray-600 mb-4">Active Users: {group.activeUsers}</p>
                <p className="text-sm text-gray-600 mb-4">Status: {group.status}</p>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditGroup(group.id)}
                    className="px-3 py-1"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(group.id)}
                    className="px-3 py-1"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => router.push('/groups/create')}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200 w-full"
              >
                <div className="text-center">
                  <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <p className="mt-2 text-sm font-medium text-gray-900">Create New Group</p>
                  <p className="text-sm text-gray-600">Set up a new group for your team</p>
                </div>
              </button>

              <button
                onClick={() => router.push('/users/invite')}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors duration-200 w-full"
              >
                <div className="text-center">
                  <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <p className="mt-2 text-sm font-medium text-gray-900">Invite Users</p>
                  <p className="text-sm text-gray-600">Add new members to your groups</p>
                </div>
              </button>

              <button
                onClick={() => router.push('/reports/generate')}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors duration-200 w-full"
              >
                <div className="text-center">
                  <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="mt-2 text-sm font-medium text-gray-900">View Reports</p>
                  <p className="text-sm text-gray-600">Generate group performance reports</p>
                </div>
              </button>
            </div>
          </div>
        </div>
             </AppLayout>
    </>
  );
};

export default function GroupDashboard() {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={3}>
      <GroupDashboardPageContent />
    </SnackbarProvider>
  );
}