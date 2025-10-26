import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { SnackbarProvider, useSnackbar, AppLayout, getDefaultUser, getDefaultLogo, getDefaultSidebarSections, Button } from '@luxgen/ui';

interface GroupEditData {
  id: string;
  name: string;
  description: string;
  maxUsers: number;
  isPublic: boolean;
  status: string;
}

const EditGroupPageContent: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { showSuccess, showError, showInfo } = useSnackbar();
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState<GroupEditData>({
    id: '',
    name: '',
    description: '',
    maxUsers: 10,
    isPublic: false,
    status: 'Active',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
      setTimeout(() => {
        setFormData({
          id: id as string,
          name: 'Development Team',
          description: 'A team focused on software development and engineering tasks.',
          maxUsers: 10,
          isPublic: false,
          status: 'Active',
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showSuccess('Group updated successfully!');
      router.push(`/groups/${id}`);
    } catch (error) {
      showError('Failed to update group. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
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

  return (
    <>
      <Head>
        <title>Edit {formData.name} - LuxGen</title>
        <meta name="description" content={`Edit ${formData.name} group settings`} />
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Group</h1>
                <p className="mt-2 text-gray-600">Update group settings and information</p>
              </div>
              <Button
                variant="outline"
                size="md"
                onClick={() => router.push(`/groups/${id}`)}
                className="px-4 py-2"
              >
                Cancel
              </Button>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Group Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Group Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter group name"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe the purpose of this group"
                />
              </div>

              {/* Max Users */}
              <div>
                <label htmlFor="maxUsers" className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Users
                </label>
                <select
                  id="maxUsers"
                  name="maxUsers"
                  value={formData.maxUsers}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={5}>5 users</option>
                  <option value={10}>10 users</option>
                  <option value={25}>25 users</option>
                  <option value={50}>50 users</option>
                  <option value={100}>100 users</option>
                  <option value={-1}>Unlimited</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Pending">Pending</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              {/* Public Group */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                  Make this group public (visible to all users)
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => router.push(`/groups/${id}`)}
                  className="px-6 py-2"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  disabled={isSaving || !formData.name.trim()}
                  className="px-6 py-2"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </AppLayout>
    </>
  );
};

export default function EditGroup() {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={3}>
      <EditGroupPageContent />
    </SnackbarProvider>
  );
}
