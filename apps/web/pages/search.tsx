import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { AppLayout } from '@luxgen/ui';
import { useAppShellConfig } from '../lib/app-shell-config';
import { useLayoutUser, useAppTenantId } from '../lib/app-layout-user';
import { PageHead } from '../components/seo/PageHead';
import { PageEmptyState } from '../components/common/PageStates';
import { useSearchPresenter } from '@luxgen/presenters/search';
import {
  clearRecentSearches,
  getRecentSearches,
  recordRecentSearch,
  removeRecentSearch,
  type RecentSearchEntry,
} from '../lib/recent-searches';
import {
  getPinnedSearches,
  isPinnedLimitReached,
  pinSearch,
  unpinSearch,
  type PinnedSearchEntry,
} from '../lib/pinned-searches';

function timeAgo(ts: number): string {
  const diffMs = Date.now() - ts;
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

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

  const [recent, setRecent] = useState<RecentSearchEntry[]>([]);
  const [pinned, setPinned] = useState<PinnedSearchEntry[]>([]);

  // Load recent + pinned searches once on mount (client-only — localStorage).
  useEffect(() => {
    setRecent(getRecentSearches());
    setPinned(getPinnedSearches());
  }, []);

  const currentIsPinned = q ? pinned.some((p) => p.query.toLowerCase() === q.toLowerCase()) : false;
  const togglePinCurrent = () => {
    if (!q) return;
    setPinned(currentIsPinned ? unpinSearch(q) : pinSearch(q));
  };

  // Record a completed search once results have settled (T-SRCH-06).
  useEffect(() => {
    if (!q || loading || error) return;
    const resultCount = viewModel.courseCount + viewModel.userCount;
    setRecent(recordRecentSearch(q, resultCount));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, loading, error]);

  const handleRemoveRecent = (query: string) => setRecent(removeRecentSearch(query));
  const handleClearRecent = () => {
    clearRecentSearches();
    setRecent([]);
  };

  return (
    <>
      <PageHead title={q ? `Search: ${q}` : 'Search'} robots="noindex" />
      <AppLayout sidebarSections={sidebarSections} user={layoutUser ?? undefined} logo={logo} responsive>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between gap-3 mb-2">
            <h1 className="ios-large-title">Search</h1>
            {q ? (
              <button
                type="button"
                className="ios-btn-secondary text-xs flex-shrink-0"
                onClick={togglePinCurrent}
                disabled={!currentIsPinned && isPinnedLimitReached()}
                title={!currentIsPinned && isPinnedLimitReached() ? 'Max 5 pinned searches — unpin one first' : undefined}
                aria-pressed={currentIsPinned}
              >
                {currentIsPinned ? '📌 Pinned' : '📌 Pin this search'}
              </button>
            ) : null}
          </div>
          {!viewModel.hasQuery ? (
            <div className="space-y-6">
              <PageEmptyState title="Enter a search term" subtitle="Use ⌘K / Ctrl+K or the nav search to find courses and learners." />
              {pinned.length > 0 ? (
                <section aria-label="Pinned searches">
                  <h2 className="font-semibold text-sm mb-2" style={{ color: 'var(--color-label-secondary)' }}>
                    PINNED
                  </h2>
                  <ul className="list-none m-0 p-0 space-y-1">
                    {pinned.map((entry) => (
                      <li
                        key={entry.query}
                        className="flex items-center justify-between gap-3 py-2 px-1"
                        style={{ borderBottom: '1px solid var(--color-separator)' }}
                      >
                        <a
                          href={`/search?q=${encodeURIComponent(entry.query)}&tenant=${tenant}`}
                          className="flex-1 min-w-0 no-underline"
                          style={{ color: 'var(--color-label-primary)' }}
                        >
                          <span aria-hidden>📌 </span>
                          <span className="text-sm font-medium">{entry.query}</span>
                        </a>
                        <button
                          type="button"
                          aria-label={`Unpin "${entry.query}"`}
                          className="ios-btn-plain text-xs flex-shrink-0"
                          onClick={() => setPinned(unpinSearch(entry.query))}
                        >
                          Unpin
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
              {recent.length > 0 ? (
                <section aria-label="Recent searches">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="font-semibold text-sm" style={{ color: 'var(--color-label-secondary)' }}>
                      RECENT
                    </h2>
                    <button type="button" className="ios-btn-plain text-xs" onClick={handleClearRecent}>
                      Clear history
                    </button>
                  </div>
                  <ul className="list-none m-0 p-0 space-y-1">
                    {recent.map((entry) => (
                      <li
                        key={entry.query}
                        className="flex items-center justify-between gap-3 py-2 px-1"
                        style={{ borderBottom: '1px solid var(--color-separator)' }}
                      >
                        <a
                          href={`/search?q=${encodeURIComponent(entry.query)}&tenant=${tenant}`}
                          className="flex-1 min-w-0 no-underline"
                          style={{ color: 'var(--color-label-primary)' }}
                        >
                          <span className="block text-sm font-medium truncate">{entry.query}</span>
                          <span className="block text-xs" style={{ color: 'var(--color-label-tertiary)' }}>
                            {timeAgo(entry.ts)} · {entry.resultCount} result{entry.resultCount === 1 ? '' : 's'}
                          </span>
                        </a>
                        <button
                          type="button"
                          aria-label={`Remove "${entry.query}" from recent searches`}
                          className="ios-btn-plain text-xs flex-shrink-0"
                          onClick={() => handleRemoveRecent(entry.query)}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>
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
