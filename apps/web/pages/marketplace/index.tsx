import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useQuery, useMutation } from '@apollo/client';
import { AppLayout, getDefaultSidebarSections, getDefaultUser, getDefaultLogo } from '@luxgen/ui';
import { GET_AUTOMATION_TEMPLATES, INSTALL_AUTOMATION_TEMPLATE } from '../../graphql/queries/marketplace';

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
  const [installing, setInstalling] = useState<string | null>(null);

  const { data, refetch } = useQuery(GET_AUTOMATION_TEMPLATES, {
    errorPolicy: 'ignore',
  });

  const [installTemplate] = useMutation(INSTALL_AUTOMATION_TEMPLATE);

  const templates = data?.automationTemplates ?? [];

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
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <AppLayout sidebarSections={getDefaultSidebarSections()} user={getDefaultUser()} logo={getDefaultLogo()}>
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

            <div className="grid gap-4 md:grid-cols-2">
              {templates.map(
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
          </div>
        </AppLayout>
      </div>
    </>
  );
}

export const getServerSideProps = async (ctx: { query: { tenant?: string } }) => ({
  props: { tenant: ctx.query.tenant || 'demo' },
});
