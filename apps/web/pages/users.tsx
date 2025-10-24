import { useState, useEffect } from 'react';
import Head from 'next/head';
import { AppLayout, NavItem, UserMenu, getDefaultNavItems, getDefaultUser, getDefaultLogo, getDefaultSidebarSections, TenantDebug, Chip } from '@luxgen/ui';
import { TenantBanner } from '../components/tenant/TenantBanner';

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
        lastLogin: '2024-01-15'
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
        lastLogin: '2024-01-14'
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
        lastLogin: '2024-01-13'
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
        lastLogin: '2024-01-12'
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
        lastLogin: '2024-01-11'
      }
    ];

    const mockRoles: Role[] = [
      {
        id: 'admin',
        name: 'Administrator',
        description: 'Full system access',
        userCount: 4,
        users: mockUsers.filter(u => u.role === 'Admin'),
        permissions: ['read', 'write', 'delete', 'admin']
      },
      {
        id: 'editor',
        name: 'Editor',
        description: 'Content management access',
        userCount: 7,
        users: mockUsers.filter(u => u.role === 'Editor'),
        permissions: ['read', 'write']
      },
      {
        id: 'author',
        name: 'Author',
        description: 'Content creation access',
        userCount: 5,
        users: mockUsers.filter(u => u.role === 'Author'),
        permissions: ['read', 'write']
      },
      {
        id: 'support',
        name: 'Support',
        description: 'Customer support access',
        userCount: 6,
        users: mockUsers.filter(u => u.role === 'Support'),
        permissions: ['read']
      },
      {
        id: 'restricted',
        name: 'Restricted User',
        description: 'Limited access',
        userCount: 10,
        users: mockUsers.filter(u => u.role === 'Restricted'),
        permissions: ['read']
      }
    ];

    setUsers(mockUsers);
    setRoles(mockRoles);
    setLoading(false);
  }, []);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === paginatedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(paginatedUsers.map(user => user.id));
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'inactive': return 'error';
      default: return 'info';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Admin': return '🔴';
      case 'Editor': return '✏️';
      case 'Author': return '⚙️';
      case 'Maintainer': return '🔄';
      case 'Subscriber': return '👤';
      default: return '👤';
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>User Management - {tenant.charAt(0).toUpperCase() + tenant.slice(1)}</title>
      </Head>
      
      <AppLayout
        sidebarSections={getDefaultSidebarSections()}
        user={getDefaultUser(tenant)}
        logo={getDefaultLogo(tenant)}
        onUserAction={(action) => {
          switch (action) {
            case 'profile':
              console.log('Navigate to profile');
              break;
            case 'settings':
              console.log('Navigate to settings');
              break;
            case 'logout':
              console.log('Logout');
              break;
          }
        }}
        showSearch={true}
        showNotifications={true}
        notificationCount={3}
        sidebarDefaultCollapsed={false}
        responsive={true}
      >
        <TenantBanner tenant={tenant} />
        
        <div className="mt-6 space-y-8">
          {/* Roles List Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Roles List</h1>
              <p className="text-gray-600">
                A role provided access to predefined menus and features so that depending on assigned role an administrator can have access to what he need
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {roles.map((role) => (
                <div key={role.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{role.name}</h3>
                    <button
                      onClick={() => handleEditRole(role.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit Role
                    </button>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-2">Total {role.userCount} users</p>
                    <div className="flex -space-x-2">
                      {role.users.slice(0, 4).map((user, index) => (
                        <div
                          key={user.id}
                          className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white text-xs font-medium"
                        >
                          {user.name.charAt(0)}
                        </div>
                      ))}
                      {role.userCount > 4 && (
                        <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-gray-600 text-xs font-medium">
                          +{role.userCount - 4}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{role.name}</span>
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Add Role Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-4 border-2 border-dashed border-blue-300 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">ADD ROLE</h3>
                <p className="text-sm text-gray-600 mb-4">Add new role, if it doesn't exist.</p>
                <button
                  onClick={handleAddRole}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Role
                </button>
              </div>
            </div>
          </div>

          {/* Users Table Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Total users with their roles</h2>
                  <p className="text-gray-600 mt-1">Find all of your company's administrator accounts and their associate roles.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    EXPORT
                  </button>
                  
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  
                  <button
                    onClick={handleAddUser}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    ADD USER
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">USER</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">EMAIL</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ROLE</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PLAN</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTION</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleUserSelect(user.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                            {user.name.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="mr-2">{getRoleIcon(user.role)}</span>
                          <span className="text-sm text-gray-900">{user.role}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.plan}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Chip
                          label={user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          variant={getStatusVariant(user.status)}
                          size="small"
                          shape="pill"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm text-gray-700">Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => setRowsPerPage(Number(e.target.value))}
                  className="ml-2 border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">
                  {((currentPage - 1) * rowsPerPage) + 1}-{Math.min(currentPage * rowsPerPage, filteredUsers.length)} of {filteredUsers.length}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
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
      tenant
    }
  };
};
