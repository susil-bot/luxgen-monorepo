import { useEffect, useState } from 'react';
import { SnackbarProvider, useSnackbar } from '@luxgen/ui';
import { SettingsShell } from '../../components/settings/SettingsShell';
import { getTenantPageProps } from '../../lib/tenant-page-props';
import {
  fetchTenantConfig,
  fetchTenantCurrent,
  patchTenantBranding,
  type TenantBrandingPayload,
} from '../../lib/tenant-api';
import { OptimizedImage } from '../../components/media/OptimizedImage';

interface Props {
  tenant: string;
}

function BrandingContent({ tenant }: Props) {
  const { showSuccess, showError } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#0A84FF');
  const [logoText, setLogoText] = useState('LuxGen');
  const [fontFamily, setFontFamily] = useState('Inter, system-ui, sans-serif');
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [current, config] = await Promise.all([fetchTenantCurrent(), fetchTenantConfig()]);
        if (cancelled) return;
        const branding = { ...current.branding, ...config.branding } as TenantBrandingPayload;
        setPrimaryColor(branding.primaryColor || branding.accentColor || '#0A84FF');
        setLogoText(branding.logo || current.name || 'LuxGen');
        setFontFamily(branding.fontFamily || 'Inter, system-ui, sans-serif');
        if (branding.favicon) setFaviconPreview(branding.favicon);
      } catch (err) {
        if (!cancelled) {
          showError(err instanceof Error ? err.message : 'Failed to load branding');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showError]);

  const handleFaviconFile = (file: File | null) => {
    if (!file) return;
    if (file.size > 500_000) { showError('Favicon must be 500 KB or less'); return; }
    const reader = new FileReader();
    reader.onload = () => setFaviconPreview(String(reader.result ?? ''));
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await patchTenantBranding({
        logo: logoText.trim(),
        primaryColor,
        accentColor: primaryColor,
        fontFamily,
        ...(faviconPreview ? { favicon: faviconPreview } : {}),
      });
      showSuccess('Branding saved');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsShell tenant={tenant} activeSection="branding" title="Branding" subtitle="Logo, colors, and identity">
      <div className="ios-card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-primary">Brand assets</h2>
        {loading ? (
          <p className="text-secondary text-sm">Loading…</p>
        ) : (
          <>
            <div className="ios-form-group">
              <label htmlFor="faviconUpload">Favicon (PNG/SVG, max 500 KB)</label>
              <input id="faviconUpload" type="file" accept="image/png,image/svg+xml,image/x-icon" onChange={(e) => handleFaviconFile(e.target.files?.[0] ?? null)} />
              {faviconPreview && (
                <OptimizedImage src={faviconPreview} alt="" width={32} height={32} unoptimized className="mt-2 h-8 w-8" />
              )}
            </div>
            <div className="ios-form-group">
              <label htmlFor="logoText">Logo text</label>
              <input
                id="logoText"
                className="ios-input"
                value={logoText}
                onChange={(e) => setLogoText(e.target.value)}
              />
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
            <div className="ios-form-group">
              <label htmlFor="fontFamily">Font family</label>
              <input
                id="fontFamily"
                className="ios-input"
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
              />
            </div>
            <button type="button" className="ios-btn-primary" disabled={saving} onClick={() => void handleSave()}>
              {saving ? 'Saving…' : 'Save branding'}
            </button>
          </>
        )}
      </div>
    </SettingsShell>
  );
}

export default function SettingsBrandingPage(props: Props) {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={3}>
      <BrandingContent {...props} />
    </SnackbarProvider>
  );
}

export const getServerSideProps = getTenantPageProps;
