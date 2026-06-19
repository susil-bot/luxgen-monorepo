import { useState } from 'react';
import { SettingsShell } from '../../components/settings/SettingsShell';
import { getTenantPageProps } from '../../lib/tenant-page-props';

interface Props {
  tenant: string;
}

export default function SettingsGeneralPage({ tenant }: Props) {
  const [storeName, setStoreName] = useState(`${tenant.charAt(0).toUpperCase()}${tenant.slice(1)} Workspace`);
  const [email, setEmail] = useState(`admin@${tenant}.com`);
  const [timezone, setTimezone] = useState('America/New_York');
  const [currency, setCurrency] = useState('USD');

  return (
    <SettingsShell
      tenant={tenant}
      activeSection="general"
      title="General"
      subtitle="Store details and regional preferences"
    >
      <div className="ios-card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-primary">Store details</h2>
        <div className="ios-form-group">
          <label htmlFor="storeName">Store / tenant name</label>
          <input id="storeName" className="ios-input" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
        </div>
        <div className="ios-form-group">
          <label htmlFor="email">Contact email</label>
          <input id="email" type="email" className="ios-input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="ios-form-group">
            <label htmlFor="timezone">Timezone</label>
            <select id="timezone" className="ios-input" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
              <option value="America/New_York">Eastern (US)</option>
              <option value="America/Los_Angeles">Pacific (US)</option>
              <option value="Europe/London">London</option>
              <option value="Asia/Kolkata">India</option>
            </select>
          </div>
          <div className="ios-form-group">
            <label htmlFor="currency">Currency</label>
            <select id="currency" className="ios-input" value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="INR">INR</option>
            </select>
          </div>
        </div>
        <p className="text-xs text-tertiary">Tenant API persistence — Phase 2 (REST PATCH /api/tenant/config)</p>
        <button type="button" className="ios-btn-primary" disabled>
          Save (coming soon)
        </button>
      </div>
    </SettingsShell>
  );
}

export const getServerSideProps = getTenantPageProps;
