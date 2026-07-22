import Link from 'next/link';
import { useRouter } from 'next/router';
import { AppLayout } from '@luxgen/ui';
import type { ReactNode } from 'react';

import { useAppLayoutHeader } from '../../../../lib/app-layout-header';
import { useLayoutUser } from '../../../../lib/app-layout-user';
import { useAppShellConfig } from '../../../../lib/app-shell-config';
import { createHandleUserAction } from '../../../../lib/user-actions';
import styles from './styles';

export const TOWER_SUB_NAV = [
  { id: 'workflows', label: 'Tower', href: '/automations/tower' },
  { id: 'runs', label: 'Recent Run Logs', href: '/automations/tower/runs' },
] as const;

interface TowerShellProps {
  tenant: string;
  activeSubNav: (typeof TOWER_SUB_NAV)[number]['id'];
  title: string;
  lead?: string;
  primaryAction?: { label: string; onClick: () => void };
  children: ReactNode;
}

export function TowerShell({ activeSubNav, title, lead, primaryAction, children }: TowerShellProps) {
  const router = useRouter();
  const handleUserAction = createHandleUserAction(router);
  const layoutUser = useLayoutUser();
  const headerProps = useAppLayoutHeader();
  const { sidebarSections, logo } = useAppShellConfig();

  return (
    <AppLayout
      sidebarSections={sidebarSections}
      user={layoutUser ?? undefined}
      logo={logo}
      onUserAction={handleUserAction}
      contentMaxWidth={false}
      {...headerProps}
    >
      <div className={styles.shell}>
        <nav className={styles.subNav} aria-label="Tower">
          {TOWER_SUB_NAV.map((item) => {
            const isActive = item.id === activeSubNav;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`${styles.subNavLink} ${isActive ? styles.subNavLinkActive : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>{title}</h1>
            {lead ? <p className={styles.pageLead}>{lead}</p> : null}
          </div>
          {primaryAction ? (
            <button type="button" className={styles.primaryBtn} onClick={primaryAction.onClick}>
              {primaryAction.label}
            </button>
          ) : null}
        </div>

        <div className={styles.content}>{children}</div>
      </div>
    </AppLayout>
  );
}
