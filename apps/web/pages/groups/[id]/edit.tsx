import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createHandleUserAction } from '../../../lib/user-actions';
import Head from 'next/head';
import { useQuery, useMutation } from '@apollo/client';
import { SnackbarProvider, useSnackbar, AppLayout, getDefaultLogo, getDefaultSidebarSections } from '@luxgen/ui';
import { useLayoutUser } from '../../../lib/app-layout-user';
import { useAppLayoutHeader } from '../../../lib/app-layout-header';
import { GET_GROUP, UPDATE_GROUP } from '../../../graphql/queries/groups';
import { PageLoadingState, PageEmptyState } from '../../../components/common/PageStates';

const EditGroupPageContent: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const groupId = typeof id === 'string' ? id : '';
  const { showSuccess, showError } = useSnackbar();
  const user = useLayoutUser();
  const handleUserAction = createHandleUserAction(router);
  const headerProps = useAppLayoutHeader();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [maxUsers, setMaxUsers] = useState(10);

  const { data, loading, error } = useQuery(GET_GROUP, {
    variables: { id: groupId },
    skip: !groupId,
    fetchPolicy: 'cache-and-network',
  });

  const [updateGroup, { loading: isSaving }] = useMutation(UPDATE_GROUP);

  useEffect(() => {
    const group = data?.group;
    if (!group) return;
    setName(group.name);
    setDescription(group.description ?? '');
    setMaxUsers(group.settings?.maxMembers ?? 10);
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateGroup({
        variables: {
          input: {
            id: groupId,
            name,
            description,
            settings: { maxMembers: maxUsers },
          },
        },
      });
      showSuccess('Group updated successfully!');
      void router.push(`/groups/${groupId}`);
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : 'Failed to update group.');
    }
  };

  if (!groupId || (loading && !data?.group)) {
    return <PageLoadingState label="Loading group…" />;
  }

  if (error || !data?.group) {
    return (
      <PageEmptyState
        icon="👥"
        title="Group not found"
        subtitle={error?.message}
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
        <title>Edit {name} - LuxGen</title>
        <meta name="description" content={`Edit ${name} group settings`} />
      </Head>

      <AppLayout
        sidebarSections={getDefaultSidebarSections()}
        user={user ?? undefined}
        onUserAction={handleUserAction}
        {...headerProps}
        logo={getDefaultLogo()}
        sidebarCollapsible={true}
        sidebarDefaultCollapsed={false}
        responsive={true}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="ios-large-title">Edit Group</h1>
              <p className="mt-1 text-secondary text-sm">Update group settings and information</p>
            </div>
            <button type="button" className="ios-btn-secondary" onClick={() => router.push(`/groups/${groupId}`)}>
              Cancel
            </button>
          </div>

          {/* Form */}
          <div className="ios-card p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="ios-form-group">
                <label htmlFor="name" className="text-sm text-secondary">
                  Group Name *
                </label>
                <input
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="ios-input min-h-[100px]"
                  placeholder="Describe the purpose of this group"
                />
              </div>

              <div className="ios-form-group">
                <label htmlFor="maxUsers" className="text-sm text-secondary">
                  Maximum Users
                </label>
                <select
                  id="maxUsers"
                  name="maxUsers"
                  value={formData.maxUsers}
                  onChange={handleInputChange}
                  className="ios-input"
                >
                  <option value={5}>5 users</option>
                  <option value={10}>10 users</option>
                  <option value={25}>25 users</option>
                  <option value={50}>50 users</option>
                  <option value={100}>100 users</option>
                </select>
              </div>

              <div className="ios-form-group">
                <label htmlFor="status" className="text-sm text-secondary">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="ios-input"
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
