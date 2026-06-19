import { useRouter } from 'next/router';
import { createHandleUserAction } from '../../../lib/user-actions';
import Head from 'next/head';
import { useQuery } from '@apollo/client';
import {
  GroupMemberList,
  SnackbarProvider,
  AppLayout,
  getDefaultLogo,
  getDefaultSidebarSections,
} from '@luxgen/ui';
import { useLayoutUser } from '../../../lib/app-layout-user';
import { GET_GROUP, GET_GROUP_MEMBERS } from '../../../graphql/queries/groups';
import { PageLoadingState, PageEmptyState } from '../../../components/common/PageStates';

const GroupMembersPageContent: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const groupId = typeof id === 'string' ? id : '';
  const user = useLayoutUser();
  const handleUserAction = createHandleUserAction(router);

  const { data: groupData, loading: groupLoading, error: groupError } = useQuery(GET_GROUP, {
    variables: { id: groupId },
    skip: !groupId,
  });

  const {
    data: membersData,
    loading: membersLoading,
    refetch: refetchMembers,
  } = useQuery(GET_GROUP_MEMBERS, {
    variables: { groupId, first: 100 },
    skip: !groupId,
  });

  const group = groupData?.group;
  const loading = groupLoading || membersLoading;

  const members =
    membersData?.groupMembers?.edges?.map(
      (edge: {
        node: {
          id: string;
          role: string;
          joinedAt: string;
          user: { id: string; firstName: string; lastName: string; email: string };
        };
      }) => ({
        id: edge.node.user.id,
        user: edge.node.user,
        role: edge.node.role,
        joinedAt: edge.node.joinedAt,
        permissions: [] as string[],
      }),
    ) ?? [];

  if (!groupId || (loading && !group)) {
    return <PageLoadingState label="Loading members…" />;
  }

  if (groupError || !group) {
    return (
      <PageEmptyState
        icon="👥"
        title="Group not found"
        action={
          <button type="button" className="ios-btn-primary mt-4" onClick={() => router.push('/groups')}>
            Back to groups
          </button>
        }
      />
    );
  }

  return (
    <>
      <Head>
        <title>{group.name} - Members - LuxGen</title>
        <meta name="description" content={`Manage members for ${group.name} group`} />
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
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <button
                type="button"
                onClick={() => router.push(`/groups/${groupId}`)}
                className="ios-btn-plain p-1"
                aria-label="Back to group"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="ios-large-title">{group.name}</h1>
            </div>
            <p className="text-secondary">{group.description || 'Manage group members'}</p>
          </div>

          <GroupMemberList members={members} onRemoveMember={() => void refetchMembers()} />
        </div>
      </AppLayout>
    </>
  );
};

export default function GroupMembers() {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={3}>
      <GroupMembersPageContent />
    </SnackbarProvider>
  );
}
