import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { getDefaultSidebarSections, type SidebarSection } from '@luxgen/ui';
import { GET_TENANT_BILLING } from '../graphql/queries/billing';
import { useLayoutUser, useAppTenantId } from './app-layout-user';
import { useVocabulary } from '../hooks/useVocabulary';
import { isAdminOrAbove, isStaffOrAbove } from './user-roles';

type SidebarItem = SidebarSection['items'][number];

interface BillingFlags {
  automations?: boolean;
  analytics?: boolean;
  project?: boolean;
  agentStudio?: boolean;
}

function parseRole(role?: string): string | null {
  if (!role) return null;
  const normalized = role.toUpperCase().replace(/\s+/g, '_');
  const allowed = ['SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR', 'STUDENT', 'USER'];
  return allowed.includes(normalized) ? normalized : null;
}

function staffOrAbove(role: string | null): boolean {
  return role !== null && isStaffOrAbove(role);
}

function adminOrAbove(role: string | null): boolean {
  return role !== null && isAdminOrAbove(role);
}

function filterItem(item: SidebarItem, role: string | null, flags: BillingFlags, guest: boolean): boolean {
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
    case 'tenant-map':
    case 'search-analytics':
      return role === 'SUPER_ADMIN';
    case 'create-course':
      return staffOrAbove(role);
    default:
      return true;
  }
}

function filterItems(items: SidebarItem[], role: string | null, flags: BillingFlags, guest: boolean): SidebarItem[] {
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

function filterSection(
  section: SidebarSection,
  role: string | null,
  flags: BillingFlags,
  guest: boolean,
): SidebarSection | null {
  if (guest && !['listings', 'settings', 'navigation'].includes(section.id)) {
    return null;
  }
  if (section.id === 'organization' && !adminOrAbove(role)) return null;
  if (section.id === 'developer' && flags.automations !== true) return null;
  if (section.id === 'developer-tools' && flags.agentStudio !== true) return null;

  const items = filterItems(section.items, role, flags, guest);
  return items.length > 0 ? { ...section, items } : null;
}

/**
 * T-VERT-04 — relabels the Learning > Courses branch using the tenant vocabulary layer.
 * Internal item ids/hrefs never change (nav routing, filterItem() switch above, and tests that
 * key off item.id all keep working) — only the label text a human reads is swapped.
 */
function relabelCourseItems(sections: SidebarSection[], t: (term: 'course', form?: 'singular' | 'plural') => string): SidebarSection[] {
  const relabelItem = (item: SidebarItem): SidebarItem => {
    let label = item.label;
    if (item.id === 'courses') label = t('course', 'plural');
    else if (item.id === 'all-courses') label = `All ${t('course', 'plural')}`;
    else if (item.id === 'my-courses') label = `My ${t('course', 'plural')}`;
    else if (item.id === 'create-course') label = `Create ${t('course')}`;
    else if (item.id === 'course-analytics') label = `${t('course')} Analytics`;
    if (!item.children?.length) return label === item.label ? item : { ...item, label };
    return { ...item, label, children: item.children.map((child) => relabelItem(child as SidebarItem)) as SidebarItem[]['children'] };
  };

  return sections.map((section) =>
    section.id === 'learning' ? { ...section, items: section.items.map(relabelItem) } : section,
  );
}

/** Role- and plan-aware sidebar sections (UI-14). */
export function useSidebarSections(): SidebarSection[] {
  const layoutUser = useLayoutUser();
  const tenantId = useAppTenantId();
  const role = parseRole(layoutUser?.role);
  const guest = !layoutUser;
  const { t } = useVocabulary();

  const { data } = useQuery(GET_TENANT_BILLING, {
    variables: { tenantId: tenantId ?? '' },
    skip: !tenantId,
    fetchPolicy: 'cache-first',
  });

  const flags: BillingFlags = data?.tenantBilling?.featureFlags ?? {};

  return useMemo(() => {
    const base = getDefaultSidebarSections();
    const filtered = base
      .map((section) => filterSection(section, role, flags, guest))
      .filter((section): section is SidebarSection => section !== null);
    return relabelCourseItems(filtered, t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, flags.automations, flags.analytics, flags.project, flags.agentStudio, guest, t('course'), t('course', 'plural')]);
}
