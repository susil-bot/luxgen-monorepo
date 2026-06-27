import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@apollo/client';
import { SnackbarProvider, DataListPage, EmptyState, type DataListTab, type FilterChipData } from '@luxgen/ui';
import { OrganizationShell } from '../../../components/organization/OrganizationShell';
import { PageLoadingState } from '../../../components/common/PageStates';
import { filterGroupsBySearch } from '../../../lib/group-display';
import { CREATE_GROUP, GET_GROUPS } from '../../../graphql/queries/groups';
import { getTenantPageProps } from '../../../lib/tenant-page-props';

interface Props {
  tenant: string;
}

interface GroupNode {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  memberCount: number;
  isActive: boolean;
}

const GroupsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);

function OrganizationGroupsContent({ tenant }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [activeFilters, setActiveFilters] = useState<FilterChipData[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [createGroup, { loading: creating }] = useMutation(CREATE_GROUP);

  useEffect(() => {
    const q = router.query.search;
    if (typeof q === 'string') setSearch(q);
  }, [router.query.search]);

  const { data, loading } = useQuery(GET_GROUPS, {
    variables: { first: 50, isActive: true },
    fetchPolicy: 'cache-and-network',
  });

  const allGroups: GroupNode[] = data?.groups?.edges?.map((edge: { node: GroupNode }) => edge.node) ?? [];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'active') setActiveFilters([{ id: 'status_active', label: 'Status', value: 'Active' }]);
    else if (tabId === 'inactive') setActiveFilters([{ id: 'status_inactive', label: 'Status', value: 'Inactive' }]);
    else setActiveFilters([]);
  };

  const groups = useMemo(() => {
    let result = filterGroupsBySearch(allGroups, search);
    if (activeTab === 'active') result = result.filter((g) => g.isActive);
    else if (activeTab === 'inactive') result = result.filter((g) => !g.isActive);
    return result;
  }, [allGroups, search, activeTab]);

  const tabs: DataListTab[] = useMemo(
    () => [
      { id: 'all', label: 'All', count: allGroups.length },
      { id: 'active', label: 'Active', count: allGroups.filter((g) => g.isActive).length },
      { id: 'inactive', label: 'Inactive', count: allGroups.filter((g) => !g.isActive).length },
    ],
    [allGroups],
  );

  return (
    <OrganizationShell
      tenant={tenant}
      activeSection="groups"
      title="Groups"
      subtitle="Organize members into teams — moved under Organization"
    >
      <DataListPage
        icon={<GroupsIcon />}
        breadcrumb="Organization"
        title="Groups"
        secondaryAction={{ label: 'Analytics', onClick: () => void router.push('/groups/analytics') }}
        primaryAction={{ label: 'Create group', onClick: () => setShowCreate(true) }}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        searchQuery={search}
        onSearchChange={setSearch}
        activeFilters={activeFilters}
        onRemoveFilter={(id) => setActiveFilters((prev) => prev.filter((f) => f.id !== id))}
        onClearAll={() => {
          setActiveFilters([]);
          setSearch('');
          setActiveTab('all');
        }}
        searchPlaceholder="Search groups…"
      >
        {loading && allGroups.length === 0 ? (
          <PageLoadingState label="Loading groups…" fullScreen={false} />
        ) : groups.length === 0 ? (
          <EmptyState
            title={search || activeTab !== 'all' ? 'No matching groups' : 'No groups yet'}
            description={
              search ? `No groups match "${search}".` : 'Create your first group to organize organization members.'
            }
            action={
              !search && activeTab === 'all'
                ? { label: 'Create group', onClick: () => void router.push('/groups/create') }
                : undefined
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-4">
            {groups.map((group) => (
              <div
                key={group.id}
                className="ios-card p-5 transition-all duration-200 hover:shadow-md cursor-pointer"
                onClick={() => void router.push(`/groups/${group.id}`)}
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
                <p className="text-sm text-secondary mb-4 leading-relaxed">{group.description || 'No description'}</p>
                <div
                  className="flex items-center justify-between pt-3"
                  style={{ borderTop: '1px solid var(--color-separator)' }}
                >
                  <span className="text-xs text-secondary">{group.memberCount} members</span>
                  <button
                    type="button"
                    className="ios-btn-plain text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      void router.push(`/groups/${group.id}`);
                    }}
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {showCreate && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.4)' }}
          >
            <div className="ios-card p-6 w-full max-w-md space-y-4">
              <h2 className="font-semibold">Create group</h2>
              <input
                className="input-field"
                placeholder="Group name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button type="button" className="ios-btn-secondary" onClick={() => setShowCreate(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="ios-btn-primary"
                  disabled={creating || !newGroupName.trim()}
                  onClick={async () => {
                    const { data } = await createGroup({ variables: { input: { name: newGroupName.trim() } } });
                    setShowCreate(false);
                    const id = data?.createGroup?.id;
                    if (id) void router.push(`/groups/${id}`);
                  }}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </DataListPage>
    </OrganizationShell>
  );
}

export default function OrganizationGroupsPage(props: Props) {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={3}>
      <OrganizationGroupsContent {...props} />
    </SnackbarProvider>
  );
}

export const getServerSideProps = getTenantPageProps;
