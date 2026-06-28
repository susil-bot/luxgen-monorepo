import Head from 'next/head';
import { useAppShellConfig } from '../../lib/app-shell-config';
import { useLayoutUser } from '../../lib/app-layout-user';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { AppLayout } from '@luxgen/ui';
import { PlanGate } from '../../components/billing/PlanGate';
import { GET_TENANT_BILLING } from '../../graphql/queries/billing';
import { normalizePlan } from '@luxgen/billing';

interface Props {
  tenant: string;
}

const ANALYTICS_LINKS = [
  {
    href: '/courses/analytics',
    title: 'Course analytics',
    description: 'Enrollments, completion rates, and top-performing courses.',
    emoji: '📚',
  },
  {
    href: '/groups/analytics',
    title: 'Group analytics',
    description: 'Member activity, engagement, and cohort progress.',
    emoji: '👥',
  },
];

export default function AnalyticsHubPage({ tenant }: Props) {
  const layoutUser = useLayoutUser();
  const { sidebarSections, logo } = useAppShellConfig();
  const {
    data: billingData,
    error: billingError,
    loading: billingLoading,
  } = useQuery(GET_TENANT_BILLING, {
    variables: { tenantId: tenant },
    errorPolicy: 'all',
  });

  const planRaw = billingData?.tenantBilling?.plan;
  const tenantPlan = planRaw ? normalizePlan(String(planRaw).toLowerCase()) : 'free';
  const planCheckFailed = !billingLoading && Boolean(billingError) && !billingData?.tenantBilling;

  return (
    <>
      <Head>
        <title>Analytics — {tenant}</title>
      </Head>
      <AppLayout responsive sidebarSections={sidebarSections} user={layoutUser ?? undefined} logo={logo}>
        {planCheckFailed ? (
          <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="ios-card p-6 text-center">
              <h1 className="text-lg font-semibold text-primary">Unable to verify plan</h1>
              <p className="text-sm text-secondary mt-2">We could not load billing details. Try again in a moment.</p>
            </div>
          </div>
        ) : (
          <PlanGate feature="analytics" currentPlan={tenantPlan} tenant={tenant}>
            <div className="max-w-3xl mx-auto px-4 py-8">
              <header className="mb-8">
                <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  Analytics
                </h1>
                <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Revenue intelligence and learner engagement for {tenant}
                </p>
              </header>

              <div className="grid gap-4">
                {ANALYTICS_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={`${link.href}?tenant=${encodeURIComponent(tenant)}`}
                    className="rounded-xl border p-5 block transition-opacity hover:opacity-90"
                    style={{
                      background: 'var(--color-bg-secondary)',
                      borderColor: 'var(--color-border)',
                      textDecoration: 'none',
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-2xl">{link.emoji}</span>
                      <div>
                        <h2 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                          {link.title}
                        </h2>
                        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                          {link.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </PlanGate>
        )}
      </AppLayout>
    </>
  );
}

export const getServerSideProps = async (ctx: { query: { tenant?: string } }) => ({
  props: { tenant: ctx.query.tenant || 'demo' },
});
