import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { AppLayout } from '@luxgen/ui';
import { useAppShellConfig } from '../../lib/app-shell-config';
import { useLayoutUser } from '../../lib/app-layout-user';
import { PageHead } from '../../components/seo/PageHead';
import { PageEmptyState } from '../../components/common/PageStates';
import { deleteSavedSearch, getSavedSearches, type SavedSearchEntry } from '../../lib/saved-searches';

/**
 * Saved searches list (T-SRCH-04) — docs/TODO-search.md §5.
 * localStorage MVP: see apps/web/lib/saved-searches.ts for persistence notes.
 */
export default function SavedSearchesPage() {
  const router = useRouter();
  const layoutUser = useLayoutUser();
  const { sidebarSections, logo } = useAppShellConfig();
  const [saved, setSaved] = useState<SavedSearchEntry[]>([]);

  useEffect(() => {
    setSaved(getSavedSearches());
  }, []);

  return (
    <>
      <PageHead title="Saved searches" robots="noindex" />
      <AppLayout sidebarSections={sidebarSections} user={layoutUser ?? undefined} logo={logo} responsive>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between gap-3 mb-6">
            <h1 className="ios-large-title">Saved searches</h1>
            <button type="button" className="ios-btn-secondary text-sm" onClick={() => router.push('/search')}>
              + New Search
            </button>
          </div>
          {saved.length === 0 ? (
            <PageEmptyState
              title="No saved searches yet"
              subtitle={'Run a search, then click "Save this search" to bookmark it here.'}
            />
          ) : (
            <ul className="list-none m-0 p-0 space-y-1">
              {saved.map((entry) => (
                <li
                  key={entry.id}
                  className="ios-card flex items-center justify-between gap-3 px-4 py-3"
                  style={{ marginBottom: 8 }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold m-0 truncate">⭐ {entry.name}</p>
                    <p className="text-xs m-0 mt-0.5" style={{ color: 'var(--color-label-secondary)' }}>
                      &quot;{entry.query}&quot; · Created {new Date(entry.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <a
                      href={`/search?q=${encodeURIComponent(entry.query)}&tenant=${entry.tenant}`}
                      className="ios-btn-plain text-xs no-underline"
                    >
                      View Results
                    </a>
                    <button
                      type="button"
                      className="ios-btn-plain text-xs"
                      style={{ color: 'var(--color-red)' }}
                      onClick={() => setSaved(deleteSavedSearch(entry.id))}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </AppLayout>
    </>
  );
}
