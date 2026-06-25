import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { getDefaultSidebarSections, type SidebarSection } from '@luxgen/ui';
import { UserRole, hasRoleAtLeast } from '@luxgen/auth';
import { GET_TENANT_BILLING } from '../graphql/queries/billing';
import { useLayoutUser, useAppTenantId } from './app-layout-user';

type SidebarItem = SidebarSection['items'][number];

interface BillingFlags {
  automations?: boolean;
  analytics?: boolean;
  project?: boolean;
  agentStudio?: boolean;
}

function parseRole(role?: string): UserRole | null {
  if (!role) return null;
  const normalized = role.toUpperCase().replace(/\s+/g, '_');
  return (Object.values(UserRole) as string[]).includes(normalized) ? (normalized as UserRole) : null;
}

function staffOrAbove(role: UserRole | null): boolean {
  return role !== null && hasRoleAtLeast(role, UserRole.INSTRUCTOR);
}

function adminOrAbove(role: UserRole | null): boolean {
  return role !== null && hasRoleAtLeast(role, UserRole.ADMIN);
}

function filterItem(item: SidebarItem, role: UserRole | null, flags: BillingFlags, guest: boolean): boolean {
  if (guest) {
    return ['dashboard', 'listings-directory', 'my-listings', 'profile', 'settings'].includes(item.id);
  }

  switch (item.id) {
    case 'customers':
    case 'products':
    case 'orders':
    case 'admin-listings':
      return adminOrAbove(role);
    case 'analytics':
    case 'course-analytics':
      return staffOrAbove(role) && flags.analytics !== false;
    case 'project':
      return flags.project === true;
    case 'automations':
    case 'marketplace':
      return flags.automations === true;
    case 'agent-studio':
      return flags.agentStudio === true;
    case 'create-course':
      return staffOrAbove(role);
    default:
      return true;
  }
}

function filterItems(items: SidebarItem[], role: UserRole | null, flags: BillingFlags, guest: boolean): SidebarItem[] {
  return items
    .map((item) => {
      if (!filterItem(item, role, flags, guest)) return null;
      if (!item.children?.length) return item;
      const children = item.children.filter((child) => filterItem(child as SidebarItem, role, flags, guest));
      if (children.length === 0 && item.children.length > 0) return null;
      return { ...item, children };
    })
    .filter((item): item is SidebarItem => item !== null);
}

function filterSection(section: SidebarSection, role: UserRole | null, flags: BillingFlags, guest: boolean): SidebarSection | null {
  if (guest && !['listings', 'settings', 'navigation'].includes(section.id)) {
    return null;
  }
  if (section.id === 'organization' && !adminOrAbove(role)) return null;
  if (section.id === 'developer' && flags.automations !== true) return null;
  if (section.id === 'developer-tools' && flags.agentStudio !== true) return null;

  const items = filterItems(section.items, role, flags, guest);
  return items.length > 0 ? { ...section, items } : null;
}

/** Role- and plan-aware sidebar sections (UI-14). */
export function useSidebarSections(): SidebarSection[] {
  const layoutUser = useLayoutUser();
  const tenantId = useAppTenantId();
  const role = parseRole(layoutUser?.role);
  const guest = !layoutUser;

  const { data } = useQuery(GET_TENANT_BILLING, {
    variables: { tenantId: tenantId ?? '' },
    skip: !tenantId,
    fetchPolicy: 'cache-first',
  });

  const flags: BillingFlags = data?.tenantBilling?.featureFlags ?? {};

  return useMemo(() => {
    const base = getDefaultSidebarSections();
    return base
      .map((section) => filterSection(section, role, flags, guest))
      .filter((section): section is SidebarSection => section !== null);
  }, [role, flags.automations, flags.analytics, flags.project, flags.agentStudio, guest]);
}
