import { useRouter } from 'next/router';
import { createHandleUserAction } from './user-actions';
import { useLayoutUser } from './app-layout-user';
import { useAppLayoutHeader } from './app-layout-header';
import { useAppShellConfig } from './app-shell-config';

/** Shared AppLayout props for commerce create/edit/detail pages */
export function useCommercePageShell() {
  const router = useRouter();
  const layoutUser = useLayoutUser();
  const headerProps = useAppLayoutHeader();
  const { sidebarSections, logo } = useAppShellConfig();
  const handleUserAction = createHandleUserAction(router);

  return {
    layoutUser,
    headerProps,
    handleUserAction,
    sidebarSections,
    logo,
    appLayoutProps: {
      sidebarSections,
      user: layoutUser ?? undefined,
      logo,
      onUserAction: handleUserAction,
      ...headerProps,
      responsive: true as const,
    },
  };
}
