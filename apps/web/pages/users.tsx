import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { AppLayout, getDefaultLogo, getDefaultSidebarSections, TenantDebug } from '@luxgen/ui';
import { TenantBanner } from '../components/tenant/TenantBanner';
import { PageLoadingState, PageEmptyState } from '../components/common/PageStates';
import { createHandleUserAction } from '../lib/user-actions';
import { useLayoutUser, useAppTenantId } from '../lib/app-layout-user';
import { getStoredUser } from '../lib/session';
import { GET_USERS } from '../graphql/queries/users';
import {
  type GraphQLUser,
  toUserTableRow,
  buildRoleSummaries,
  roleIcon,
  formatJoinedDate,
} from '../lib/user-display';

interface UsersPageProps {
  tenant: string;
}

export default function UsersPage({ tenant }: UsersPageProps) {
  const router = useRouter();
  const handleUserAction = createHandleUserAction(router);
  const layoutUser = useLayoutUser();
  const tenantId = useAppTenantId();
  const sessionUser = typeof window !== 'undefined' ? getStoredUser() : null;
  const queryTenantId = tenantId ?? sessionUser?.tenant.id ?? tenant;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data, loading, error } = useQuery(GET_USERS, {
    variables: { tenantId: queryTenantId },
    skip: !queryTenantId,
    fetchPolicy: 'cache-and-network',
  });

  const apiUsers: GraphQLUser[] = data?.users ?? [];
  const users = apiUsers.map(toUserTableRow);
  const roles = buildRoleSummaries(users);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.roleLabel.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const paginatedUsers = filteredUsers.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / rowsPerPage));

  const handleUserSelect = (userId: string) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === paginatedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(paginatedUsers.map((user) => user.id));
    }
  };

  const adminCount = users.filter((u) => u.role === 'ADMIN').length;
  const instructorCount = users.filter((u) => u.role === 'INSTRUCTOR').length;
  const studentCount = users.filter((u) => u.role === 'STUDENT').length;

  if (loading && users.length === 0) {
    return <PageLoadingState label="Loading users…" />;
  }

  return (
    <>
      <Head>
        <title>User Management - {tenant.charAt(0).toUpperCase() + tenant.slice(1)}</title>
      </Head>

      <AppLayout
        sidebarSections={getDefaultSidebarSections()}
        user={layoutUser ?? undefined}
        logo={getDefaultLogo()}
        onUserAction={handleUserAction}
        showSearch={true}
        showNotifications={true}
        notificationCount={0}
        sidebarDefaultCollapsed={false}
        responsive={true}
      >
        <TenantBanner tenant={tenant} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-2 space-y-8">
          <div>
            <h1 className="ios-large-title">Users</h1>
            <p className="mt-1 text-secondary text-sm">Tenant members and role assignments</p>
          </div>

          {error && users.length === 0 && (
            <PageEmptyState
              icon="⚠️"
              title="Could not load users"
              subtitle={error.message}
              action={
                <button type="button" className="ios-btn-primary mt-4" onClick={() => router.push('/login')}>
                  Sign in
                </button>
              }
            />
          )}

          {!error && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="ios-metric-tile">
                  <span className="metric-label">Total users</span>
                  <span className="metric-value">{users.length}</span>
                </div>
                <div className="ios-metric-tile">
                  <span className="metric-label">Administrators</span>
                  <span className="metric-value">{adminCount}</span>
                </div>
                <div className="ios-metric-tile">
                  <span className="metric-label">Instructors</span>
                  <span className="metric-value">{instructorCount}</span>
                </div>
                <div className="ios-metric-tile">
                  <span className="metric-label">Students</span>
                  <span className="metric-value">{studentCount}</span>
                </div>
              </div>

              {roles.length > 0 && (
                <div className="ios-card p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-primary">Roles</h2>
                    <p className="mt-1 text-secondary text-sm">Members grouped by assigned role</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {roles.map((role) => (
                      <div key={role.id} className="ios-card p-4" style={{ background: 'var(--color-bg-tertiary)' }}>
                        <h3 className="font-semibold text-primary mb-1">{role.name}</h3>
                        <p className="text-xs text-secondary mb-3">{role.description}</p>
                        <p className="text-sm text-secondary mb-3">{role.userCount} users</p>
                        <div className="flex -space-x-2">
                          {role.users.slice(0, 4).map((u) => (
                            <div key={u.id} className="ios-avatar ios-avatar-sm">
                              {u.name.charAt(0)}
                            </div>
                          ))}
                          {role.userCount > 4 && (
                            <div
                              className="ios-avatar ios-avatar-sm"
                              style={{
                                background: 'var(--color-fill-secondary)',
                                color: 'var(--color-label-secondary)',
                              }}
                            >
                              +{role.userCount - 4}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="ios-card overflow-hidden">
                <div className="p-6" style={{ borderBottom: '1px solid var(--color-separator)' }}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-primary">All users</h2>
                      <p className="text-secondary text-sm mt-1">Live data from GraphQL</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        placeholder="Search users…"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="ios-input sm:w-64"
                      />
                      <button type="button" className="ios-btn-primary" onClick={() => router.push('/register')}>
                        + Invite user
                      </button>
                    </div>
                  </div>
                </div>

                {users.length === 0 ? (
                  <div className="p-8">
                    <PageEmptyState
                      icon="👤"
                      title="No users yet"
                      subtitle="Registered members will appear here."
                      action={
                        <button type="button" className="ios-btn-primary mt-4" onClick={() => router.push('/register')}>
                          Register account
                        </button>
                      }
                    />
                  </div>
                ) : (
                  <>
                    <div className="ios-table-wrap">
                      <table className="ios-table">
                        <thead>
                          <tr>
                            <th>
                              <input
                                type="checkbox"
                                checked={
                                  selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0
                                }
                                onChange={handleSelectAll}
                              />
                            </th>
                            <th>User</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Joined</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedUsers.map((user) => (
                            <tr key={user.id}>
                              <td>
                                <input
                                  type="checkbox"
                                  checked={selectedUsers.includes(user.id)}
                                  onChange={() => handleUserSelect(user.id)}
                                />
                              </td>
                              <td>
                                <div className="flex items-center gap-3">
                                  <div className="ios-avatar ios-avatar-sm">{user.name.charAt(0)}</div>
                                  <div>
                                    <div className="font-medium text-primary">{user.name}</div>
                                    <div className="text-sm text-secondary">@{user.username}</div>
                                  </div>
                                </div>
                              </td>
                              <td>{user.email}</td>
                              <td>
                                <span className="mr-2">{roleIcon(user.role)}</span>
                                {user.roleLabel}
                              </td>
                              <td>{formatJoinedDate(user.joinedAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div
                      className="px-6 py-4 flex items-center justify-between flex-wrap gap-4"
                      style={{ borderTop: '1px solid var(--color-separator)' }}
                    >
                      <div className="flex items-center gap-2 text-sm text-secondary">
                        <span>Rows per page:</span>
                        <select
                          value={rowsPerPage}
                          onChange={(e) => {
                            setRowsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                          }}
                          className="ios-input w-auto py-1"
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-3 text-sm text-secondary">
                        <span>
                          {filteredUsers.length === 0
                            ? '0 of 0'
                            : `${(currentPage - 1) * rowsPerPage + 1}-${Math.min(currentPage * rowsPerPage, filteredUsers.length)} of ${filteredUsers.length}`}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="ios-btn-secondary disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages || filteredUsers.length === 0}
                          className="ios-btn-secondary disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        <TenantDebug />
      </AppLayout>
    </>
  );
}

export const getServerSideProps = async (context: { req: { headers: { host?: string } }; query: { tenant?: string } }) => {
  const host = context.req.headers.host;
  let tenant = 'demo';

  if (host && host.includes('.')) {
    const parts = host.split('.');
    if (parts.length > 1) {
      const subdomain = parts[0];
      if (subdomain !== 'www' && subdomain !== 'localhost' && subdomain !== '127.0.0.1') {
        tenant = subdomain;
      }
    }
  }

  if (context.query.tenant) {
    tenant = context.query.tenant;
  }

  return { props: { tenant } };
};
