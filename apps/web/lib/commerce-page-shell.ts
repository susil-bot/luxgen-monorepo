import { useRouter } from 'next/router';
import { getDefaultLogo, getDefaultSidebarSections } from '@luxgen/ui';
import { createHandleUserAction } from './user-actions';
import { useLayoutUser } from './app-layout-user';
import { useAppLayoutHeader } from './app-layout-header';

/** Shared AppLayout props for commerce create/edit/detail pages */
export function useCommercePageShell() {
  const router = useRouter();
  const layoutUser = useLayoutUser();
  const headerProps = useAppLayoutHeader();
  const handleUserAction = createHandleUserAction(router);

  return {
    layoutUser,
    headerProps,
    handleUserAction,
    sidebarSections: getDefaultSidebarSections(),
    logo: getDefaultLogo(),
    appLayoutProps: {
      sidebarSections: getDefaultSidebarSections(),
      user: layoutUser ?? undefined,
      logo: getDefaultLogo(),
      onUserAction: handleUserAction,
      ...headerProps,
      responsive: true as const,
    },
  };
}
