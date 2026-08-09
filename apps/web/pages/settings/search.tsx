import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { AppLayout } from '@luxgen/ui';
import { useAppShellConfig } from '../../lib/app-shell-config';
import { useLayoutUser, useAppTenantId } from '../../lib/app-layout-user';
import { PageHead } from '../../components/seo/PageHead';
import { GET_SEARCH_SETTINGS, UPDATE_SEARCH_SETTINGS } from '../../graphql/queries/search-settings';

const RESULTS_PER_PAGE_OPTIONS = [10, 25, 50, 100];
const DEFAULTS = { resultsPerPage: 25, trackSearchHistory: true };

/**
 * Search settings (T-SRCH-12) — docs/TODO-search.md §10, trimmed to the fields that can
 * actually take effect today: results-per-page and history tracking (the latter is read by
 * /search before recording a recent search). AI-search/voice-search toggles from the full spec
 * are omitted rather than shipped as checkboxes that do nothing.
 */
export default function SearchSettingsPage() {
  const layoutUser = useLayoutUser();
  const { sidebarSections, logo } = useAppShellConfig();
  const tenantId = useAppTenantId();
  const { showSuccess, showError } = useSnackbar();

  const { data, loading } = useQuery(GET_SEARCH_SETTINGS, {
    variables: { tenantId: tenantId ?? '' },
    skip: !tenantId,
    errorPolicy: 'all',
  });
  const [updateSettings, { loading: saving }] = useMutation(UPDATE_SEARCH_SETTINGS, { errorPolicy: 'all' });

  const [resultsPerPage, setResultsPerPage] = useState(DEFAULTS.resultsPerPage);
  const [trackSearchHistory, setTrackSearchHistory] = useState(DEFAULTS.trackSearchHistory);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    const settings = data?.searchSettings;
    if (settings) {
      setResultsPerPage(settings.resultsPerPage ?? DEFAULTS.resultsPerPage);
      setTrackSearchHistory(settings.trackSearchHistory ?? DEFAULTS.trackSearchHistory);
    }
  }, [data]);

  const handleSave = async () => {
    if (!tenantId) return;
    const { errors } = await updateSettings({ variables: { tenantId, resultsPerPage, trackSearchHistory } });
    setStatusMessage(
      errors?.length
        ? 'Could not save — the backend for this is being built separately.'
        : 'Search settings saved.',
    );
  };

  return (
    <>
      <PageHead title="Search settings" robots="noindex" />
      <AppLayout sidebarSections={sidebarSections} user={layoutUser ?? undefined} logo={logo} responsive>
        <div className="max-w-2xl mx-auto px-4 py-8">
          <h1 className="ios-large-title mb-6">Search settings</h1>

          <div className="ios-card p-5 space-y-5">
            <div className="ios-form-group">
              <label htmlFor="results-per-page" className="text-sm font-medium block mb-1">
                Results per page
              </label>
              <select
                id="results-per-page"
                className="input-field text-sm"
                value={resultsPerPage}
                disabled={loading}
                onChange={(e) => setResultsPerPage(Number(e.target.value))}
              >
                {RESULTS_PER_PAGE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={trackSearchHistory}
                disabled={loading}
                onChange={(e) => setTrackSearchHistory(e.target.checked)}
              />
              Track search history (powers Recent searches on /search)
            </label>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="ios-btn-primary text-sm"
                onClick={handleSave}
                disabled={saving || !tenantId}
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              {statusMessage ? (
                <span className="text-xs" style={{ color: 'var(--color-label-secondary)' }} role="status">
                  {statusMessage}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  );
}
