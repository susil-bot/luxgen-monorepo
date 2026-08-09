import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useQuery } from '@apollo/client';
import { AppLayout } from '@luxgen/ui';
import { UserRole } from '@luxgen/auth';
import { useAppShellConfig } from '../../lib/app-shell-config';
import { useLayoutUser } from '../../lib/app-layout-user';
import { getStoredUser } from '../../lib/session';
import { getTenantPageProps } from '../../lib/tenant-page-props';
import { GET_TENANTS, GET_TENANT_CAPABILITY_MAP } from '../../graphql/queries/tenants';

interface Props {
  tenant: string;
}

/**
 * T-VERT-11 — super-admin-only, read-only view of what's actually turned on for a tenant and
 * why. See docs/PLATFORM_VERTICALIZATION_STRATEGY.md §6. The nav item is already hidden for
 * non-SUPER_ADMIN users (packages/ui/src/Layout/DefaultNavigation.tsx + the 'tenant-map' case
 * in use-sidebar-sections.ts's filterItem()) -- this page-level check is defense in depth for
 * anyone who navigates here directly by URL.
 */
export default function TenantCapabilityMapPage({ tenant }: Props) {
  const layoutUser = useLayoutUser();
  const { sidebarSections, logo } = useAppShellConfig();
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);
  const [selectedTenantId, setSelectedTenantId] = useState('');

  useEffect(() => {
    const session = getStoredUser();
    setIsSuperAdmin(session?.role === UserRole.SUPER_ADMIN);
  }, []);

  const { data: tenantsData } = useQuery(GET_TENANTS, {
    skip: !isSuperAdmin,
    fetchPolicy: 'cache-first',
  });
  const tenants: { id: string; name: string; subdomain: string }[] = tenantsData?.tenants ?? [];

  const { data, loading, error } = useQuery(GET_TENANT_CAPABILITY_MAP, {
    variables: { tenantId: selectedTenantId },
    skip: !isSuperAdmin || !selectedTenantId,
    fetchPolicy: 'network-only', // acceptance: reflects a flag/plan change within one refresh, no cache layer
  });
  const map = data?.tenantCapabilityMap;

  return (
    <>
      <Head>
        <title>Tenant Map — {tenant}</title>
      </Head>
      <AppLayout responsive sidebarSections={sidebarSections} user={layoutUser ?? undefined} logo={logo}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <header className="mb-6">
            <h1 className="ios-large-title">Tenant capability map</h1>
            <p className="mt-1 text-secondary text-sm">
              What&apos;s live for a tenant, and why — domains, plan, vocabulary, installed templates.
            </p>
          </header>

          {isSuperAdmin === false && (
            <div className="ios-card p-6">
              <p className="font-semibold text-primary">403 — Super admin access required</p>
              <p className="text-sm text-secondary mt-1">This page is only available to super admins.</p>
            </div>
          )}

          {isSuperAdmin && (
            <>
              <div className="ios-form-group mb-6 max-w-sm">
                <label htmlFor="tenant-picker">Tenant</label>
                <select
                  id="tenant-picker"
                  className="ios-input"
                  value={selectedTenantId}
                  onChange={(e) => setSelectedTenantId(e.target.value)}
                >
                  <option value="">Select a tenant…</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.subdomain})
                    </option>
                  ))}
                </select>
              </div>

              {!selectedTenantId && (
                <p className="text-sm text-secondary">Pick a tenant above to see its capability map.</p>
              )}

              {loading && selectedTenantId && <p className="text-sm text-secondary">Loading…</p>}

              {error && (
                <p className="text-sm" style={{ color: 'var(--color-red)' }}>
                  {error.message}
                </p>
              )}

              {map && (
                <div className="space-y-6">
                  <div className="ios-card p-5 flex flex-wrap items-center gap-4">
                    <div>
                      <p className="font-semibold text-primary">
                        {map.tenantName} <span className="text-secondary font-normal">({map.subdomain})</span>
                      </p>
                      <p className="text-xs text-secondary mt-0.5">Tenant ID: {map.tenantId}</p>
                    </div>
                    <span className="badge badge-blue capitalize ml-auto">{map.plan} plan</span>
                    <span className="badge badge-gray">{map.installedAutomationCount} automations installed</span>
                    {map.likelyFunnelTemplate && (
                      <span className="badge badge-gray">Likely funnel: {map.likelyFunnelTemplate.name}</span>
                    )}
                  </div>

                  <div className="ios-card p-5">
                    <h2 className="font-semibold text-primary mb-3">Domains</h2>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-secondary text-xs uppercase tracking-wide">
                          <th className="pb-2 font-medium">Domain</th>
                          <th className="pb-2 font-medium">Status</th>
                          <th className="pb-2 font-medium">Why</th>
                        </tr>
                      </thead>
                      <tbody>
                        {map.domains.map((d: { domain: string; enabled: boolean; reason: string }) => (
                          <tr key={d.domain} className="border-t" style={{ borderColor: 'var(--color-border)' }}>
                            <td className="py-2 font-medium text-primary">{d.domain}</td>
                            <td className="py-2">
                              <span className={`badge ${d.enabled ? 'badge-blue' : 'badge-gray'}`}>
                                {d.enabled ? 'On' : 'Off'}
                              </span>
                            </td>
                            <td className="py-2 text-secondary">{d.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="ios-card p-5">
                    <h2 className="font-semibold text-primary mb-3">Vocabulary</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      {Object.entries(map.vocabulary)
                        .filter(([key]) => key !== '__typename')
                        .map(([term, label]) => (
                          <div key={term}>
                            <p className="text-xs text-secondary uppercase tracking-wide">{term}</p>
                            <p className="text-primary font-medium">{String(label)}</p>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="ios-card p-5">
                    <h2 className="font-semibold text-primary mb-3">
                      Tenant feature flags <span className="text-xs text-secondary font-normal">(settings.config.features — not yet wired to gating)</span>
                    </h2>
                    <pre className="text-xs text-secondary whitespace-pre-wrap">
                      {JSON.stringify(map.tenantFeatureFlags, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </AppLayout>
    </>
  );
}

export const getServerSideProps = getTenantPageProps;
