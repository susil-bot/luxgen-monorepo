import { useState } from 'react';
import Head from 'next/head';
import { useQuery, useMutation } from '@apollo/client';
import { AppLayout, getDefaultSidebarSections, getDefaultUser, getDefaultLogo } from '@luxgen/ui';
import {
  GET_TENANT_BILLING,
  GET_PRICING_PLANS,
  CREATE_CHECKOUT_SESSION,
  CREATE_BILLING_PORTAL,
  SET_TENANT_PLAN_DEV,
} from '../../graphql/queries/billing';
import { GET_TENANT_USAGE } from '../../graphql/queries/marketplace';
import { getWebUrl } from '../../lib/urls';
import { type PlanTier } from '@luxgen/billing';

interface Props {
  tenant: string;
}

export default function BillingPage({ tenant }: Props) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const appUrl = getWebUrl();

  const { data: billingData, refetch: refetchBilling } = useQuery(GET_TENANT_BILLING, {
    variables: { tenantId: tenant },
    errorPolicy: 'ignore',
  });

  const { data: plansData } = useQuery(GET_PRICING_PLANS, { errorPolicy: 'ignore' });

  const { data: usageData } = useQuery(GET_TENANT_USAGE, {
    variables: { tenantId: tenant },
    errorPolicy: 'ignore',
  });

  const usage = usageData?.tenantUsage;

  const [createCheckout] = useMutation(CREATE_CHECKOUT_SESSION);
  const [createPortal] = useMutation(CREATE_BILLING_PORTAL);
  const [setPlanDev] = useMutation(SET_TENANT_PLAN_DEV);

  const current = billingData?.tenantBilling;
  const plans = plansData?.pricingPlans ?? [];
  const isDev = process.env.NEXT_PUBLIC_APP_ENV === 'development';

  const handleUpgrade = async (planId: string) => {
    setLoadingPlan(planId);
    try {
      const { data } = await createCheckout({
        variables: {
          tenantId: tenant,
          plan: planId,
          successUrl: `${appUrl}/billing?tenant=${tenant}&upgraded=1`,
          cancelUrl: `${appUrl}/billing?tenant=${tenant}`,
        },
      });
      if (data?.createCheckoutSession?.url) {
        window.location.href = data.createCheckoutSession.url;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPlan(null);
    }
  };

  const handlePortal = async () => {
    try {
      const { data } = await createPortal({
        variables: {
          tenantId: tenant,
          returnUrl: `${appUrl}/billing?tenant=${tenant}`,
        },
      });
      if (data?.createBillingPortalSession?.url) {
        window.location.href = data.createBillingPortalSession.url;
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDevPlan = async (plan: PlanTier) => {
    await setPlanDev({
      variables: { tenantId: tenant, plan: plan.toUpperCase() },
    });
    await refetchBilling();
  };

  return (
    <>
      <Head>
        <title>Billing — {tenant}</title>
      </Head>
      <AppLayout sidebarSections={getDefaultSidebarSections()} user={getDefaultUser()} logo={getDefaultLogo()}>
        <div className="max-w-5xl mx-auto px-4 py-8">
          <header className="mb-8">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              Billing & plans
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Manage your LuxGen subscription for <strong>{tenant}</strong>
            </p>
          </header>

          {usage && (
            <section
              className="rounded-xl border p-5 mb-8"
              style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}
            >
              <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                Usage this month ({usage.period})
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  {
                    label: 'Automation runs',
                    used: usage.automationRuns,
                    limit: usage.limits.maxAutomationRunsPerMonth,
                    pct: usage.percentUsed.automationRuns,
                  },
                  {
                    label: 'Active learners',
                    used: usage.activeLearners,
                    limit: usage.limits.maxLearners,
                    pct: usage.percentUsed.activeLearners,
                  },
                  {
                    label: 'Automations',
                    used: usage.automationCount,
                    limit: usage.limits.maxAutomations,
                    pct: usage.limits.maxAutomations
                      ? Math.round((usage.automationCount / usage.limits.maxAutomations) * 100)
                      : 0,
                  },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                      <span>{row.label}</span>
                      <span>
                        {row.used.toLocaleString()} / {row.limit.toLocaleString()}
                      </span>
                    </div>
                    <div
                      className="h-2 rounded-full overflow-hidden"
                      style={{ background: 'var(--color-bg-tertiary)' }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, row.pct)}%`,
                          background: row.pct >= 90 ? 'var(--color-red, #ef4444)' : 'var(--color-accent)',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {current && (
            <section
              className="rounded-xl border p-5 mb-8 flex flex-wrap items-center justify-between gap-4"
              style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}
            >
              <div>
                <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--color-text-tertiary)' }}>
                  Current plan
                </p>
                <p className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {current.planName}{' '}
                  <span className="text-sm font-normal" style={{ color: 'var(--color-text-secondary)' }}>
                    ({current.subscriptionStatus})
                  </span>
                </p>
                {current.priceMonthly > 0 && (
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    ${current.priceMonthly}/month
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {current.stripeConfigured && current.plan !== 'FREE' && (
                  <button
                    type="button"
                    onClick={handlePortal}
                    className="px-4 py-2 rounded-lg text-sm border"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  >
                    Manage subscription
                  </button>
                )}
              </div>
            </section>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {plans.map(
              (plan: { id: string; name: string; priceMonthly: number; description: string; features: string[] }) => {
                const isCurrent = current?.plan === plan.id;
                return (
                  <article
                    key={plan.id}
                    className="rounded-xl border p-5 flex flex-col"
                    style={{
                      background: 'var(--color-bg-secondary)',
                      borderColor: isCurrent ? 'var(--color-accent)' : 'var(--color-border)',
                    }}
                  >
                    <h2 className="font-semibold text-lg" style={{ color: 'var(--color-text-primary)' }}>
                      {plan.name}
                    </h2>
                    <p className="text-2xl font-bold mt-1" style={{ color: 'var(--color-text-primary)' }}>
                      ${plan.priceMonthly}
                      <span className="text-sm font-normal" style={{ color: 'var(--color-text-secondary)' }}>
                        /mo
                      </span>
                    </p>
                    <p className="text-xs mt-2 mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                      {plan.description}
                    </p>
                    <ul className="text-xs space-y-1 mb-4 flex-1" style={{ color: 'var(--color-text-secondary)' }}>
                      {plan.features.map((f) => (
                        <li key={f}>✓ {f}</li>
                      ))}
                    </ul>
                    {isCurrent ? (
                      <span
                        className="text-center py-2 rounded-lg text-sm font-medium"
                        style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}
                      >
                        Current plan
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={loadingPlan === plan.id}
                        onClick={() => handleUpgrade(plan.id)}
                        className="py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
                        style={{ background: 'var(--color-accent)' }}
                      >
                        {loadingPlan === plan.id ? 'Redirecting…' : `Upgrade to ${plan.name}`}
                      </button>
                    )}
                  </article>
                );
              },
            )}
          </div>

          <section
            className="mt-8 rounded-xl border p-5"
            style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}
          >
            <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Enterprise
            </h3>
            <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
              Agent Studio, git pipeline, unlimited learners, and SLA. Contact sales for custom pricing.
            </p>
            {isDev && (
              <button
                type="button"
                onClick={() => handleDevPlan('enterprise')}
                className="text-sm px-3 py-1.5 rounded border"
                style={{ borderColor: 'var(--color-border)' }}
              >
                Dev: set Enterprise plan
              </button>
            )}
          </section>

          {isDev && (
            <section className="mt-6 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              <p className="mb-2">Dev plan overrides (BILLING_DEV_MODE):</p>
              <div className="flex flex-wrap gap-2">
                {(['free', 'starter', 'pro', 'business', 'enterprise'] as PlanTier[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleDevPlan(p)}
                    className="px-2 py-1 rounded border"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </AppLayout>
    </>
  );
}

export const getServerSideProps = async (ctx: { query: { tenant?: string } }) => ({
  props: { tenant: ctx.query.tenant || 'demo' },
});
