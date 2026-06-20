import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { SnackbarProvider, useSnackbar } from '@luxgen/ui';

import { SettingsShell } from '../../components/settings/SettingsShell';
import { getTenantPageProps } from '../../lib/tenant-page-props';
import {
  defaultStorefrontSettings,
  LUXGEN_STOREFRONT_TENANT_SUBDOMAINS,
  landingPathFromSlug,
  resolveStorefrontSettings,
  type TenantStorefrontSettings,
} from '../../lib/storefront-settings';
import { resolveStorefrontProfile } from '../../lib/storefront-profile';
import { fetchTenantConfig, patchTenantStorefront } from '../../lib/tenant-api';

interface Props {
  tenant: string;
}

function StorefrontSettingsContent({ tenant }: Props) {
  const router = useRouter();
  const { showSuccess, showError } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<TenantStorefrontSettings>(() => defaultStorefrontSettings(tenant));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const config = await fetchTenantConfig();
        if (cancelled) return;
        setSettings(resolveStorefrontSettings(tenant, { config: config.config }));
      } catch (err) {
        if (!cancelled) {
          showError(err instanceof Error ? err.message : 'Failed to load storefront settings');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tenant, showError]);

  const isLuxgenDefaultTenant = LUXGEN_STOREFRONT_TENANT_SUBDOMAINS.has(tenant);

  const profile = resolveStorefrontProfile({
    subdomain: tenant,
    tenantName: tenant,
    settings: { config: { storefront: settings } },
    routes: settings.routes,
    slug: settings.slug,
  });

  const heroHeadline = settings.content?.hero?.headline ?? profile.content.hero.headline;
  const heroSubheadline = settings.content?.hero?.subheadline ?? profile.content.hero.subheadline;
  const accentColor = settings.theme?.accentColor ?? profile.theme.accentColor ?? '#28b485';

  const updateHero = (field: 'headline' | 'subheadline', value: string) => {
    setSettings((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        hero: {
          ...prev.content?.hero,
          [field]: value,
        },
      },
    }));
  };

  const updateSlug = (slug: string) => {
    const normalized = slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '');
    setSettings((prev) => ({
      ...prev,
      slug: normalized,
      routes: {
        ...prev.routes,
        landing: landingPathFromSlug(normalized || prev.slug),
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        landingEnabled: settings.landingEnabled,
        slug: settings.slug,
        routes: { ...settings.routes },
        ...(settings.content ? { content: settings.content } : {}),
        ...(settings.theme ? { theme: settings.theme } : {}),
      };
      const saved = await patchTenantStorefront(payload);
      setSettings(resolveStorefrontSettings(tenant, { config: { storefront: saved } }));
      showSuccess('Storefront settings saved');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const updateRoute = (key: keyof TenantStorefrontSettings['routes'], value: string) => {
    setSettings((prev) => ({
      ...prev,
      routes: { ...prev.routes, [key]: value },
    }));
  };

  return (
    <SettingsShell
      tenant={tenant}
      activeSection="storefront"
      title="Storefront"
      subtitle="Trainer & mentor landing page for public visitors"
    >
      <div className="ios-card p-6 space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-primary">Public landing page</h2>
          <p className="text-secondary text-sm mt-1">
            When enabled, signed-out visitors at{' '}
            <code className="text-xs">{settings.routes.landing || '/store/mentors'}</code> see the trainer/mentor
            marketplace landing. The home page (<code className="text-xs">/</code>) stays the simple welcome screen.
          </p>
          {isLuxgenDefaultTenant && (
            <p className="text-xs text-secondary mt-2">
              This workspace ({tenant}) is a LuxGen demo tenant — landing defaults to on until you change it here.
            </p>
          )}
        </div>

        {loading ? (
          <p className="text-secondary text-sm">Loading…</p>
        ) : (
          <>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 rounded"
                checked={settings.landingEnabled}
                onChange={(e) => setSettings((prev) => ({ ...prev, landingEnabled: e.target.checked }))}
              />
              <span className="text-sm font-medium text-primary">
                Enable trainer/mentor landing ({settings.routes.landing || '/store/mentors'})
              </span>
            </label>

            <div className="border-t border-separator pt-4 space-y-3">
              <h3 className="text-sm font-semibold text-primary">Landing URL &amp; content</h3>
              <p className="text-xs text-secondary">
                Slug sets the default path (<code>/store/&#123;slug&#125;</code>). Use <code>{'{{tenantName}}'}</code>{' '}
                in copy for the workspace name.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="ios-form-group">
                  <label htmlFor="storefront-slug">Landing slug</label>
                  <input
                    id="storefront-slug"
                    className="ios-input"
                    value={settings.slug}
                    onChange={(e) => updateSlug(e.target.value)}
                    placeholder="mentors"
                  />
                </div>
                <div className="ios-form-group">
                  <label htmlFor="theme-accent">Accent color</label>
                  <input
                    id="theme-accent"
                    className="ios-input"
                    value={accentColor}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        theme: { ...prev.theme, accentColor: e.target.value },
                      }))
                    }
                    placeholder="#28b485"
                  />
                </div>
                <div className="ios-form-group sm:col-span-2">
                  <label htmlFor="hero-headline">Hero headline</label>
                  <input
                    id="hero-headline"
                    className="ios-input"
                    value={heroHeadline}
                    onChange={(e) => updateHero('headline', e.target.value)}
                  />
                </div>
                <div className="ios-form-group sm:col-span-2">
                  <label htmlFor="hero-subheadline">Hero subheadline</label>
                  <textarea
                    id="hero-subheadline"
                    className="ios-input min-h-[5rem]"
                    value={heroSubheadline}
                    onChange={(e) => updateHero('subheadline', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-separator pt-4 space-y-3">
              <h3 className="text-sm font-semibold text-primary">Navigation routes</h3>
              <p className="text-xs text-secondary">Paths used by landing CTAs and footer links.</p>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="ios-form-group sm:col-span-2">
                  <label htmlFor="route-landing">Landing page URL</label>
                  <input
                    id="route-landing"
                    className="ios-input"
                    value={settings.routes.landing}
                    onChange={(e) => updateRoute('landing', e.target.value)}
                    placeholder="/store/mentors"
                  />
                </div>
                <div className="ios-form-group">
                  <label htmlFor="route-courses">Course catalog</label>
                  <input
                    id="route-courses"
                    className="ios-input"
                    value={settings.routes.courses}
                    onChange={(e) => updateRoute('courses', e.target.value)}
                    placeholder="/learn"
                  />
                </div>
                <div className="ios-form-group">
                  <label htmlFor="route-programs">Programs store</label>
                  <input
                    id="route-programs"
                    className="ios-input"
                    value={settings.routes.programs}
                    onChange={(e) => updateRoute('programs', e.target.value)}
                    placeholder="/store/product"
                  />
                </div>
                <div className="ios-form-group">
                  <label htmlFor="route-login">Login</label>
                  <input
                    id="route-login"
                    className="ios-input"
                    value={settings.routes.login}
                    onChange={(e) => updateRoute('login', e.target.value)}
                    placeholder="/login"
                  />
                </div>
                <div className="ios-form-group">
                  <label htmlFor="route-register">Sign up / Get started</label>
                  <input
                    id="route-register"
                    className="ios-input"
                    value={settings.routes.register}
                    onChange={(e) => updateRoute('register', e.target.value)}
                    placeholder="/register"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button type="button" className="ios-btn-primary" disabled={saving} onClick={() => void handleSave()}>
                {saving ? 'Saving…' : 'Save settings'}
              </button>
              {settings.landingEnabled && (
                <Link
                  href={settings.routes.landing || '/store/mentors'}
                  className="ios-btn-secondary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Preview landing ↗
                </Link>
              )}
              <button type="button" className="ios-btn-plain" onClick={() => void router.push('/learn')}>
                Open catalog
              </button>
            </div>
          </>
        )}
      </div>
    </SettingsShell>
  );
}

export default function SettingsStorefrontPage(props: Props) {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={3}>
      <StorefrontSettingsContent {...props} />
    </SnackbarProvider>
  );
}

export const getServerSideProps = getTenantPageProps;
