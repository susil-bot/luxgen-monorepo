import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AppLayout, getDefaultLogo, getDefaultSidebarSections, SplitPageLayout } from '@luxgen/ui';
import { createHandleUserAction } from '../../lib/user-actions';
import { useLayoutUser } from '../../lib/app-layout-user';
import { useAppLayoutHeader } from '../../lib/app-layout-header';
import { ORGANIZATION_SECTIONS, type OrganizationSectionId } from '../../lib/organization-sections';

interface OrganizationShellProps {
  tenant: string;
  tenantDisplayName?: string;
  activeSection: OrganizationSectionId;
  title: string;
  subtitle?: string;
  /** Optional security sub-nav when inside security section */
  securityNav?: React.ReactNode;
  children: React.ReactNode;
}

export function OrganizationShell({
  tenant,
  tenantDisplayName,
  activeSection,
  title,
  subtitle,
  securityNav,
  children,
}: OrganizationShellProps) {
  const router = useRouter();
  const layoutUser = useLayoutUser();
  const handleUserAction = createHandleUserAction(router);
  const headerProps = useAppLayoutHeader();

  const displayName = tenantDisplayName ?? tenant.charAt(0).toUpperCase() + tenant.slice(1);

  const orgNav = (
    <nav className="ios-card p-3 space-y-1 h-fit">
      <p className="text-xs font-semibold uppercase tracking-wide text-tertiary px-2 mb-2">Organization</p>
      <p className="text-sm font-medium text-primary px-2 mb-3 truncate">{displayName}</p>
      <ul className="space-y-0.5">
        {ORGANIZATION_SECTIONS.map((section) => {
          const active = activeSection === section.id;
          return (
            <li key={section.id}>
              <Link href={section.href} className={`nav-item block rounded-lg ${active ? 'active' : ''}`}>
                <span>{section.icon}</span>
                <span className="truncate">{section.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      {securityNav}
    </nav>
  );

  return (
    <>
      <Head>
        <title>{title} — Organization</title>
      </Head>

      <AppLayout
        sidebarSections={getDefaultSidebarSections()}
        user={layoutUser ?? undefined}
        logo={getDefaultLogo()}
        onUserAction={handleUserAction}
        {...headerProps}
        responsive
      >
        <SplitPageLayout
          variant="nav-main"
          maxWidth="1400px"
          header={
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <Link href="/organization/users" className="ios-btn-plain text-sm mb-2 inline-block">
                  ← Organization
                </Link>
                <h1 className="ios-large-title">{title}</h1>
                {subtitle && <p className="mt-1 text-secondary text-sm">{subtitle}</p>}
              </div>
              <span className="badge badge-gray">{displayName} · tenant</span>
            </div>
          }
          leading={orgNav}
          main={<div className="space-y-6">{children}</div>}
        />
      </AppLayout>
    </>
  );
}
