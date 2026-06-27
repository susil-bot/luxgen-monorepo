import Head from 'next/head';
import { useAppShellConfig } from '../../lib/app-shell-config';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AppLayout } from '@luxgen/ui';
import { createHandleUserAction } from '../../lib/user-actions';
import { useLayoutUser } from '../../lib/app-layout-user';
import { useAppLayoutHeader } from '../../lib/app-layout-header';
import { SETTINGS_GROUPS, SETTINGS_SECTIONS } from '../../lib/settings-sections';
import { getTenantPageProps } from '../../lib/tenant-page-props';

interface SettingsIndexProps {
  tenant: string;
}

export default function SettingsIndexPage({ tenant }: SettingsIndexProps) {
  const { sidebarSections, logo } = useAppShellConfig();
  const router = useRouter();
  const layoutUser = useLayoutUser();
  const handleUserAction = createHandleUserAction(router);
  const headerProps = useAppLayoutHeader();

  return (
    <>
      <Head>
        <title>Settings — {tenant}</title>
      </Head>

      <AppLayout
        sidebarSections={sidebarSections}
        user={layoutUser ?? undefined}
        logo={logo}
        onUserAction={handleUserAction}
        {...headerProps}
        responsive
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <div>
            <h1 className="ios-large-title">Settings</h1>
            <p className="mt-1 text-secondary text-sm">Manage your workspace, team, and commerce preferences</p>
          </div>

          {SETTINGS_GROUPS.map((group) => (
            <section key={group.title}>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-tertiary mb-3">{group.title}</h2>
              <div className="ios-card divide-y" style={{ borderColor: 'var(--color-separator)' }}>
                {group.ids.map((id) => {
                  const section = SETTINGS_SECTIONS.find((s) => s.id === id);
                  if (!section) return null;
                  const statusLabel =
                    section.status === 'implemented' ? 'Live' : section.status === 'partial' ? 'Partial' : 'Planned';

                  return (
                    <Link
                      key={section.id}
                      href={section.href}
                      className="flex items-center gap-4 p-4 hover:bg-[var(--color-fill-quaternary)] transition-colors"
                    >
                      <span className="text-2xl" aria-hidden>
                        {section.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-primary">{section.label}</p>
                        <p className="text-sm text-secondary truncate">{section.description}</p>
                      </div>
                      <span
                        className={`badge ${
                          section.status === 'implemented'
                            ? 'badge-green'
                            : section.status === 'partial'
                              ? 'badge-orange'
                              : 'badge-gray'
                        }`}
                      >
                        {statusLabel}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </AppLayout>
    </>
  );
}

export const getServerSideProps = getTenantPageProps;
