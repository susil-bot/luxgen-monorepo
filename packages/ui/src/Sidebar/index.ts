export { LuxSidebarNavItem } from './LuxSidebarNavItem';
export { LuxSidebarSubItems } from './LuxSidebarSubItems';
export { Sidebar } from './Sidebar';
export { SidebarItem } from './SidebarItem';
export { SidebarSection } from './SidebarSection';
export { SidebarProvider, useSidebar } from './SidebarProvider';
export type { SidebarProps } from './Sidebar';

// ── Phase 1: LuxGen sidebar types and hooks (no visual component yet) ──────────
export type {
  NavItem,
  NavBadge,
  NavSection,
  SidebarTenant,
  SidebarUser,
  LuxSidebarProps,
  SidebarInternalState,
  SidebarContextValue,
} from './sidebar.types';

export { useSidebarActive } from './useSidebarActive';
export type { ActiveState } from './useSidebarActive';

export { useSidebarSearch } from './useSidebarSearch';
