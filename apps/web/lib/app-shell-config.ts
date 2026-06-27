import { useSidebarSections } from './use-sidebar-sections';
import { useTenantLogo } from './use-tenant-logo';

/** Sidebar, logo, and layout chrome shared by AppLayout shells (UI-10, UI-14, UI-16). */
export function useAppShellConfig() {
  const sidebarSections = useSidebarSections();
  const logo = useTenantLogo();
  return { sidebarSections, logo };
}
