/** System roles — replaces legacy POS device roles */

export interface OrganizationRoleDefinition {
  id: string;
  name: string;
  description: string;
  /** Maps to LuxGen UserRole enum when applicable */
  mapsToRole?: string;
  /** Only org owners / super admins can edit */
  editable: boolean;
  permissions: string[];
}

export const ORGANIZATION_SYSTEM_ROLES: OrganizationRoleDefinition[] = [
  {
    id: 'org_owner',
    name: 'Organization owner',
    description: 'Full control over organization settings, billing, and security',
    mapsToRole: 'ADMIN',
    editable: false,
    permissions: ['organization.manage', 'billing.manage', 'security.manage', 'users.manage', 'roles.manage'],
  },
  {
    id: 'org_admin',
    name: 'Organization administrator',
    description: 'Manage users, groups, and organization settings except billing ownership',
    mapsToRole: 'ADMIN',
    editable: false,
    permissions: ['users.manage', 'groups.manage', 'roles.view', 'security.view'],
  },
  {
    id: 'store_admin',
    name: 'Store administrator',
    description: 'Manage store content, courses, and day-to-day operations',
    mapsToRole: 'ADMIN',
    editable: true,
    permissions: ['courses.manage', 'groups.manage', 'users.invite', 'analytics.view'],
  },
  {
    id: 'app_developer',
    name: 'App developer',
    description: 'Build automations, integrations, and custom apps',
    editable: true,
    permissions: ['developer.access', 'automations.manage', 'api.keys'],
  },
  {
    id: 'instructor',
    name: 'Instructor',
    description: 'Create and deliver courses; manage assigned groups',
    mapsToRole: 'INSTRUCTOR',
    editable: true,
    permissions: ['courses.manage', 'groups.view', 'learners.view'],
  },
  {
    id: 'member',
    name: 'Member',
    description: 'Standard staff access to assigned resources',
    mapsToRole: 'STUDENT',
    editable: true,
    permissions: ['courses.view', 'groups.view'],
  },
];

export function exportRolesCsv(roles: OrganizationRoleDefinition[], memberCounts: Record<string, number>): string {
  const header = 'Role,Description,Members,Editable,Permissions';
  const rows = roles.map((r) => {
    const count = memberCounts[r.id] ?? 0;
    const perms = r.permissions.join('; ');
    return `"${r.name}","${r.description}",${count},${r.editable ? 'Yes' : 'No'},"${perms}"`;
  });
  return [header, ...rows].join('\n');
}
