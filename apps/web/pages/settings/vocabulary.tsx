import { useEffect, useState } from 'react';
import { SnackbarProvider, useSnackbar } from '@luxgen/ui';
import { SettingsShell } from '../../components/settings/SettingsShell';
import { getTenantPageProps } from '../../lib/tenant-page-props';
import { fetchTenantVocabulary, patchTenantVocabulary, type TenantVocabularyPayload } from '../../lib/tenant-api';
import { DEFAULT_VOCABULARY, invalidateVocabularyCache } from '../../hooks/useVocabulary';

interface Props {
  tenant: string;
}

// Doc order per docs/PLATFORM_VERTICALIZATION_STRATEGY.md §3 — "Order"/"Product" aliasing is
// already handled by the existing courseToProductRow display layer, so only the six terms a
// non-education tenant actually sees renamed are editable here.
const EDITABLE_TERMS: { key: keyof TenantVocabularyPayload; hint: string }[] = [
  { key: 'course', hint: 'What you sell — e.g. "Product" for digital goods, "Engagement" for agencies' },
  { key: 'student', hint: 'Who buys/attends — e.g. "Customer", "Client", "Member"' },
  { key: 'enrollment', hint: 'The purchase/signup event — e.g. "Purchase", "Subscription"' },
  { key: 'instructor', hint: 'Who delivers it — e.g. "Consultant", "Host"' },
  { key: 'certificate', hint: 'Completion proof — leave as-is if not applicable' },
  { key: 'group', hint: 'Cohorts/segments of people' },
];

function VocabularyContent({ tenant }: Props) {
  const { showSuccess, showError } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const vocabulary = await fetchTenantVocabulary();
        if (cancelled) return;
        setValues({ ...DEFAULT_VOCABULARY, ...vocabulary });
      } catch (err) {
        if (!cancelled) showError(err instanceof Error ? err.message : 'Failed to load vocabulary');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showError]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await patchTenantVocabulary(values);
      invalidateVocabularyCache({ ...DEFAULT_VOCABULARY, ...updated });
      showSuccess('Vocabulary saved');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsShell
      tenant={tenant}
      activeSection="vocabulary"
      title="Vocabulary"
      subtitle="Rename Course, Student, and related terms to fit your business — nothing else changes"
    >
      <div className="ios-card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-primary">Terminology</h2>
        <p className="text-sm text-secondary">
          Internal data and URLs never change — this only relabels what your team and customers see.
        </p>
        {loading ? (
          <p className="text-secondary text-sm">Loading…</p>
        ) : (
          <>
            {EDITABLE_TERMS.map(({ key, hint }) => (
              <div key={key} className="ios-form-group">
                <label htmlFor={`vocab-${key}`}>
                  {DEFAULT_VOCABULARY[key]} <span className="text-tertiary text-xs">({hint})</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id={`vocab-${key}`}
                    className="ios-input"
                    value={values[key] ?? DEFAULT_VOCABULARY[key]}
                    onChange={(e) => setValues((prev) => ({ ...prev, [key]: e.target.value }))}
                  />
                  <span className="badge badge-gray text-xs whitespace-nowrap">
                    Preview: {values[key]?.trim() || DEFAULT_VOCABULARY[key]}
                  </span>
                </div>
              </div>
            ))}
            <button type="button" className="ios-btn-primary" disabled={saving} onClick={() => void handleSave()}>
              {saving ? 'Saving…' : 'Save vocabulary'}
            </button>
          </>
        )}
      </div>
    </SettingsShell>
  );
}

export default function SettingsVocabularyPage(props: Props) {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={3}>
      <VocabularyContent {...props} />
    </SnackbarProvider>
  );
}

export const getServerSideProps = getTenantPageProps;
