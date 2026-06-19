import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { SnackbarProvider, AppLayout, getDefaultLogo, getDefaultSidebarSections } from '@luxgen/ui';
import { createHandleUserAction } from '../../lib/user-actions';
import { useLayoutUser } from '../../lib/app-layout-user';
import { GET_GROUPS } from '../../graphql/queries/groups';
import { PageLoadingState, PageEmptyState } from '../../components/common/PageStates';

const GroupsPageContent: React.FC = () => {
  const router = useRouter();
  const user = useLayoutUser();
  const handleUserAction = createHandleUserAction(router);

  const { data, loading, error } = useQuery(GET_GROUPS, {
    variables: { first: 50, isActive: true },
    fetchPolicy: 'cache-and-network',
  });

  const groups = data?.groups?.edges?.map((edge: { node: GroupNode }) => edge.node) ?? [];

  return (
    <>
      <Head>
        <title>Groups - LuxGen</title>
        <meta name="description" content="Manage your groups and team members" />
      </Head>

      <AppLayout
        sidebarSections={getDefaultSidebarSections()}
        user={user ?? undefined}
        onUserAction={handleUserAction}
        showSearch={false}
        showNotifications={false}
        logo={getDefaultLogo()}
        sidebarCollapsible={true}
        sidebarDefaultCollapsed={false}
        responsive={true}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h1 className="ios-large-title">Groups</h1>
              <p className="mt-1 text-secondary text-sm">Manage your groups and team members</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => router.push('/groups/create')} className="ios-btn-primary">
                + Create Group
              </button>
              <button type="button" onClick={() => router.push('/groups/dashboard')} className="ios-btn-secondary">
                Dashboard
              </button>
              <button type="button" onClick={() => router.push('/groups/analytics')} className="ios-btn-secondary">
                Analytics
              </button>
            </div>
          </div>

          {loading && groups.length === 0 && <PageLoadingState label="Loading groups…" fullScreen={false} />}

          {error && groups.length === 0 && (
            <PageEmptyState
              icon="⚠️"
              title="Could not load groups"
              subtitle={error.message}
              action={
                <button type="button" className="ios-btn-primary mt-4" onClick={() => router.push('/login')}>
                  Sign in
                </button>
              }
            />
          )}

          {!loading && !error && groups.length === 0 && (
            <PageEmptyState
              icon="👥"
              title="No groups yet"
              subtitle="Create your first group to organize team members."
              action={
                <button type="button" className="ios-btn-primary mt-4" onClick={() => router.push('/groups/create')}>
                  Create group
                </button>
              }
            />
          )}

          {groups.length > 0 && (
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
                      {(group.icon || group.name).charAt(0)}
                    </div>
                    <span className={`badge ${group.isActive ? 'badge-green' : 'badge-orange'}`}>
                      {group.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-primary mb-1">{group.name}</h3>
                  <p className="text-sm text-secondary mb-4 leading-relaxed">
                    {group.description || 'No description'}
                  </p>

                  <div
                    className="flex items-center justify-between pt-3"
                    style={{ borderTop: '1px solid var(--color-separator)' }}
                  >
                    <span className="text-xs text-secondary">{group.memberCount} members</span>
                    <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => router.push(`/groups/${group.id}/edit`)}
                        className="ios-btn-plain text-sm py-1 px-2"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
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
          )}
        </div>
      </AppLayout>
    </>
  );
};

interface GroupNode {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  memberCount: number;
  isActive: boolean;
}

export default function GroupsPage() {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={3}>
      <GroupsPageContent />
    </SnackbarProvider>
  );
}
