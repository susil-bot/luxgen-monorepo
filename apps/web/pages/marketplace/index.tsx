import { useMemo, useState } from 'react';
import { useAppShellConfig } from '../../lib/app-shell-config';
import { useLayoutUser } from '../../lib/app-layout-user';
import Head from 'next/head';
import Link from 'next/link';
import { useQuery, useMutation } from '@apollo/client';
import { AppLayout } from '@luxgen/ui';
import {
  GET_AUTOMATION_TEMPLATES,
  INSTALL_AUTOMATION_TEMPLATE,
  GET_FUNNEL_TEMPLATES,
  INSTALL_FUNNEL_TEMPLATE,
} from '../../graphql/queries/marketplace';

interface Props {
  tenant: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  ONBOARDING: 'Onboarding',
  COMPLETION: 'Completion',
  ENGAGEMENT: 'Engagement',
  RETENTION: 'Retention',
  AGENT_OPS: 'Agent ops',
  INTEGRATIONS: 'Integrations',
};

export default function MarketplacePage({ tenant }: Props) {
  const layoutUser = useLayoutUser();
  const { sidebarSections, logo } = useAppShellConfig();
  const [installing, setInstalling] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'automations' | 'funnels'>('automations');
  const [expandedFunnel, setExpandedFunnel] = useState<string | null>(null);
  const [installingFunnel, setInstallingFunnel] = useState<string | null>(null);

  const { data: funnelData, refetch: refetchFunnels } = useQuery(GET_FUNNEL_TEMPLATES, {
    skip: activeTab !== 'funnels',
    errorPolicy: 'ignore',
  });
  const [installFunnelTemplate] = useMutation(INSTALL_FUNNEL_TEMPLATE);
  const funnelTemplates = funnelData?.funnelTemplates ?? [];

  const handleInstallFunnel = async (slug: string) => {
    setInstallingFunnel(slug);
    try {
      await installFunnelTemplate({ variables: { tenantId: tenant, slug } });
      await refetchFunnels();
      window.location.href = `/settings/vocabulary?tenant=${encodeURIComponent(tenant)}&funnelInstalled=${slug}`;
    } catch (e) {
      console.error(e);
      alert('Funnel install failed — check your plan includes automations.');
    } finally {
      setInstallingFunnel(null);
    }
  };


  const { data, refetch } = useQuery(GET_AUTOMATION_TEMPLATES, {
    errorPolicy: 'ignore',
  });

  const [installTemplate] = useMutation(INSTALL_AUTOMATION_TEMPLATE);

  const templates = data?.automationTemplates ?? [];

  // T-MAP-04 (Marketplace Browse gaps): search + category filter over templates already on the
  // wire. Item-detail pages, a separate "installed items" list (installs become live Automations
  // immediately — see /automations), seller/publish flow, and reviews all need new backend models
  // and are deferred — see docs/todo-orchestrator/audits/sitemap-gaps.md.
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('ALL');
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const filteredTemplates = useMemo(() => {
    const q = search.trim().toLowerCase();
    return templates.filter((t: { name: string; description: string; category: string; featured: boolean }) => {
      if (category !== 'ALL' && t.category !== category) return false;
      if (featuredOnly && !t.featured) return false;
      if (!q) return true;
      return t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
    });
  }, [templates, search, category, featuredOnly]);

  const handleInstall = async (slug: string, name: string) => {
    setInstalling(slug);
    try {
      await installTemplate({
        variables: { tenantId: tenant, slug, nameOverride: name },
      });
      await refetch();
      window.location.href = `/automations?tenant=${encodeURIComponent(tenant)}&installed=${slug}`;
    } catch (e) {
      console.error(e);
      alert('Install failed — check your plan includes automations and automation count limits.');
    } finally {
      setInstalling(null);
    }
  };

  return (
    <>
      <Head>
        <title>Automation Marketplace — {tenant}</title>
      </Head>
      <AppLayout responsive sidebarSections={sidebarSections} user={layoutUser ?? undefined} logo={logo}>
        <div className="max-w-5xl mx-auto px-4 py-8">
          <header className="mb-8">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              Automation marketplace
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Install proven workflows in one click. Templates install as paused automations you can customize.
            </p>
            <Link
              href={`/automations?tenant=${encodeURIComponent(tenant)}`}
              className="text-sm mt-2 inline-block"
              style={{ color: 'var(--color-accent)' }}
            >
              ← Back to automations
            </Link>
          </header>

          <div className="flex gap-2 mb-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <button
              type="button"
              onClick={() => setActiveTab('automations')}
              className="px-4 py-2 text-sm font-medium -mb-px border-b-2"
              style={{
                borderColor: activeTab === 'automations' ? 'var(--color-accent)' : 'transparent',
                color: activeTab === 'automations' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              }}
            >
              Automation templates
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('funnels')}
              className="px-4 py-2 text-sm font-medium -mb-px border-b-2"
              style={{
                borderColor: activeTab === 'funnels' ? 'var(--color-accent)' : 'transparent',
                color: activeTab === 'funnels' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              }}
            >
              Funnel templates
            </button>
          </div>

          {activeTab === 'funnels' ? (
            <div className="grid gap-4 md:grid-cols-2">
              {funnelTemplates.length === 0 ? (
                <p className="text-sm md:col-span-2" style={{ color: 'var(--color-text-secondary)' }}>
                  No funnel templates available yet.
                </p>
              ) : (
                funnelTemplates.map(
                  (ft: {
                    id: string;
                    slug: string;
                    name: string;
                    description: string;
                    industry: string[];
                    funnelStages: { stage: string; description: string }[];
                    installCount: number;
                  }) => {
                    const expanded = expandedFunnel === ft.slug;
                    return (
                      <article
                        key={ft.id}
                        className="rounded-xl border p-5 flex flex-col"
                        style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h2 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                            {ft.name}
                          </h2>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full shrink-0 capitalize"
                            style={{ background: 'var(--color-bg-tertiary)' }}
                          >
                            {ft.industry[0]?.replace(/-/g, ' ')}
                          </span>
                        </div>
                        <p className="text-sm flex-1 mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                          {ft.description}
                        </p>
                        <button
                          type="button"
                          onClick={() => setExpandedFunnel(expanded ? null : ft.slug)}
                          className="text-sm mb-3 text-left"
                          style={{ color: 'var(--color-accent)' }}
                        >
                          {expanded ? 'Hide stages ▲' : `View ${ft.funnelStages.length} stages ▼`}
                        </button>
                        {expanded && (
                          <ol className="text-xs space-y-2 mb-4 border-l pl-3" style={{ borderColor: 'var(--color-border)' }}>
                            {ft.funnelStages.map((stage) => (
                              <li key={stage.stage}>
                                <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                  {stage.stage}
                                </span>
                                <p style={{ color: 'var(--color-text-secondary)' }}>{stage.description}</p>
                              </li>
                            ))}
                          </ol>
                        )}
                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                            {ft.installCount.toLocaleString()} installs
                          </span>
                          <button
                            type="button"
                            disabled={installingFunnel === ft.slug}
                            onClick={() => handleInstallFunnel(ft.slug)}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
                            style={{ background: 'var(--color-accent)' }}
                          >
                            {installingFunnel === ft.slug ? 'Installing…' : 'Install funnel'}
                          </button>
                        </div>
                      </article>
                    );
                  },
                )
              )}
            </div>
          ) : (
          <>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates…"
              aria-label="Search marketplace templates"
              className="input-field text-sm flex-1 min-w-[200px]"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Filter by category"
              className="input-field text-sm"
            >
              <option value="ALL">All categories</option>
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <input type="checkbox" checked={featuredOnly} onChange={(e) => setFeaturedOnly(e.target.checked)} />
              Featured only
            </label>
          </div>

          {filteredTemplates.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              No templates match your filters.
            </p>
          ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredTemplates.map(
              (t: {
                id: string;
                slug: string;
                name: string;
                description: string;
                category: string;
                priceLabel: string;
                featured: boolean;
                triggerLabel: string;
                installCount: number;
                tags: string[];
              }) => (
                <article
                  key={t.id}
                  className="rounded-xl border p-5 flex flex-col"
                  style={{
                    background: 'var(--color-bg-secondary)',
                    borderColor: t.featured ? 'var(--color-accent)' : 'var(--color-border)',
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h2 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      {t.name}
                    </h2>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full shrink-0"
                      style={{ background: 'var(--color-bg-tertiary)' }}
                    >
                      {t.priceLabel}
                    </span>
                  </div>
                  <p className="text-xs mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                    {CATEGORY_LABELS[t.category] ?? t.category} · Trigger: {t.triggerLabel}
                  </p>
                  <p className="text-sm flex-1 mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                    {t.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                      {t.installCount.toLocaleString()} installs
                    </span>
                    <button
                      type="button"
                      disabled={installing === t.slug}
                      onClick={() => handleInstall(t.slug, t.name)}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
                      style={{ background: 'var(--color-accent)' }}
                    >
                      {installing === t.slug ? 'Installing…' : 'Install'}
                    </button>
                  </div>
                </article>
              ),
            )}
          </div>
          )}
          </>
          )}
        </div>
      </AppLayout>
    </>
  );
}

export const getServerSideProps = async (ctx: { query: { tenant?: string } }) => ({
  props: { tenant: ctx.query.tenant || 'demo' },
});
