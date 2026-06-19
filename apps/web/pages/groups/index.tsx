import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { createHandleUserAction } from '../../lib/user-actions';
import { SnackbarProvider, AppLayout, getDefaultUser, getDefaultLogo, getDefaultSidebarSections } from '@luxgen/ui';

const GroupsPageContent: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

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

  const handleUserAction = createHandleUserAction(router);

  const groups = [
    {
      id: '1',
      name: 'Development Team',
      description: 'Software development and engineering team',
      members: 12,
      status: 'Active',
    },
    { id: '2', name: 'Marketing Team', description: 'Marketing and communications team', members: 8, status: 'Active' },
    { id: '3', name: 'Design Team', description: 'UI/UX design and creative team', members: 6, status: 'Active' },
  ];

  return (
    <>
      <Head>
        <title>Groups - LuxGen</title>
        <meta name="description" content="Manage your groups and team members" />
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
          {/* iOS Large Title header */}
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h1 className="ios-large-title">Groups</h1>
              <p className="mt-1 text-secondary text-sm">Manage your groups and team members</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => router.push('/groups/create')} className="ios-btn-primary">
                + Create Group
              </button>
              <button onClick={() => router.push('/groups/analytics')} className="ios-btn-secondary">
                Analytics
              </button>
            </div>
          </div>

          {/* Groups Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {groups.map((group) => (
              <div
                key={group.id}
                className="ios-card p-5 transition-all duration-200 hover:shadow-md"
                style={{ cursor: 'pointer' }}
                onClick={() => router.push(`/groups/${group.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="ios-avatar ios-avatar-md" style={{ borderRadius: 'var(--radius-lg)' }}>
                    {group.name.charAt(0)}
                  </div>
                  <span className="badge badge-green">{group.status}</span>
                </div>

                <h3 className="text-base font-semibold text-primary mb-1">{group.name}</h3>
                <p className="text-sm text-secondary mb-4 leading-relaxed">{group.description}</p>

                <div
                  className="flex items-center justify-between pt-3"
                  style={{ borderTop: '1px solid var(--color-separator)' }}
                >
                  <div className="flex items-center gap-1.5">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-secondary"
                    >
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <span className="text-xs text-secondary">{group.members} members</span>
                  </div>
                  <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => router.push(`/groups/${group.id}/edit`)}
                      className="ios-btn-plain text-sm py-1 px-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => router.push(`/groups/${group.id}`)}
                      className="ios-btn-plain text-sm py-1 px-2"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AppLayout>
    </>
  );
};

export default function GroupsPage() {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={3}>
      <GroupsPageContent />
    </SnackbarProvider>
  );
}
