import { useEffect, useState } from 'react';
import { SnackbarProvider, useSnackbar } from '@luxgen/ui';
import { SettingsShell } from '../../components/settings/SettingsShell';
import { getTenantPageProps } from '../../lib/tenant-page-props';
import { fetchTenantConfig, fetchTenantCurrent, patchTenantGeneral } from '../../lib/tenant-api';

interface Props {
  tenant: string;
}

function GeneralContent({ tenant }: Props) {
  const { showSuccess, showError } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [storeName, setStoreName] = useState(`${tenant.charAt(0).toUpperCase()}${tenant.slice(1)} Workspace`);
  const [email, setEmail] = useState(`admin@${tenant}.com`);
  const [timezone, setTimezone] = useState('America/New_York');
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [current, config] = await Promise.all([fetchTenantCurrent(), fetchTenantConfig()]);
        if (cancelled) return;
        setStoreName(current.name);
        const regional = config.config?.regional;
        if (regional?.contactEmail) setEmail(regional.contactEmail);
        if (regional?.timezone) setTimezone(regional.timezone);
        if (regional?.currency) setCurrency(regional.currency);
      } catch (err) {
        if (!cancelled) {
          showError(err instanceof Error ? err.message : 'Failed to load settings');
        }
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
      await patchTenantGeneral({
        name: storeName.trim(),
        regional: {
          contactEmail: email.trim(),
          timezone,
          currency,
        },
      });
      showSuccess('General settings saved');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsShell
      tenant={tenant}
      activeSection="general"
      title="General"
      subtitle="Store details and regional preferences"
    >
      <div className="ios-card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-primary">Store details</h2>
        {loading ? (
          <p className="text-secondary text-sm">Loading…</p>
        ) : (
          <>
            <div className="ios-form-group">
              <label htmlFor="storeName">Store / tenant name</label>
              <input
                id="storeName"
                className="ios-input"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
              />
            </div>
            <div className="ios-form-group">
              <label htmlFor="email">Contact email</label>
              <input
                id="email"
                type="email"
                className="ios-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="ios-form-group">
                <label htmlFor="timezone">Timezone</label>
                <select
                  id="timezone"
                  className="ios-input"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                >
                  <option value="America/New_York">Eastern (US)</option>
                  <option value="America/Los_Angeles">Pacific (US)</option>
                  <option value="Europe/London">London</option>
                  <option value="Asia/Kolkata">India</option>
                </select>
              </div>
              <div className="ios-form-group">
                <label htmlFor="currency">Currency</label>
                <select
                  id="currency"
                  className="ios-input"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="INR">INR</option>
                </select>
              </div>
            </div>
            <button type="button" className="ios-btn-primary" disabled={saving} onClick={() => void handleSave()}>
              {saving ? 'Saving…' : 'Save settings'}
            </button>
          </>
        )}
      </div>
    </SettingsShell>
  );
}

export default function SettingsGeneralPage(props: Props) {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={3}>
      <GeneralContent {...props} />
    </SnackbarProvider>
  );
}

export const getServerSideProps = getTenantPageProps;
