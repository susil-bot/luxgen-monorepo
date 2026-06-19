import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createHandleUserAction } from '../../../lib/user-actions';
import Head from 'next/head';
import {
  SnackbarProvider,
  useSnackbar,
  AppLayout,
  getDefaultUser,
  getDefaultLogo,
  getDefaultSidebarSections,
  Button,
} from '@luxgen/ui';
import { PageLoadingState } from '../../../components/common/PageStates';

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
  const { showSuccess, showError, showInfo: _showInfo } = useSnackbar();
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
  const handleUserAction = createHandleUserAction(router);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      showSuccess('Group updated successfully!');
      router.push(`/groups/${id}`);
    } catch {
      showError('Failed to update group. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  if (isLoading) {
    return <PageLoadingState label="Loading group…" />;
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
                <h1 className="ios-large-title">Edit Group</h1>
                <p className="mt-1 text-secondary text-sm">Update group settings and information</p>
              </div>
              <Button variant="outline" size="md" onClick={() => router.push(`/groups/${id}`)} className="px-4 py-2">
                Cancel
              </Button>
            </div>
          </div>

          {/* Form */}
          <div className="ios-card p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="ios-form-group">
                <label htmlFor="name" className="text-sm text-secondary">
                  Group Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="ios-input"
                  placeholder="Enter group name"
                />
              </div>

              <div className="ios-form-group">
                <label htmlFor="description" className="text-sm text-secondary">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="ios-input min-h-[100px]"
                  placeholder="Describe the purpose of this group"
                />
              </div>

              <div className="ios-form-group">
                <label htmlFor="maxUsers" className="text-sm text-secondary">
                  Maximum Users
                </label>
                <select id="maxUsers" name="maxUsers" value={formData.maxUsers} onChange={handleInputChange} className="ios-input">
                  <option value={5}>5 users</option>
                  <option value={10}>10 users</option>
                  <option value={25}>25 users</option>
                  <option value={50}>50 users</option>
                  <option value={100}>100 users</option>
                  <option value={-1}>Unlimited</option>
                </select>
              </div>

              <div className="ios-form-group">
                <label htmlFor="status" className="text-sm text-secondary">
                  Status
                </label>
                <select id="status" name="status" value={formData.status} onChange={handleInputChange} className="ios-input">
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
                  className="h-4 w-4"
                  style={{ accentColor: 'var(--color-blue)' }}
                />
                <label htmlFor="isPublic" className="ml-2 text-sm text-secondary">
                  Make this group public (visible to all users)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-6" style={{ borderTop: '1px solid var(--color-separator)' }}>
                <button type="button" className="ios-btn-secondary" onClick={() => router.push(`/groups/${id}`)}>
                  Cancel
                </button>
                <button type="submit" className="ios-btn-primary" disabled={isSaving || !formData.name.trim()}>
                  {isSaving ? 'Saving…' : 'Save Changes'}
                </button>
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
