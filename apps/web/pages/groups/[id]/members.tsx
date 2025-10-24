import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { GroupMemberList, GroupMember, SnackbarProvider, useSnackbar } from '@luxgen/ui';
import { PageWrapper } from '@luxgen/ui';

const GroupMembersPageContent: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { showSuccess, showError, showInfo } = useSnackbar();
  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchGroup();
      fetchMembers();
    }
  }, [id]);

  const fetchGroup = async () => {
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
            query GetGroup($id: ID!) {
              group(id: $id) {
                id
                name
                description
                color
                icon
                memberCount
                isActive
              }
            }
          `,
          variables: {
            id,
          },
        }),
      });

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      setGroup(data.data.group);
    } catch (error) {
      console.error('Error fetching group:', error);
      showError('Failed to load group details.');
    }
  };

  const fetchMembers = async () => {
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
            query GetGroupMembers($groupId: ID!) {
              groupMembers(groupId: $groupId) {
                edges {
                  node {
                    id
                    role
                    joinedAt
                    isActive
                    permissions {
                      canInviteMembers
                      canRemoveMembers
                      canEditGroup
                      canViewReports
                      canManageTraining
                      canSendNudges
                    }
                    user {
                      id
                      email
                      firstName
                      lastName
                      role
                    }
                  }
                }
              }
            }
          `,
          variables: {
            groupId: id,
          },
        }),
      });

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      setMembers(data.data.groupMembers.edges.map((edge: any) => edge.node));
    } catch (error) {
      console.error('Error fetching members:', error);
      showError('Failed to load group members.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (memberId: string, role: string) => {
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
            mutation UpdateGroupMember($input: UpdateGroupMemberInput!) {
              updateGroupMember(input: $input) {
                id
                role
              }
            }
          `,
          variables: {
            input: {
              groupId: id,
              userId: memberId,
              role,
            },
          },
        }),
      });

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      showSuccess('Member role updated successfully!');
      fetchMembers();
    } catch (error) {
      console.error('Error updating member role:', error);
      showError('Failed to update member role.');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member from the group?')) {
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
            mutation RemoveGroupMember($input: RemoveGroupMemberInput!) {
              removeGroupMember(input: $input)
            }
          `,
          variables: {
            input: {
              groupId: id,
              userId: memberId,
            },
          },
        }),
      });

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      showSuccess('Member removed successfully!');
      fetchMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      showError('Failed to remove member.');
    }
  };

  const handleAddMembers = () => {
    // TODO: Implement add members functionality
    showInfo('Add members functionality will be implemented soon.');
  };

  const handleBulkAction = async (action: string, memberIds: string[]) => {
    if (action === 'remove') {
      if (!confirm(`Are you sure you want to remove ${memberIds.length} member(s) from the group?`)) {
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
              mutation BulkRemoveGroupMembers($groupId: ID!, $userIds: [ID!]!) {
                bulkRemoveGroupMembers(groupId: $groupId, userIds: $userIds)
              }
            `,
            variables: {
              groupId: id,
              userIds: memberIds,
            },
          }),
        });

        const data = await response.json();
        
        if (data.errors) {
          throw new Error(data.errors[0].message);
        }

        showSuccess(`${memberIds.length} member(s) removed successfully!`);
        fetchMembers();
      } catch (error) {
        console.error('Error removing members:', error);
        showError('Failed to remove members.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Group not found</h1>
          <button
            onClick={() => router.push('/groups')}
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Back to Groups
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{group.name} - Members - LuxGen</title>
        <meta name="description" content={`Manage members for ${group.name} group`} />
      </Head>

      <PageWrapper>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <button
                      onClick={() => router.push('/groups')}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
                  </div>
                  <p className="text-gray-600">{group.description}</p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: group.color }}
                  >
                    {group.icon ? (
                      <span className="text-xl">{group.icon}</span>
                    ) : (
                      <span className="text-xl">
                        {group.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Members List */}
            <GroupMemberList
              members={members}
              onRoleChange={handleRoleChange}
              onRemoveMember={handleRemoveMember}
              onAddMembers={handleAddMembers}
              onBulkAction={handleBulkAction}
              currentUserRole="ADMIN"
              showActions={true}
              showPermissions={true}
              allowRoleChange={true}
              allowMemberRemoval={true}
            />
          </div>
        </div>
      </PageWrapper>
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
