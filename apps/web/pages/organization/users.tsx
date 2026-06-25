import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@apollo/client';
import {
  DataListPage,
  SnackbarProvider,
  EmptyState,
  type DataListTab,
  type SortOption,
  type SortDirection,
} from '@luxgen/ui';
import { OrganizationShell } from '../../components/organization/OrganizationShell';
import { AddUserModal } from '../../components/organization/AddUserModal';
import { PageLoadingState } from '../../components/common/PageStates';
import { useAppTenantId } from '../../lib/app-layout-user';
import { getStoredUser } from '../../lib/session';
import { getTenantPageProps } from '../../lib/tenant-page-props';
import { GET_USERS, GET_PENDING_USERS, ACTIVATE_USER, SUSPEND_USER } from '../../graphql/queries/users';
import { type GraphQLUser, toUserTableRow, roleIcon, userStatusBadge } from '../../lib/user-display';
import { downloadCsv, exportUsersCsv } from '../../lib/export-csv';

interface Props {
  tenant: string;
}

const USER_SORT_OPTIONS: SortOption[] = [
  { id: 'name', label: 'User name' },
  { id: 'email', label: 'Email' },
  { id: 'status', label: 'Status' },
  { id: 'role', label: 'Role' },
  { id: 'joined', label: 'Date added' },
];

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

function OrganizationUsersContent({ tenant }: Props) {
  const router = useRouter();
  const tenantId = useAppTenantId();
  const sessionUser = typeof window !== 'undefined' ? getStoredUser() : null;
  const queryTenantId = tenantId ?? sessionUser?.tenant.id ?? tenant;

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selected, setSelected] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [addOpen, setAddOpen] = useState(false);

  const { data, loading, error } = useQuery(GET_USERS, {
    variables: { tenantId: queryTenantId },
    skip: !queryTenantId,
    fetchPolicy: 'cache-and-network',
  });
  const { data: pendingData, refetch: refetchPending } = useQuery(GET_PENDING_USERS, { variables: { tenantId: queryTenantId }, skip: !queryTenantId });
  const [activateUser] = useMutation(ACTIVATE_USER, { refetchQueries: [{ query: GET_USERS, variables: { tenantId: queryTenantId } }, { query: GET_PENDING_USERS, variables: { tenantId: queryTenantId } }] });
  const [suspendUser] = useMutation(SUSPEND_USER, { refetchQueries: [{ query: GET_PENDING_USERS, variables: { tenantId: queryTenantId } }] });

  useEffect(() => {
    const q = router.query.search;
    if (typeof q === 'string') setSearch(q);
  }, [router.query.search]);

  const allUsers = useMemo(() => (data?.users ?? []).map((u: GraphQLUser) => toUserTableRow(u)), [data]);

  const tabs: DataListTab[] = useMemo(
    () => [
      { id: 'all', label: 'All', count: allUsers.length },
      { id: 'active', label: 'Active', count: allUsers.filter((u) => u.status === 'ACTIVE').length },
      { id: 'pending', label: 'Pending', count: allUsers.filter((u) => u.status === 'PENDING').length },
      { id: 'requests', label: 'Requests', count: (pendingData?.getPendingUsers ?? []).length },
    ],
    [allUsers],
  );

  const filtered = useMemo(() => {
    let rows = allUsers;
    if (activeTab === 'active') rows = rows.filter((u) => u.status === 'ACTIVE');
    else if (activeTab === 'pending') rows = rows.filter((u) => u.status === 'PENDING');
    else if (activeTab === 'requests') { rows = (pendingData?.getPendingUsers ?? []).map((u) => ({ id: u.id, name: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email, email: u.email, status: u.status, statusLabel: u.status, role: 'USER', roleLabel: 'Member', joinedAt: u.createdAt })); }

    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.roleLabel.toLowerCase().includes(q),
      );
    }

    const dir = sortDirection === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      switch (sortOption) {
        case 'email':
          return a.email.localeCompare(b.email) * dir;
        case 'status':
          return a.statusLabel.localeCompare(b.statusLabel) * dir;
        case 'role':
          return a.roleLabel.localeCompare(b.roleLabel) * dir;
        case 'joined':
          return (new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime()) * dir;
        default:
          return a.name.localeCompare(b.name) * dir;
      }
    });
  }, [allUsers, activeTab, search, sortOption, sortDirection]);

  const toggleAll = () => {
    if (selected.length === filtered.length) setSelected([]);
    else setSelected(filtered.map((u) => u.id));
  };

  const handleApprove = async (userId: string) => { await activateUser({ variables: { userId } }); await refetchPending(); };
  const handleReject = async (userId: string) => { await suspendUser({ variables: { userId, reason: 'Registration rejected' } }); await refetchPending(); };
  const handleExport = () => {
    const rows = (selected.length ? filtered.filter((u) => selected.includes(u.id)) : filtered).map((u) => ({
      name: u.name,
      email: u.email,
      status: u.statusLabel,
      role: u.roleLabel,
      group: '',
    }));
    downloadCsv(`${tenant}-users.csv`, exportUsersCsv(rows));
  };

  if (loading && allUsers.length === 0) {
    return (
      <OrganizationShell tenant={tenant} activeSection="users" title="Users">
        <PageLoadingState label="Loading users…" />
      </OrganizationShell>
    );
  }

  return (
    <OrganizationShell
      tenant={tenant}
      activeSection="users"
      title="Users"
      subtitle="Manage organization members — tenant-specific"
    >
      <DataListPage
        icon={<UsersIcon />}
        breadcrumb="Organization"
        title="Users"
        secondaryAction={{ label: 'Export', onClick: handleExport }}
        primaryAction={{ label: 'Add users', onClick: () => setAddOpen(true) }}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search users…"
        sortOptions={USER_SORT_OPTIONS}
        selectedSortOption={sortOption}
        sortDirection={sortDirection}
        onSortOptionChange={setSortOption}
        onSortDirectionChange={setSortDirection}
        onClearAll={() => {
          setSearch('');
          setActiveTab('all');
        }}
      >
        {error && allUsers.length === 0 ? (
          <EmptyState title="Could not load users" description={error.message} />
         ) : activeTab === 'requests' && filtered.length === 0 ? (
          <EmptyState
            title="No access requests"
            description="Permission requests from users will appear here for review."
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={search ? 'No matching users' : 'No users yet'}
            description={search ? `No users match "${search}".` : 'Add your first organization member.'}
            action={!search ? { label: 'Add users', onClick: () => setAddOpen(true) } : undefined}
          />
        ) : (
          <div className="ios-table-wrap">
            <table className="ios-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selected.length === filtered.length && filtered.length > 0}
                      onChange={toggleAll}
                      aria-label="Select all"
                    />
                  </th>
                  <th>User</th>
                  <th>Status</th>
                  <th>Role</th>
                  <th>Group</th>{activeTab === 'requests' && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.includes(user.id)}
                        onChange={() =>
                          setSelected((prev) =>
                            prev.includes(user.id) ? prev.filter((id) => id !== user.id) : [...prev, user.id],
                          )
                        }
                        aria-label={`Select ${user.name}`}
                      />
                    </td>
                    <td>
                      <div className="font-medium text-primary">{user.email}</div>
                      {user.name !== user.email && <div className="text-sm text-secondary">{user.name}</div>}
                    </td>
                    <td>
                      <span className={`badge ${userStatusBadge(user.status)}`}>{user.statusLabel}</span>
                    </td>
                    <td>
                      <span className="mr-1">{roleIcon(user.role)}</span>
                      {user.roleLabel}
                    </td>
                    <td className="text-secondary text-sm">—</td>{activeTab === "requests" && (<td className="space-x-2"><button type="button" className="ios-btn-primary text-xs py-1 px-2" onClick={() => void handleApprove(user.id)}>Approve</button><button type="button" className="ios-btn-secondary text-xs py-1 px-2" onClick={() => void handleReject(user.id)}>Reject</button></td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DataListPage>

      <AddUserModal open={addOpen} onClose={() => setAddOpen(false)} tenantId={queryTenantId} />
    </OrganizationShell>
  );
}

export default function OrganizationUsersPage(props: Props) {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={3}>
      <OrganizationUsersContent {...props} />
    </SnackbarProvider>
  );
}

export const getServerSideProps = getTenantPageProps;
