import { useRouter } from 'next/router';
import Head from 'next/head';
import { useQuery } from '@apollo/client';
import { SnackbarProvider, AppLayout, getDefaultLogo, getDefaultSidebarSections } from '@luxgen/ui';
import { createHandleUserAction } from '../../lib/user-actions';
import { useLayoutUser } from '../../lib/app-layout-user';
import { GET_GROUPS } from '../../graphql/queries/groups';
import { PageLoadingState, PageEmptyState } from '../../components/common/PageStates';

interface GroupNode {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  isActive: boolean;
}

const GroupDashboardPageContent: React.FC = () => {
  const router = useRouter();
  const user = useLayoutUser();
  const handleUserAction = createHandleUserAction(router);

  const { data, loading, error } = useQuery(GET_GROUPS, {
    variables: { first: 100, isActive: undefined },
    fetchPolicy: 'cache-and-network',
  });

  const groups: GroupNode[] = data?.groups?.edges?.map((edge: { node: GroupNode }) => edge.node) ?? [];
  const totalGroups = data?.groups?.totalCount ?? groups.length;
  const totalMembers = groups.reduce((sum, g) => sum + (g.memberCount ?? 0), 0);
  const activeGroups = groups.filter((g) => g.isActive).length;
  const avgMembers = totalGroups > 0 ? Math.round(totalMembers / totalGroups) : 0;

  return (
    <>
      <Head>
        <title>Group Dashboard - LuxGen</title>
        <meta name="description" content="Group management dashboard for admins and super admins" />
      </Head>

      <AppLayout
        sidebarSections={getDefaultSidebarSections()}
        user={user ?? undefined}
        onUserAction={handleUserAction}
        showSearch={true}
        showNotifications={true}
        notificationCount={0}
        searchPlaceholder="Search groups…"
        logo={getDefaultLogo()}
        sidebarCollapsible={true}
        sidebarDefaultCollapsed={false}
        responsive={true}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex items-end justify-between flex-wrap gap-4">
            <div>
              <h1 className="ios-large-title">Group Dashboard</h1>
              <p className="mt-1 text-secondary text-sm">Manage and monitor your groups</p>
            </div>
            <div className="flex gap-2">
              <button type="button" className="ios-btn-primary" onClick={() => router.push('/groups/create')}>
                Create Group
              </button>
              <button type="button" className="ios-btn-secondary" onClick={() => router.push('/groups/analytics')}>
                Analytics
              </button>
            </div>
          </div>

          {loading && groups.length === 0 && <PageLoadingState label="Loading dashboard…" fullScreen={false} />}

          {error && groups.length === 0 && (
            <PageEmptyState icon="⚠️" title="Could not load groups" subtitle={error.message} />
          )}

          {(groups.length > 0 || (!loading && !error)) && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="ios-metric-tile">
                  <span className="metric-label">Total Groups</span>
                  <span className="metric-value">{totalGroups}</span>
                </div>
                <div className="ios-metric-tile">
                  <span className="metric-label">Total Members</span>
                  <span className="metric-value">{totalMembers}</span>
                </div>
                <div className="ios-metric-tile">
                  <span className="metric-label">Active Groups</span>
                  <span className="metric-value">{activeGroups}</span>
                </div>
                <div className="ios-metric-tile">
                  <span className="metric-label">Avg / Group</span>
                  <span className="metric-value">{avgMembers}</span>
                  <span className="metric-sub">members per group</span>
                </div>
              </div>

              {groups.length === 0 ? (
                <PageEmptyState
                  icon="👥"
                  title="No groups yet"
                  subtitle="Create a group to see it on this dashboard."
                  action={
                    <button type="button" className="ios-btn-primary mt-4" onClick={() => router.push('/groups/create')}>
                      Create group
                    </button>
                  }
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {groups.map((group) => (
                    <div key={group.id} className="ios-card p-5">
                      <h3 className="text-base font-semibold text-primary mb-2">{group.name}</h3>
                      <p className="text-sm text-secondary mb-1">
                        {group.memberCount} members · {group.isActive ? 'Active' : 'Inactive'}
                      </p>
                      {group.description && (
                        <p className="text-sm text-secondary mb-4 line-clamp-2">{group.description}</p>
                      )}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="ios-btn-secondary text-sm"
                          onClick={() => router.push(`/groups/${group.id}/edit`)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="ios-btn-plain text-sm"
                          onClick={() => router.push(`/groups/${group.id}`)}
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-8 ios-card p-6">
                <h3 className="text-base font-semibold text-primary mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Create New Group', sub: 'Set up a team workspace', path: '/groups/create' },
                    { label: 'Browse Groups', sub: 'View all groups', path: '/groups' },
                    { label: 'Group Analytics', sub: 'Engagement and growth', path: '/groups/analytics' },
                  ].map((action) => (
                    <button
                      key={action.path}
                      type="button"
                      onClick={() => router.push(action.path)}
                      className="p-4 rounded-xl w-full text-left transition-opacity hover:opacity-80"
                      style={{
                        border: '1.5px dashed var(--color-separator)',
                        backgroundColor: 'var(--color-fill-quaternary)',
                      }}
                    >
                      <p className="text-sm font-medium text-primary">{action.label}</p>
                      <p className="text-sm text-secondary mt-1">{action.sub}</p>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
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
