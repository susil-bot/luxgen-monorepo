import { useQuery } from '@apollo/client';
import { AppLayout } from '@luxgen/ui';
import { useAppShellConfig } from '../../lib/app-shell-config';
import { useLayoutUser, useAppTenantId } from '../../lib/app-layout-user';
import { PageHead } from '../../components/seo/PageHead';
import { PageEmptyState, PageLoadingState } from '../../components/common/PageStates';
import { GET_SEARCH_EVENT_SUMMARY } from '../../graphql/queries/search-analytics';

/**
 * Search analytics admin page (T-SRCH-08) — docs/TODO-search.md §9.
 * The backing GraphQL field (`searchEventSummary`) is a paired apps/api change tracked
 * separately from this apps/web PR — until it lands, this renders a clear "not available
 * yet" state instead of fabricating numbers.
 */
export default function SearchAnalyticsPage() {
  const layoutUser = useLayoutUser();
  const { sidebarSections, logo } = useAppShellConfig();
  const tenantId = useAppTenantId();

  const { data, loading, error } = useQuery(GET_SEARCH_EVENT_SUMMARY, {
    variables: { tenantId: tenantId ?? '' },
    skip: !tenantId,
    errorPolicy: 'all',
  });

  const summary = data?.searchEventSummary;

  return (
    <>
      <PageHead title="Search analytics" robots="noindex" />
      <AppLayout sidebarSections={sidebarSections} user={layoutUser ?? undefined} logo={logo} responsive>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="ios-large-title mb-2">Search analytics</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--color-label-secondary)' }}>
            Query volume, top searches, and zero-result queries across your tenant.
          </p>

          {loading ? (
            <PageLoadingState label="Loading search analytics…" />
          ) : !summary ? (
            <PageEmptyState
              icon="🔍"
              title="Search analytics isn't available yet"
              subtitle={
                error
                  ? 'The backend for this feature is being built separately — check back soon.'
                  : 'No search activity has been logged for this tenant yet.'
              }
            />
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="ios-card p-4">
                  <p className="text-xs" style={{ color: 'var(--color-label-secondary)' }}>
                    Total searches
                  </p>
                  <p className="text-2xl font-semibold mt-1">{summary.totalSearches}</p>
                </div>
                <div className="ios-card p-4">
                  <p className="text-xs" style={{ color: 'var(--color-label-secondary)' }}>
                    Avg. results
                  </p>
                  <p className="text-2xl font-semibold mt-1">{summary.avgResultCount.toFixed(1)}</p>
                </div>
                <div className="ios-card p-4">
                  <p className="text-xs" style={{ color: 'var(--color-label-secondary)' }}>
                    Zero-result searches
                  </p>
                  <p className="text-2xl font-semibold mt-1">{summary.zeroResultCount}</p>
                </div>
              </div>

              <section>
                <h2 className="font-semibold mb-2">Top searches</h2>
                {summary.topQueries.length === 0 ? (
                  <p className="text-sm" style={{ color: 'var(--color-label-tertiary)' }}>
                    No searches recorded yet.
                  </p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--color-separator)' }}>
                        <th className="text-left py-2 font-medium">Query</th>
                        <th className="text-right py-2 font-medium">Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.topQueries.map((row: { query: string; count: number }) => (
                        <tr key={row.query} style={{ borderBottom: '1px solid var(--color-separator)' }}>
                          <td className="py-2">{row.query}</td>
                          <td className="py-2 text-right">{row.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>
            </div>
          )}
        </div>
      </AppLayout>
    </>
  );
}
