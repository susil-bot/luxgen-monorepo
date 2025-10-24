import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { GroupCard, GroupForm, GroupFormData, SnackbarProvider, useSnackbar } from '@luxgen/ui';
import { PageWrapper } from '@luxgen/ui';

interface Group {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  memberCount: number;
  isActive: boolean;
  settings?: {
    trainingEnabled: boolean;
    nudgeEnabled: boolean;
    reportingEnabled: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

const GroupsPageContent: React.FC = () => {
  const router = useRouter();
  const { showSuccess, showError, showInfo } = useSnackbar();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const hostname = window.location.hostname;
      const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');
      const apiUrl = isLocalhost ? `http://${hostname}:4000/graphql` : '/graphql';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant': 'demo',
        },
        body: JSON.stringify({
          query: `
            query GetGroups {
              groups {
                edges {
                  node {
                    id
                    name
                    description
                    color
                    icon
                    memberCount
                    isActive
                    settings {
                      trainingEnabled
                      nudgeEnabled
                      reportingEnabled
                    }
                    createdAt
                    updatedAt
                  }
                }
              }
            }
          `,
        }),
      });

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      setGroups(data.data.groups.edges.map((edge: any) => edge.node));
    } catch (error) {
      console.error('Error fetching groups:', error);
      showError('Failed to load groups. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (formData: GroupFormData) => {
    try {
      const hostname = window.location.hostname;
      const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');
      const apiUrl = isLocalhost ? `http://${hostname}:4000/graphql` : '/graphql';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant': 'demo',
        },
        body: JSON.stringify({
          query: `
            mutation CreateGroup($input: CreateGroupInput!) {
              createGroup(input: $input) {
                id
                name
                description
                color
                icon
                memberCount
                isActive
                settings {
                  trainingEnabled
                  nudgeEnabled
                  reportingEnabled
                }
                createdAt
                updatedAt
              }
            }
          `,
          variables: {
            input: formData,
          },
        }),
      });

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      showSuccess('Group created successfully!');
      setShowCreateForm(false);
      fetchGroups();
    } catch (error) {
      console.error('Error creating group:', error);
      showError('Failed to create group. Please try again.');
    }
  };

  const handleEditGroup = async (formData: GroupFormData) => {
    if (!editingGroup) return;

    try {
      const hostname = window.location.hostname;
      const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');
      const apiUrl = isLocalhost ? `http://${hostname}:4000/graphql` : '/graphql';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant': 'demo',
        },
        body: JSON.stringify({
          query: `
            mutation UpdateGroup($input: UpdateGroupInput!) {
              updateGroup(input: $input) {
                id
                name
                description
                color
                icon
                memberCount
                isActive
                settings {
                  trainingEnabled
                  nudgeEnabled
                  reportingEnabled
                }
                createdAt
                updatedAt
              }
            }
          `,
          variables: {
            input: {
              id: editingGroup.id,
              ...formData,
            },
          },
        }),
      });

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      showSuccess('Group updated successfully!');
      setEditingGroup(null);
      fetchGroups();
    } catch (error) {
      console.error('Error updating group:', error);
      showError('Failed to update group. Please try again.');
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      return;
    }

    try {
      const hostname = window.location.hostname;
      const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');
      const apiUrl = isLocalhost ? `http://${hostname}:4000/graphql` : '/graphql';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant': 'demo',
        },
        body: JSON.stringify({
          query: `
            mutation DeleteGroup($id: ID!) {
              deleteGroup(id: $id)
            }
          `,
          variables: {
            id: groupId,
          },
        }),
      });

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      showSuccess('Group deleted successfully!');
      fetchGroups();
    } catch (error) {
      console.error('Error deleting group:', error);
      showError('Failed to delete group. Please try again.');
    }
  };

  const handleViewMembers = (groupId: string) => {
    router.push(`/groups/${groupId}/members`);
  };

  const handleManageSettings = (groupId: string) => {
    router.push(`/groups/${groupId}/settings`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Groups - LuxGen</title>
        <meta name="description" content="Manage user groups and permissions" />
      </Head>

      <PageWrapper>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Groups</h1>
                  <p className="mt-2 text-gray-600">
                    Manage user groups and track training progress
                  </p>
                </div>
                
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  Create Group
                </button>
              </div>
            </div>

            {/* Groups Grid */}
            {groups.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-4">No groups found</div>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  Create your first group
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map((group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    onEdit={setEditingGroup}
                    onDelete={handleDeleteGroup}
                    onViewMembers={handleViewMembers}
                    onManageSettings={handleManageSettings}
                  />
                ))}
              </div>
            )}

            {/* Create/Edit Form Modal */}
            {(showCreateForm || editingGroup) && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <GroupForm
                    initialData={editingGroup ? {
                      name: editingGroup.name,
                      description: editingGroup.description || '',
                      color: editingGroup.color || '#3B82F6',
                      icon: editingGroup.icon || 'users',
                      settings: {
                        allowSelfJoin: false,
                        requireApproval: true,
                        maxMembers: null,
                        trainingEnabled: editingGroup.settings?.trainingEnabled || true,
                        nudgeEnabled: editingGroup.settings?.nudgeEnabled || true,
                        reportingEnabled: editingGroup.settings?.reportingEnabled || true,
                        notifications: {
                          onMemberJoin: true,
                          onMemberLeave: true,
                          onTrainingUpdate: true,
                          onNudgeSent: true,
                          onReportGenerated: true,
                        },
                      },
                    } : undefined}
                    onSubmit={editingGroup ? handleEditGroup : handleCreateGroup}
                    onCancel={() => {
                      setShowCreateForm(false);
                      setEditingGroup(null);
                    }}
                    title={editingGroup ? 'Edit Group' : 'Create Group'}
                    submitText={editingGroup ? 'Update Group' : 'Create Group'}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </PageWrapper>
    </>
  );
};

export default function Groups() {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={3}>
      <GroupsPageContent />
    </SnackbarProvider>
  );
}
