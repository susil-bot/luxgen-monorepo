import { NavBar } from '@luxgen/ui';
import { useRouter } from 'next/router';

import { useLayoutUser } from '../../lib/app-layout-user';
import { createHandleUserAction } from '../../lib/user-actions';

interface StorefrontNavBarProps {
  logoText: string;
  logoHref: string;
  /** Tenant or workspace label shown under the nav bar */
  subtitle?: string;
}

/** Shared top nav for Learn / Store layouts (UI-18) — same NavBar as AppLayout, storefront config. */
export function StorefrontNavBar({ logoText, logoHref, subtitle }: StorefrontNavBarProps) {
  const router = useRouter();
  const layoutUser = useLayoutUser();
  const handleUserAction = createHandleUserAction(router);

  return (
    <header className="sticky top-0 z-30 border-b border-separator backdrop-blur-md" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      <NavBar
        user={
          layoutUser
            ? { name: layoutUser.name, email: layoutUser.email, role: layoutUser.role }
            : undefined
        }
        logo={{ text: logoText, href: logoHref }}
        onUserAction={handleUserAction}
        showSearch={false}
        showNotifications={false}
        showAIStudio={false}
        position="static"
        className="border-0"
      />
      {subtitle ? (
        <p className="px-4 pb-2 text-xs text-secondary -mt-1 max-w-6xl mx-auto">{subtitle}</p>
      ) : null}
    </header>
  );
}
