import { useMemo } from 'react';
import { getDefaultLogo, getDefaultSidebarSections } from '@luxgen/ui';

/** Memoized sidebar + logo for layout shells (UI-10). */
export function useAppShellConfig() {
  const sidebarSections = useMemo(() => getDefaultSidebarSections(), []);
  const logo = useMemo(() => getDefaultLogo(), []);
  return { sidebarSections, logo };
}
