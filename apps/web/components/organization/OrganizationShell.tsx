import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AppLayout, SplitPageLayout } from '@luxgen/ui';
import { createHandleUserAction } from '../../lib/user-actions';
import { useLayoutUser } from '../../lib/app-layout-user';
import { useAppLayoutHeader } from '../../lib/app-layout-header';
import { useAppShellConfig } from '../../lib/app-shell-config';
import {
  ORGANIZATION_SECTIONS,
  buildOrganizationBreadcrumbs,
  type OrganizationBreadcrumb,
  type OrganizationSectionId,
  type OrganizationSecuritySectionId,
} from '../../lib/organization-sections';

interface OrganizationShellProps {
  tenant: string;
  tenantDisplayName?: string;
  activeSection: OrganizationSectionId;
  title: string;
  subtitle?: string;
  /** Deep security page id for breadcrumb trail (e.g. saml) */
  securitySectionId?: OrganizationSecuritySectionId;
  /** Override auto-generated breadcrumbs */
  breadcrumbs?: OrganizationBreadcrumb[];
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
  securitySectionId,
  breadcrumbs,
  securityNav,
  children,
}: OrganizationShellProps) {
  const router = useRouter();
  const layoutUser = useLayoutUser();
  const handleUserAction = createHandleUserAction(router);
  const headerProps = useAppLayoutHeader();
  const { sidebarSections, logo } = useAppShellConfig();

  const displayName = tenantDisplayName ?? tenant.charAt(0).toUpperCase() + tenant.slice(1);
  const breadcrumbTrail = breadcrumbs ?? buildOrganizationBreadcrumbs(activeSection, securitySectionId);

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
        sidebarSections={sidebarSections}
        user={layoutUser ?? undefined}
        logo={logo}
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
                <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-secondary mb-2">
                  {breadcrumbTrail.map((item, index) => (
                    <span key={`${item.label}-${index}`} className="flex items-center gap-1">
                      {index > 0 ? (
                        <span aria-hidden className="text-tertiary">
                          /
                        </span>
                      ) : null}
                      {item.href ? (
                        <Link href={item.href} className="ios-btn-plain px-0 py-0 min-h-0 text-sm">
                          {item.label}
                        </Link>
                      ) : (
                        <span className="text-primary font-medium">{item.label}</span>
                      )}
                    </span>
                  ))}
                </nav>
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
