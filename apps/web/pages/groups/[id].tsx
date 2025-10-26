import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { SnackbarProvider, useSnackbar, AppLayout, getDefaultUser, getDefaultLogo, getDefaultSidebarSections, Button } from '@luxgen/ui';
import { graphql } from 'graphql';

interface GroupDetailsData {
  id: string;
  name: string;
  description: string;
  totalUsers: number;
  activeUsers: number;
  maxUsers: number;
  role: string;
  status: string;
  createdAt: string;
  members: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    joinedAt: string;
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    user: string;
    timestamp: string;
  }>;
}

const GroupDetailsPageContent: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { showSuccess, showError, showInfo } = useSnackbar();
  const [user, setUser] = useState<any>(null);
  const [group, setGroup] = useState<GroupDetailsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  // Load group data
  useEffect(() => {
    if (id) {
      // Simulate API call

      connect with real db through graphql
      setTimeout(() => {
        setGroup({
          id: id as string,
          name: 'Development Team',
          description: 'A team focused on software development and engineering tasks.',
          totalUsers: 8,
          activeUsers: 6,
          maxUsers: 10,
          role: 'Super Admin',
          status: 'Active',
          createdAt: '2024-01-15',
          members: [
            { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin', joinedAt: '2024-01-15' },
            { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Member', joinedAt: '2024-01-16' },
            { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'Member', joinedAt: '2024-01-17' },
            { id: '4', name: 'Alice Brown', email: 'alice@example.com', role: 'Moderator', joinedAt: '2024-01-18' },
            { id: '5', name: 'Charlie Wilson', email: 'charlie@example.com', role: 'Member', joinedAt: '2024-01-19' },
          ],
          recentActivity: [
            { id: '1', action: 'New member joined', user: 'Alice Brown', timestamp: '2 hours ago' },
            { id: '2', action: 'Group settings updated', user: 'John Doe', timestamp: '1 day ago' },
            { id: '3', action: 'Member role changed', user: 'Bob Johnson', timestamp: '2 days ago' },
          ]
        });
        setIsLoading(false);
      }, 1000);
    }
  }, [id]);

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

  // Handle actions
  const handleEditGroup = () => {
    router.push(`/groups/${id}/edit`);
  };

  const handleManageMembers = () => {
    router.push(`/groups/${id}/members`);
  };

  const handleDeleteGroup = () => {
    if (confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      showSuccess('Group deleted successfully!');
      router.push('/groups/dashboard');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading group details...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-gray-600 text-xl mb-4">Group not found</div>
          <Button
            variant="primary"
            size="md"
            onClick={() => router.push('/groups/dashboard')}
            className="px-4 py-2"
          >
            Back to Groups
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{group.name} - LuxGen</title>
        <meta name="description" content={`Details for ${group.name} group`} />
      </Head>

      <AppLayout
        sidebarSections={getDefaultSidebarSections()}
        user={user}
        onUserAction={handleUserAction}
        showSearch={false}
        showNotifications={false}
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
                <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
                <p className="mt-2 text-gray-600">{group.description}</p>
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                  <span>Created: {new Date(group.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>Status: {group.status}</span>
                  <span>•</span>
                  <span>Your role: {group.role}</span>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => router.back()}
                  className="px-4 py-2"
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleEditGroup}
                  className="px-4 py-2"
                >
                  Edit Group
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Members</p>
                  <p className="text-2xl font-semibold text-gray-900">{group.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Members</p>
                  <p className="text-2xl font-semibold text-gray-900">{group.activeUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Capacity</p>
                  <p className="text-2xl font-semibold text-gray-900">{group.maxUsers === -1 ? '∞' : group.maxUsers}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Members List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Members</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManageMembers}
                  className="px-3 py-1"
                >
                  Manage
                </Button>
              </div>
              <div className="space-y-3">
                {group.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-600">{member.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{member.role}</p>
                      <p className="text-xs text-gray-500">Joined {new Date(member.joinedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {group.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600">by {activity.user}</p>
                      <p className="text-xs text-gray-500">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-900 mb-2">Danger Zone</h3>
            <p className="text-sm text-red-700 mb-4">Once you delete a group, there is no going back. Please be certain.</p>
            <Button
              variant="danger"
              size="md"
              onClick={handleDeleteGroup}
              className="px-4 py-2"
            >
              Delete Group
            </Button>
          </div>
        </div>
      </AppLayout>
    </>
  );
};

export default function GroupDetails() {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={3}>
      <GroupDetailsPageContent />
    </SnackbarProvider>
  );
}
