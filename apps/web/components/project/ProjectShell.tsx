import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AppLayout } from '@luxgen/ui';

import { useCommercePageShell } from '../../lib/commerce-page-shell';
import { ProjectProvider, useProject } from './ProjectProvider';
import { PageLoadingState } from '../common/PageStates';

export type ProjectTab = 'current' | 'next' | 'priority' | 'workflows';

interface ProjectShellProps {
  tenant: string;
  title: string;
  subtitle: string;
  activeTab: ProjectTab;
  children: React.ReactNode;
}

const TABS: { id: ProjectTab; label: string; href: string }[] = [
  { id: 'current', label: 'Ongoing iteration', href: '/project/iteration/current' },
  { id: 'next', label: 'Next iteration', href: '/project/iteration/next' },
  { id: 'priority', label: 'Priority', href: '/project/priority' },
  { id: 'workflows', label: 'My workflows', href: '/project/workflows' },
];

function ProjectShellInner({ tenant, title, subtitle, activeTab, children }: ProjectShellProps) {
  const router = useRouter();
  const { appLayoutProps } = useCommercePageShell();
  const { filterQuery, setFilterQuery, loading, error, items } = useProject();

  return (
    <>
      <Head>
        <title>
          {title} — {tenant}
        </title>
      </Head>
      <AppLayout {...appLayoutProps}>
        <div className="lux-project-page">
          <header className="lux-project-header">
            <div className="lux-project-header__top">
              <div>
                <h1 className="lux-project-header__title">{title}</h1>
                <p className="lux-project-header__subtitle">{subtitle}</p>
              </div>
              <Link
                href={`/project/workflows?tenant=${encodeURIComponent(tenant)}`}
                className="lux-project-workflows-btn"
              >
                <span aria-hidden>⚡</span>
                Workflows
              </Link>
            </div>

            <nav className="lux-project-tabs" aria-label="Project views">
              {TABS.map((tab) => (
                <Link
                  key={tab.id}
                  href={`${tab.href}?tenant=${encodeURIComponent(tenant)}`}
                  className={`lux-project-tab${activeTab === tab.id ? ' lux-project-tab--active' : ''}`}
                  aria-current={activeTab === tab.id ? 'page' : undefined}
                >
                  {tab.label}
                </Link>
              ))}
            </nav>

            {activeTab !== 'workflows' && (
              <div className="lux-project-toolbar">
                <input
                  type="search"
                  className="lux-project-search"
                  placeholder="Filter by title, assignee, or label…"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  aria-label="Filter project items"
                />
                {activeTab === 'current' || activeTab === 'next' ? (
                  <button
                    type="button"
                    className="lux-project-add-btn"
                    onClick={() =>
                      router.push({
                        pathname: `/project/iteration/${activeTab}`,
                        query: { tenant, new: '1' },
                      })
                    }
                  >
                    + Add item
                  </button>
                ) : null}
              </div>
            )}
          </header>

          <div className="lux-project-content">
            {loading && items.length === 0 ? (
              <PageLoadingState label="Loading project board…" />
            ) : error ? (
              <p className="lux-project-empty" role="alert">
                {error}
              </p>
            ) : (
              children
            )}
          </div>
        </div>
      </AppLayout>
    </>
  );
}

export function ProjectShell(props: ProjectShellProps) {
  return (
    <ProjectProvider tenant={props.tenant}>
      <ProjectShellInner {...props} />
    </ProjectProvider>
  );
}
