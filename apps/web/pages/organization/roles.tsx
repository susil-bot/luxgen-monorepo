import { useMemo, useState } from 'react';
import { DataListPage, SnackbarProvider, EmptyState, type SortOption } from '@luxgen/ui';
import type { SortDirection } from '@luxgen/ui';
import { useMutation, useQuery } from '@apollo/client';
import { OrganizationShell } from '../../components/organization/OrganizationShell';
import { getTenantPageProps } from '../../lib/tenant-page-props';
import { GET_USERS } from '../../graphql/queries/users';
import { GET_CUSTOM_ROLES, CREATE_CUSTOM_ROLE } from '../../graphql/queries/custom-roles';
import { toUserTableRow, type GraphQLUser } from '../../lib/user-display';
import { useAppTenantId } from '../../lib/app-layout-user';
import { getStoredUser } from '../../lib/session';
import {
  ORGANIZATION_SYSTEM_ROLES,
  exportRolesCsv,
  type OrganizationRoleDefinition,
} from '../../lib/organization-roles';
import { downloadCsv } from '../../lib/export-csv';

interface Props {
  tenant: string;
}

const ROLE_SORT: SortOption[] = [
  { id: 'name', label: 'Role name' },
  { id: 'members', label: 'Members' },
];

const RolesIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
);

function mapUserToOrgRoleId(role: string): string {
  if (role === 'ADMIN') return 'org_admin';
  if (role === 'INSTRUCTOR') return 'instructor';
  return 'member';
}

function OrganizationRolesContent({ tenant }: Props) {
  const tenantId = useAppTenantId();
  const sessionUser = typeof window !== 'undefined' ? getStoredUser() : null;
  const queryTenantId = tenantId ?? sessionUser?.tenant.id ?? tenant;

  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [sortOption, setSortOption] = useState('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [detailRole, setDetailRole] = useState<OrganizationRoleDefinition | null>(null);

  const { data: customRoleData, refetch: refetchCustomRoles } = useQuery(GET_CUSTOM_ROLES, { variables: { tenantId: queryTenantId }, skip: !queryTenantId });
  const [createCustomRole] = useMutation(CREATE_CUSTOM_ROLE);
  const [showCreate, setShowCreate] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const { data } = useQuery(GET_USERS, {
    variables: { tenantId: queryTenantId },
    skip: !queryTenantId,
  });

  const memberCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const role of ORGANIZATION_SYSTEM_ROLES) counts[role.id] = 0;
    for (const u of data?.users ?? []) {
      const row = toUserTableRow(u as GraphQLUser);
      const orgRoleId = mapUserToOrgRoleId(row.role);
      counts[orgRoleId] = (counts[orgRoleId] ?? 0) + 1;
    }
    if ((counts.org_admin ?? 0) > 0) counts.org_owner = 1;
    return counts;
  }, [data]);

  const roles = useMemo(() => {
    const extras = (customRoleData?.customRoles ?? []).map((r) => ({ id: r.id, name: r.name, description: r.description ?? '', permissions: [] }));
    let list = [...ORGANIZATION_SYSTEM_ROLES, ...extras];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
    }
    const dir = sortDirection === 'asc' ? 1 : -1;
    list.sort((a, b) => {
      if (sortOption === 'members') {
        return ((memberCounts[a.id] ?? 0) - (memberCounts[b.id] ?? 0)) * dir;
      }
      return a.name.localeCompare(b.name) * dir;
    });
    return list;
  }, [search, sortOption, sortDirection, memberCounts]);

  const handleExport = () => {
    downloadCsv(`${tenant}-roles.csv`, exportRolesCsv(ORGANIZATION_SYSTEM_ROLES, memberCounts));
  };

  return (
    <OrganizationShell
      tenant={tenant}
      activeSection="roles"
      title="Roles"
      subtitle="System roles replace legacy POS device roles. Only organization administrators can create custom POS roles."
    >
      <div className="auth-notice auth-notice--info mb-4">
        <p className="text-sm">
          User management and device setup permissions from previous POS roles are now system roles. Only organization
          administrators can create and edit custom roles.
        </p>
      </div>

      <DataListPage
        icon={<RolesIcon />}
        breadcrumb="Organization"
        title="Roles"
        secondaryAction={{ label: 'Export', onClick: handleExport }}
        primaryAction={{
          label: 'Add role',
          onClick: () =>
            setDetailRole({
              id: 'custom',
              name: 'Custom role',
              description: 'Custom roles — coming soon',
              editable: true,
              permissions: [],
            }),
        }}
        tabs={[{ id: 'all', label: 'All roles', count: roles.length }]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search roles…"
        sortOptions={ROLE_SORT}
        selectedSortOption={sortOption}
        sortDirection={sortDirection}
        onSortOptionChange={setSortOption}
        onSortDirectionChange={setSortDirection}
      >
        {roles.length === 0 ? (
          <EmptyState
            title="No roles match"
            description="No custom roles yet. Create your first role to manage permissions."
          />
        ) : (
          <div className="ios-table-wrap">
            <table className="ios-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Members</th>
                  <th>Editable</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role.id}>
                    <td>
                      <div className="font-medium text-primary">{role.name}</div>
                      <div className="text-sm text-secondary max-w-md">{role.description}</div>
                    </td>
                    <td>{memberCounts[role.id] ?? 0}</td>
                    <td>
                      <span className={`badge ${role.editable ? 'badge-blue' : 'badge-gray'}`}>
                        {role.editable ? 'Yes' : 'System'}
                      </span>
                    </td>
                    <td>
                      <button type="button" className="ios-btn-plain text-sm" onClick={() => setDetailRole(role)}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DataListPage>

      {detailRole && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          role="dialog"
          aria-modal="true"
        >
          <div className="ios-card max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-semibold text-primary">{detailRole.name}</h3>
            <p className="text-sm text-secondary">{detailRole.description}</p>
            {detailRole.permissions.length > 0 && (
              <ul className="text-sm text-secondary list-disc pl-5 space-y-1">
                {detailRole.permissions.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            )}
            {detailRole.id === 'custom' && (
              <p className="text-sm text-secondary">Custom role editor is planned for a follow-up release.</p>
            )}
            <button type="button" className="ios-btn-primary w-full" onClick={() => setDetailRole(null)}>
              Close
            </button>
          </div>
        </div>
      )}
      {showCreate && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}><div className="ios-card p-6 max-w-md w-full space-y-4"><h2 className="text-lg font-semibold">Create custom role</h2><input className="ios-input w-full" value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} placeholder="Role name" /><div className="flex gap-3 justify-end"><button type="button" className="ios-btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button><button type="button" className="ios-btn-primary" disabled={!newRoleName.trim()} onClick={async () => { await createCustomRole({ variables: { input: { tenantId: queryTenantId, name: newRoleName.trim(), permissions: { canViewReports: true } } } }); setNewRoleName(''); setShowCreate(false); await refetchCustomRoles(); }}>Create</button></div></div></div>)
    </OrganizationShell>
  );
}

export default function OrganizationRolesPage(props: Props) {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={3}>
      <OrganizationRolesContent {...props} />
    </SnackbarProvider>
  );
}

export const getServerSideProps = getTenantPageProps;
