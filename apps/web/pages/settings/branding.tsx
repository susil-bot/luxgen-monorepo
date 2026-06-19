import { useState } from 'react';
import Link from 'next/link';
import { SettingsShell } from '../../components/settings/SettingsShell';
import { getTenantPageProps } from '../../lib/tenant-page-props';

interface Props {
  tenant: string;
}

export default function SettingsBrandingPage({ tenant }: Props) {
  const [primaryColor, setPrimaryColor] = useState('#0A84FF');
  const [logoText, setLogoText] = useState('LuxGen');

  return (
    <SettingsShell tenant={tenant} activeSection="branding" title="Branding" subtitle="Logo, colors, and identity">
      <div className="ios-card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-primary">Brand assets</h2>
        <div className="ios-form-group">
          <label htmlFor="logoText">Logo text</label>
          <input id="logoText" className="ios-input" value={logoText} onChange={(e) => setLogoText(e.target.value)} />
        </div>
        <div className="ios-form-group">
          <label htmlFor="primaryColor">Accent color</label>
          <input
            id="primaryColor"
            type="color"
            className="h-10 w-20 rounded cursor-pointer"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
          />
        </div>
        <p className="text-xs text-tertiary">Maps to tenant.settings.branding via PATCH /api/tenant/branding</p>
        <button type="button" className="ios-btn-primary" disabled>
          Save branding
        </button>
      </div>
    </SettingsShell>
  );
}

export const getServerSideProps = getTenantPageProps;
