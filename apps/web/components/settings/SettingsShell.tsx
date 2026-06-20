import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AppLayout, getDefaultLogo, getDefaultSidebarSections, SplitPageLayout } from '@luxgen/ui';
import { createHandleUserAction } from '../../lib/user-actions';
import { useLayoutUser } from '../../lib/app-layout-user';
import { useAppLayoutHeader } from '../../lib/app-layout-header';
import { SETTINGS_GROUPS, SETTINGS_SECTIONS, type SettingsSectionId } from '../../lib/settings-sections';

interface SettingsShellProps {
  tenant: string;
  activeSection?: SettingsSectionId;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function SettingsShell({ tenant, activeSection, title, subtitle, children }: SettingsShellProps) {
  const router = useRouter();
  const layoutUser = useLayoutUser();
  const handleUserAction = createHandleUserAction(router);
  const headerProps = useAppLayoutHeader();

  const settingsNav = (
    <nav className="ios-card p-3 space-y-4 h-fit">
      {SETTINGS_GROUPS.map((group) => (
        <div key={group.title}>
          <p className="text-xs font-semibold uppercase tracking-wide text-tertiary px-2 mb-1">{group.title}</p>
          <ul className="space-y-0.5">
            {group.ids.map((id) => {
              const section = SETTINGS_SECTIONS.find((s) => s.id === id);
              if (!section) return null;
              const active = activeSection === id;
              return (
                <li key={id}>
                  <Link href={section.href} className={`nav-item block rounded-lg ${active ? 'active' : ''}`}>
                    <span>{section.icon}</span>
                    <span className="truncate">{section.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <>
      <Head>
        <title>{title} — Settings</title>
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
          maxWidth="1152px"
          header={
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <Link href="/settings" className="ios-btn-plain text-sm mb-2 inline-block">
                  ← All settings
                </Link>
                <h1 className="ios-large-title">{title}</h1>
                {subtitle && <p className="mt-1 text-secondary text-sm">{subtitle}</p>}
              </div>
              <span className="badge badge-gray capitalize">{tenant} workspace</span>
            </div>
          }
          leading={settingsNav}
          main={<div className="space-y-6">{children}</div>}
        />
      </AppLayout>
    </>
  );
}
