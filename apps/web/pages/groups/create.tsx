import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  SnackbarProvider,
  useSnackbar,
  AppLayout,
  getDefaultUser,
  getDefaultLogo,
  getDefaultSidebarSections,
} from '@luxgen/ui';

const CreateGroupPageContent: React.FC = () => {
  const router = useRouter();
  const { showSuccess } = useSnackbar();
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    maxUsers: '',
    isPublic: false,
  });

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
      } catch {
        setUser(getDefaultUser());
      }
    } else {
      setUser(getDefaultUser());
    }
  }, []);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showSuccess('Group created successfully!');
    router.push('/groups');
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '9px 12px',
    backgroundColor: 'var(--color-fill-quaternary)',
    border: '1.5px solid var(--color-separator-opaque)',
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    color: 'var(--color-label-primary)',
    outline: 'none',
    fontFamily: 'inherit',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--color-label-secondary)',
    marginBottom: '6px',
  };

  return (
    <>
      <Head>
        <title>Create Group - LuxGen</title>
        <meta name="description" content="Create a new group" />
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
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary">Create Group</h1>
              <p className="mt-1 text-secondary">Set up a new group for your team</p>
            </div>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                backgroundColor: 'var(--color-fill-secondary)',
                color: 'var(--color-label-primary)',
              }}
            >
              Cancel
            </button>
          </div>

          {/* Form Card */}
          <div className="surface-elevated p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label style={labelStyle}>Group Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter group name"
                  className="input-field"
                />
              </div>

              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the purpose of this group"
                  className="input-field"
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={labelStyle}>Maximum Users</label>
                <input
                  type="number"
                  name="maxUsers"
                  min="1"
                  value={formData.maxUsers}
                  onChange={handleChange}
                  placeholder="50"
                  className="input-field"
                />
              </div>

              <div className="flex items-center gap-3 py-1">
                <div
                  onClick={() => setFormData((prev) => ({ ...prev, isPublic: !prev.isPublic }))}
                  className="relative w-10 h-6 rounded-full cursor-pointer transition-colors duration-200"
                  style={{ backgroundColor: formData.isPublic ? 'var(--color-green)' : 'var(--color-fill-primary)' }}
                >
                  <span
                    className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
                    style={{ transform: formData.isPublic ? 'translateX(16px)' : 'translateX(0)' }}
                  />
                </div>
                <span className="text-sm text-primary">Make this group public</span>
              </div>

              <div className="flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid var(--color-separator)' }}>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{
                    backgroundColor: 'var(--color-fill-secondary)',
                    color: 'var(--color-label-primary)',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                  style={{ backgroundColor: 'var(--color-blue)' }}
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      </AppLayout>
    </>
  );
};

export default function CreateGroupPage() {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={3}>
      <CreateGroupPageContent />
    </SnackbarProvider>
  );
}
