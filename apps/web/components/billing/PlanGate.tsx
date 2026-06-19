import Link from 'next/link';
import type { BillingFeature, PlanTier } from '@luxgen/billing';
import { getRequiredPlan, getPlanDefinition } from '@luxgen/billing';

interface PlanGateProps {
  feature: BillingFeature;
  currentPlan: PlanTier;
  tenant: string;
  children: React.ReactNode;
}

export function PlanGate({ feature, currentPlan, tenant, children }: PlanGateProps) {
  const required = getRequiredPlan(feature);
  const requiredDef = getPlanDefinition(required);

  const featureLabels: Record<BillingFeature, string> = {
    automations: 'Automations',
    analytics: 'Analytics',
    webhooks: 'Webhooks',
    customDomain: 'Custom domain',
    agentStudio: 'Agent Studio',
    mobileApp: 'Mobile learner app',
    apiAccess: 'API access',
  };

  const planRank = (p: PlanTier) => ['free', 'starter', 'pro', 'business', 'enterprise'].indexOf(p);
  const allowed = planRank(currentPlan) >= planRank(required);

  if (allowed) return <>{children}</>;

  return (
    <div
      className="rounded-xl border p-6 text-center"
      style={{
        background: 'var(--color-bg-secondary)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="text-3xl mb-3">🔒</div>
      <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
        {featureLabels[feature]} requires {requiredDef.name}
      </h3>
      <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
        Your workspace is on the <strong>{getPlanDefinition(currentPlan).name}</strong> plan. Upgrade to{' '}
        {requiredDef.name} (${requiredDef.priceMonthly}/mo) to unlock this feature.
      </p>
      <Link
        href={`/billing?tenant=${encodeURIComponent(tenant)}`}
        className="inline-block px-5 py-2.5 rounded-lg font-medium text-white"
        style={{ background: 'var(--color-accent)' }}
      >
        View plans & upgrade
      </Link>
    </div>
  );
}
