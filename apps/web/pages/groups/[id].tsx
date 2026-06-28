import { useRouter } from 'next/router';
import { useAppShellConfig } from '../../lib/app-shell-config';
import { createHandleUserAction } from '../../lib/user-actions';
import Head from 'next/head';
import { useQuery, useMutation } from '@apollo/client';
import { SnackbarProvider, useSnackbar, AppLayout } from '@luxgen/ui';
import { useLayoutUser } from '../../lib/app-layout-user';
import { useAppLayoutHeader } from '../../lib/app-layout-header';
import { GET_GROUP, GET_GROUP_MEMBERS, DELETE_GROUP } from '../../graphql/queries/groups';
import { PageLoadingState, PageEmptyState } from '../../components/common/PageStates';

const GroupDetailsPageContent: React.FC = () => {
  const { sidebarSections, logo } = useAppShellConfig();
  const router = useRouter();
  const { id } = router.query;
  const groupId = typeof id === 'string' ? id : '';
  const { showSuccess, showError } = useSnackbar();
  const user = useLayoutUser();
  const handleUserAction = createHandleUserAction(router);
  const headerProps = useAppLayoutHeader();

  const { data, loading, error } = useQuery(GET_GROUP, {
    variables: { id: groupId },
    skip: !groupId,
    fetchPolicy: 'cache-and-network',
  });

  const { data: membersData } = useQuery(GET_GROUP_MEMBERS, {
    variables: { groupId, first: 10 },
    skip: !groupId,
    fetchPolicy: 'cache-and-network',
  });

  const group = data?.group;
  const members =
    membersData?.groupMembers?.edges?.map(
      (edge: {
        node: {
          id: string;
          role: string;
          joinedAt: string;
          user: { firstName: string; lastName: string; email: string };
        };
      }) => edge.node,
    ) ?? [];

  const handleEditGroup = () => {
    void router.push(`/groups/${groupId}/edit`);
  };

  const handleManageMembers = () => {
    void router.push(`/groups/${groupId}/members`);
  };

  const [deleteGroupMutation, { loading: deleting }] = useMutation(DELETE_GROUP);

  const handleDeleteGroup = async () => {
    if (!groupId || !confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      return;
    }
    try {
      await deleteGroupMutation({ variables: { id: groupId } });
      showSuccess('Group deleted');
      void router.push('/groups');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to delete group';
      showError(message);
    }
  };

  if (!groupId || (loading && !group)) {
    return <PageLoadingState label="Loading group…" />;
  }

  if (error || !group) {
    return (
      <PageEmptyState
        icon="👥"
        title="Group not found"
        subtitle={error?.message ?? 'This group may have been removed.'}
        action={
          <button type="button" className="ios-btn-primary mt-4" onClick={() => router.push('/groups')}>
            Back to groups
          </button>
        }
      />
    );
  }

  const maxMembers = group.settings?.maxMembers;
  const capacityLabel = maxMembers ? String(maxMembers) : '∞';

  return (
    <>
      <Head>
        <title>{group.name} - LuxGen</title>
        <meta name="description" content={`Details for ${group.name} group`} />
      </Head>

      <AppLayout
        sidebarSections={sidebarSections}
        user={user ?? undefined}
        onUserAction={handleUserAction}
        {...headerProps}
        logo={logo}
        sidebarCollapsible={true}
        sidebarDefaultCollapsed={false}
        responsive={true}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="ios-large-title">{group.name}</h1>
              <p className="mt-2 text-secondary">{group.description || 'No description'}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-secondary">
                <span>Created {new Date(group.createdAt).toLocaleDateString()}</span>
                <span className={`badge ${group.isActive ? 'badge-green' : 'badge-orange'}`}>
                  {group.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" className="ios-btn-secondary" onClick={() => router.back()}>
                Back
              </button>
              <button type="button" className="ios-btn-primary" onClick={handleEditGroup}>
                Edit Group
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="ios-metric-tile">
              <span className="metric-label">Members</span>
              <span className="metric-value">{group.memberCount}</span>
            </div>
            <div className="ios-metric-tile">
              <span className="metric-label">Capacity</span>
              <span className="metric-value">{capacityLabel}</span>
            </div>
            <div className="ios-metric-tile">
              <span className="metric-label">Status</span>
              <span className="metric-value">{group.isActive ? 'Active' : 'Off'}</span>
            </div>
          </div>

          <div className="ios-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-primary">Members</h3>
              <button type="button" className="ios-btn-secondary text-sm" onClick={handleManageMembers}>
                Manage
              </button>
            </div>
            {members.length === 0 ? (
              <p className="text-sm text-secondary">No members yet.</p>
            ) : (
              <div className="space-y-3">
                {members.map((member: (typeof members)[number]) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-xl"
                    style={{ backgroundColor: 'var(--color-fill-quaternary)' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="ios-avatar ios-avatar-sm">{member.user.firstName.charAt(0)}</div>
                      <div>
                        <p className="font-medium text-primary">
                          {member.user.firstName} {member.user.lastName}
                        </p>
                        <p className="text-sm text-secondary">{member.user.email}</p>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-medium text-primary">{member.role}</p>
                      <p className="text-xs text-secondary">Joined {new Date(member.joinedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            className="mt-8 p-6 rounded-xl"
            style={{ backgroundColor: 'rgba(255,59,48,0.08)', border: '1px solid rgba(255,59,48,0.2)' }}
          >
            <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--color-red)' }}>
              Danger Zone
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--color-red)', opacity: 0.8 }}>
              Once you delete a group, there is no going back. Please be certain.
            </p>
            <button type="button" className="ios-btn-secondary" onClick={handleDeleteGroup} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Delete Group'}
            </button>
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
