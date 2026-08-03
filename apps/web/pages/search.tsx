import { useRouter } from 'next/router';
import { AppLayout } from '@luxgen/ui';
import { useAppShellConfig } from '../lib/app-shell-config';
import { useLayoutUser, useAppTenantId } from '../lib/app-layout-user';
import { PageHead } from '../components/seo/PageHead';
import { PageEmptyState } from '../components/common/PageStates';
import { useSearchPresenter } from '@luxgen/presenters/search';

export default function SearchPage() {
  const router = useRouter();
  const q = typeof router.query.q === 'string' ? router.query.q.trim() : '';
  const tenant = typeof router.query.tenant === 'string' ? router.query.tenant : 'demo';
  const layoutUser = useLayoutUser();
  const { sidebarSections, logo } = useAppShellConfig();
  const tenantId = useAppTenantId();

  const { viewModel, loading, error } = useSearchPresenter({
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
            <PageEmptyState title="Enter a search term" subtitle="Use ⌘K / Ctrl+K or the nav search to find courses and learners." />
          ) : error ? (
            <PageEmptyState title="Search temporarily unavailable" subtitle={error} />
          ) : loading ? (
            <p className="text-secondary text-sm">Searching…</p>
          ) : viewModel.isEmpty ? (
            <PageEmptyState title="No results" subtitle={`Nothing matched "${viewModel.query}".`} />
          ) : (
            <div className="space-y-6">
              <section>
                <h2 className="font-semibold mb-2">Courses ({viewModel.courseCount})</h2>
                <ul className="space-y-1 list-none m-0 p-0">
                  {viewModel.courses.map((c) => (
                    <li key={c.id} style={{ borderBottom: '1px solid var(--color-separator)' }}>
                      <a
                        href={c.href}
                        className="flex items-start gap-3 py-3 no-underline"
                        style={{ color: 'var(--color-label-primary)' }}
                      >
                        <span className="text-sm" aria-hidden>
                          🎓
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold">{c.title}</span>
                          <span className="block text-xs" style={{ color: 'var(--color-label-secondary)' }}>
                            {c.typeLabel} · {c.status}
                          </span>
                          <span className="block text-xs truncate" style={{ color: 'var(--color-label-tertiary)' }}>
                            {c.metadata}
                          </span>
                        </span>
                        <span className="text-xs" style={{ color: 'var(--color-blue)' }}>
                          Open
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
              <section>
                <h2 className="font-semibold mb-2">Learners ({viewModel.userCount})</h2>
                <ul className="space-y-1 list-none m-0 p-0">
                  {viewModel.users.map((u) => (
                    <li key={u.id} style={{ borderBottom: '1px solid var(--color-separator)' }}>
                      <a
                        href={u.href}
                        className="flex items-start gap-3 py-3 no-underline"
                        style={{ color: 'var(--color-label-primary)' }}
                      >
                        <span className="text-sm" aria-hidden>
                          👤
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold">{u.title}</span>
                          <span className="block text-xs" style={{ color: 'var(--color-label-secondary)' }}>
                            {u.typeLabel} · {u.status}
                          </span>
                          <span className="block text-xs truncate" style={{ color: 'var(--color-label-tertiary)' }}>
                            {u.metadata}
                          </span>
                        </span>
                        <span className="text-xs" style={{ color: 'var(--color-blue)' }}>
                          Open
                        </span>
                      </a>
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
