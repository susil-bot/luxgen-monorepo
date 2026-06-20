import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import {
  SnackbarProvider,
  AppLayout,
  getDefaultLogo,
  getDefaultSidebarSections,
  DataListPage,
  EmptyState,
} from '@luxgen/ui';
import type { DataListTab, FilterChipData } from '@luxgen/ui';
import { createHandleUserAction } from '../../lib/user-actions';
import { useLayoutUser } from '../../lib/app-layout-user';
import { useAppLayoutHeader } from '../../lib/app-layout-header';
import { filterGroupsBySearch } from '../../lib/group-display';
import { GET_GROUPS } from '../../graphql/queries/groups';
import { PageLoadingState } from '../../components/common/PageStates';

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

const GroupsPageContent: React.FC = () => {
  const router = useRouter();
  const user = useLayoutUser();
  const handleUserAction = createHandleUserAction(router);
  const headerProps = useAppLayoutHeader();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [activeFilters, setActiveFilters] = useState<FilterChipData[]>([]);

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

  const tabsWithCounts: DataListTab[] = useMemo(
    () => [
      { id: 'all', label: 'All', count: allGroups.length },
      { id: 'active', label: 'Active', count: allGroups.filter((g) => g.isActive).length },
      { id: 'inactive', label: 'Inactive', count: allGroups.filter((g) => !g.isActive).length },
    ],
    [allGroups],
  );

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
        {...headerProps}
        logo={getDefaultLogo()}
        sidebarCollapsible={true}
        sidebarDefaultCollapsed={false}
        responsive={true}
      >
        <div className="admin-list-page max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <DataListPage
            icon={<GroupsIcon />}
            breadcrumb="Groups"
            title="Groups"
            secondaryAction={{ label: 'Dashboard', onClick: () => void router.push('/groups/dashboard') }}
            primaryAction={{ label: '+ Create group', onClick: () => void router.push('/groups/create') }}
            tabs={tabsWithCounts}
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
                  search
                    ? `No groups match "${search}".`
                    : activeTab !== 'all'
                      ? 'Try changing the filters.'
                      : 'Create your first group to organize team members.'
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
                          onClick={() => void router.push(`/groups/${group.id}/edit`)}
                          className="ios-btn-plain text-sm"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void router.push(`/groups/${group.id}`)}
                          className="ios-btn-plain text-sm"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DataListPage>
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
