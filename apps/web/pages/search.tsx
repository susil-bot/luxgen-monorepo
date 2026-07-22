import { useRouter } from 'next/router';
import { AppLayout } from '@luxgen/ui';
import { useAppShellConfig } from '../lib/app-shell-config';
import { useLayoutUser, useAppTenantId } from '../lib/app-layout-user';
import { PageHead } from '../components/seo/PageHead';
import { PageEmptyState } from '../components/common/PageStates';
import { useSearchPresenter } from '../presenters/search';

export default function SearchPage() {
  const router = useRouter();
  const q = typeof router.query.q === 'string' ? router.query.q.trim() : '';
  const tenant = typeof router.query.tenant === 'string' ? router.query.tenant : 'demo';
  const layoutUser = useLayoutUser();
  const { sidebarSections, logo } = useAppShellConfig();
  const tenantId = useAppTenantId();

  const { viewModel, loading } = useSearchPresenter({
    query: q,
    tenantId,
    tenant,
  });

  return (
    <>
      <PageHead title={q ? `Search: ${q}` : 'Search'} robots="noindex" />
      <AppLayout sidebarSections={sidebarSections} user={layoutUser ?? undefined} logo={logo} responsive>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <h1 className="ios-large-title mb-2">Search</h1>
          {!viewModel.hasQuery ? (
            <PageEmptyState title="Enter a search term" subtitle="Use the nav search bar to find courses and users." />
          ) : loading ? (
            <p className="text-secondary text-sm">Searching…</p>
          ) : viewModel.isEmpty ? (
            <PageEmptyState title="No results" subtitle={`Nothing matched "${viewModel.query}".`} />
          ) : (
            <div className="space-y-6">
              <section>
                <h2 className="font-semibold mb-2">Courses ({viewModel.courseCount})</h2>
                <ul className="space-y-2">
                  {viewModel.courses.map((c) => (
                    <li key={c.id}>
                      <a href={c.href} className="text-blue hover:underline">
                        {c.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
              <section>
                <h2 className="font-semibold mb-2">Users ({viewModel.userCount})</h2>
                <ul className="space-y-2">
                  {viewModel.users.map((u) => (
                    <li key={u.id}>
                      <span className="text-primary">{u.label}</span>
                      {u.email && u.label !== u.email ? (
                        <span className="text-secondary text-sm ml-2">{u.email}</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          )}
        </div>
      </AppLayout>
    </>
  );
}
