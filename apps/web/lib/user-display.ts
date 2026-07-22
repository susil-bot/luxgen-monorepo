/** GraphQL user row from GET_USERS */
export interface GraphQLUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status?: string;
  isActive?: boolean;
  createdAt: string;
}

export interface UserTableRow {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  roleLabel: string;
  status: string;
  statusLabel: string;
  joinedAt: string;
}

export interface RoleSummary {
  id: string;
  name: string;
  description: string;
  userCount: number;
  users: UserTableRow[];
}

const ROLE_META: Record<string, { name: string; description: string; icon: string }> = {
  ADMIN: { name: 'Administrator', description: 'Full tenant administration', icon: '🔴' },
  INSTRUCTOR: { name: 'Instructor', description: 'Creates and manages courses', icon: '✏️' },
  STUDENT: { name: 'Student', description: 'Learner access to content', icon: '👤' },
};

export function roleLabel(role: string): string {
  return ROLE_META[role]?.name ?? role.replace(/_/g, ' ');
}

export function roleIcon(role: string): string {
  return ROLE_META[role]?.icon ?? '👤';
}

const STATUS_META: Record<string, { label: string; badge: string }> = {
  ACTIVE: { label: 'Active', badge: 'badge-green' },
  PENDING: { label: 'Pending', badge: 'badge-orange' },
  INACTIVE: { label: 'Inactive', badge: 'badge-gray' },
  SUSPENDED: { label: 'Suspended', badge: 'badge-red' },
};

export function userStatusLabel(status: string): string {
  return STATUS_META[status]?.label ?? status;
}

export function userStatusBadge(status: string): string {
  return STATUS_META[status]?.badge ?? 'badge-gray';
}

export function emailUsername(email: string): string {
  return email.split('@')[0] ?? email;
}

export function toUserTableRow(user: GraphQLUser): UserTableRow {
  const status = user.status ?? 'ACTIVE';
  return {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`.trim(),
    username: emailUsername(user.email),
    email: user.email,
    role: user.role,
    roleLabel: roleLabel(user.role),
    status,
    statusLabel: userStatusLabel(status),
    joinedAt: user.createdAt,
  };
}

export function buildRoleSummaries(rows: UserTableRow[]): RoleSummary[] {
  const byRole = new Map<string, UserTableRow[]>();
  for (const row of rows) {
    const list = byRole.get(row.role) ?? [];
    list.push(row);
    byRole.set(row.role, list);
  }

  return Array.from(byRole.entries()).map(([role, users]) => ({
    id: role.toLowerCase(),
    name: roleLabel(role),
    description: ROLE_META[role]?.description ?? 'Tenant member',
    userCount: users.length,
    users,
  }));
}

export function formatJoinedDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return '—';
  }
}
