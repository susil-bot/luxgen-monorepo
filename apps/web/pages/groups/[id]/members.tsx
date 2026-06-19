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
import { PageLoadingState, PageEmptyState } from '../../../components/common/PageStates';

const GroupMembersPageContent: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const groupId = typeof id === 'string' ? id : '';
  const user = useLayoutUser();
  const handleUserAction = createHandleUserAction(router);

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

  if (loading) {
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
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <button type="button" onClick={() => router.push('/groups')} className="ios-btn-plain p-1" aria-label="Back to groups">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h1 className="ios-large-title">{group.name}</h1>
                </div>
                <p className="text-secondary">{group.description}</p>
              </div>

              <div className="flex items-center space-x-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: group.color }}
                >
                  {group.icon ? (
                    <span className="text-xl">{group.icon}</span>
                  ) : (
                    <span className="text-xl">{group.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
              </div>
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
