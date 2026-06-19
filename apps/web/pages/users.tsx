import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { AppLayout, getDefaultUser, getDefaultLogo, getDefaultSidebarSections, TenantDebug, Chip } from '@luxgen/ui';
import { TenantBanner } from '../components/tenant/TenantBanner';
import { PageLoadingState } from '../components/common/PageStates';
import { createHandleUserAction } from '../lib/user-actions';

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  role: string;
  plan: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  users: User[];
  permissions: string[];
}

interface UsersPageProps {
  tenant: string;
}

export default function UsersPage({ tenant }: UsersPageProps) {
  const router = useRouter();
  const handleUserAction = createHandleUserAction(router);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'Jordan Stevenson',
        username: 'amiccoo',
        email: 'susanna.Lind57@gmail.com',
        avatar: '/avatars/jordan.jpg',
        role: 'Admin',
        plan: 'Enterprise',
        status: 'pending',
        lastLogin: '2024-01-15',
      },
      {
        id: '2',
        name: 'Benedetto Rossiter',
        username: 'benedetto',
        email: 'estelle.Bailey10@gmail.com',
        avatar: '/avatars/benedetto.jpg',
        role: 'Editor',
        plan: 'Team',
        status: 'active',
        lastLogin: '2024-01-14',
      },
      {
        id: '3',
        name: 'Bentlee Emblin',
        username: 'bentlee',
        email: 'milo86@hotmail.com',
        avatar: '/avatars/bentlee.jpg',
        role: 'Author',
        plan: 'Company',
        status: 'active',
        lastLogin: '2024-01-13',
      },
      {
        id: '4',
        name: 'Bertha Biner',
        username: 'bertha',
        email: 'lonnie35@hotmail.com',
        avatar: '/avatars/bertha.jpg',
        role: 'Editor',
        plan: 'Team',
        status: 'pending',
        lastLogin: '2024-01-12',
      },
      {
        id: '5',
        name: 'Beverlie Krabbe',
        username: 'beverlie',
        email: 'ahmad_Collins@yahoo.com',
        avatar: '/avatars/beverlie.jpg',
        role: 'Maintainer',
        plan: 'Company',
        status: 'active',
        lastLogin: '2024-01-11',
      },
    ];

    const mockRoles: Role[] = [
      {
        id: 'admin',
        name: 'Administrator',
        description: 'Full system access',
        userCount: 4,
        users: mockUsers.filter((u) => u.role === 'Admin'),
        permissions: ['read', 'write', 'delete', 'admin'],
      },
      {
        id: 'editor',
        name: 'Editor',
        description: 'Content management access',
        userCount: 7,
        users: mockUsers.filter((u) => u.role === 'Editor'),
        permissions: ['read', 'write'],
      },
      {
        id: 'author',
        name: 'Author',
        description: 'Content creation access',
        userCount: 5,
        users: mockUsers.filter((u) => u.role === 'Author'),
        permissions: ['read', 'write'],
      },
      {
        id: 'support',
        name: 'Support',
        description: 'Customer support access',
        userCount: 6,
        users: mockUsers.filter((u) => u.role === 'Support'),
        permissions: ['read'],
      },
      {
        id: 'restricted',
        name: 'Restricted User',
        description: 'Limited access',
        userCount: 10,
        users: mockUsers.filter((u) => u.role === 'Restricted'),
        permissions: ['read'],
      },
    ];

    setUsers(mockUsers);
    setRoles(mockRoles);
    setLoading(false);
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const paginatedUsers = filteredUsers.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);

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

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'inactive':
        return 'error';
      default:
        return 'info';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Admin':
        return '🔴';
      case 'Editor':
        return '✏️';
      case 'Author':
        return '⚙️';
      case 'Maintainer':
        return '🔄';
      case 'Subscriber':
        return '👤';
      default:
        return '👤';
    }
  };

  const handleExport = () => {
    console.log('Exporting users...');
    // Implement export functionality
  };

  const handleAddUser = () => {
    console.log('Adding new user...');
    // Implement add user functionality
  };

  const handleEditRole = (roleId: string) => {
    console.log('Editing role:', roleId);
    // Implement edit role functionality
  };

  const handleAddRole = () => {
    console.log('Adding new role...');
    // Implement add role functionality
  };

  if (loading) {
    return <PageLoadingState label="Loading users…" />;
  }

  return (
    <>
      <Head>
        <title>User Management - {tenant.charAt(0).toUpperCase() + tenant.slice(1)}</title>
      </Head>

      <AppLayout
        sidebarSections={getDefaultSidebarSections()}
        user={getDefaultUser()}
        logo={getDefaultLogo()}
        onUserAction={handleUserAction}
        showSearch={true}
        showNotifications={true}
        notificationCount={3}
        sidebarDefaultCollapsed={false}
        responsive={true}
      >
        <TenantBanner tenant={tenant} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-2 space-y-8">
          {/* Roles */}
          <div className="ios-card p-6">
            <div className="mb-6">
              <h1 className="ios-large-title">Roles</h1>
              <p className="mt-1 text-secondary text-sm">
                Predefined access levels — assign roles to control menus and features.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {roles.map((role) => (
                <div key={role.id} className="ios-card p-4" style={{ background: 'var(--color-bg-tertiary)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-primary">{role.name}</h3>
                    <button type="button" onClick={() => handleEditRole(role.id)} className="ios-btn-plain text-sm">
                      Edit
                    </button>
                  </div>

                  <p className="text-sm text-secondary mb-3">{role.userCount} users</p>
                  <div className="flex -space-x-2 mb-3">
                    {role.users.slice(0, 4).map((u) => (
                      <div key={u.id} className="ios-avatar ios-avatar-sm">
                        {u.name.charAt(0)}
                      </div>
                    ))}
                    {role.userCount > 4 && (
                      <div
                        className="ios-avatar ios-avatar-sm"
                        style={{ background: 'var(--color-fill-secondary)', color: 'var(--color-label-secondary)' }}
                      >
                        +{role.userCount - 4}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddRole}
                className="ios-card p-4 flex flex-col items-center justify-center text-center gap-2 min-h-[140px]"
                style={{ border: '2px dashed var(--color-separator)', background: 'transparent' }}
              >
                <span className="text-2xl">+</span>
                <span className="font-semibold text-primary">Add role</span>
                <span className="text-sm text-secondary">Create a new access level</span>
              </button>
            </div>
          </div>

          {/* Users table */}
          <div className="ios-card overflow-hidden">
            <div className="p-6" style={{ borderBottom: '1px solid var(--color-separator)' }}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-primary">Users</h2>
                  <p className="text-secondary text-sm mt-1">
                    Administrator accounts and their assigned roles.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button type="button" onClick={handleExport} className="ios-btn-secondary">
                    Export
                  </button>
                  <input
                    type="text"
                    placeholder="Search users…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="ios-input sm:w-64"
                  />
                  <button type="button" onClick={handleAddUser} className="ios-btn-primary">
                    + Add user
                  </button>
                </div>
              </div>
            </div>

            <div className="ios-table-wrap">
              <table className="ios-table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Plan</th>
                    <th>Status</th>
                    <th>Action</th>
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
                        <span className="mr-2">{getRoleIcon(user.role)}</span>
                        {user.role}
                      </td>
                      <td>{user.plan}</td>
                      <td>
                        <Chip
                          label={user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          variant={getStatusVariant(user.status)}
                          size="small"
                          shape="pill"
                        />
                      </td>
                      <td>
                        <button type="button" className="ios-btn-plain" aria-label="View user">
                          View
                        </button>
                      </td>
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
                  onChange={(e) => setRowsPerPage(Number(e.target.value))}
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
                  {(currentPage - 1) * rowsPerPage + 1}-{Math.min(currentPage * rowsPerPage, filteredUsers.length)} of{' '}
                  {filteredUsers.length}
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
                  disabled={currentPage === totalPages}
                  className="ios-btn-secondary disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        <TenantDebug />
      </AppLayout>
    </>
  );
}

export const getServerSideProps = async (context: any) => {
  const host = context.req.headers.host;
  let tenant = 'demo'; // Default tenant

  // Extract tenant from subdomain
  if (host && host.includes('.')) {
    const parts = host.split('.');
    if (parts.length > 1) {
      const subdomain = parts[0];
      if (subdomain !== 'www' && subdomain !== 'localhost' && subdomain !== '127.0.0.1') {
        tenant = subdomain;
      }
    }
  }

  // Check query parameter as fallback
  if (context.query.tenant) {
    tenant = context.query.tenant;
  }

  return {
    props: {
      tenant,
    },
  };
};
