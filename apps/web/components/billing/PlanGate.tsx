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
    project: 'Project',
    webhooks: 'Webhooks',
    customDomain: 'Custom domain',
    agentStudio: 'Agent Studio',
    mobileApp: 'Mobile learner app',
    apiAccess: 'API access',
  };

  const allowed = planRank(currentPlan) >= planRank(required);

  if (allowed) return <>{children}</>;

  return (
    <div
      className="rounded-xl border p-6 text-center ios-card"
      style={{
        borderColor: 'var(--color-separator)',
      }}
    >
      <div className="text-3xl mb-3">🔒</div>
      <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-label-primary)' }}>
        {featureLabels[feature]} requires {requiredDef.name}
      </h3>
      <p className="text-sm mb-4" style={{ color: 'var(--color-label-secondary)' }}>
        Your workspace is on the <strong>{getPlanDefinition(currentPlan).name}</strong> plan. Upgrade to{' '}
        {requiredDef.name} (${requiredDef.priceMonthly}/mo) to unlock this feature.
      </p>
      <Link href={`/billing?tenant=${encodeURIComponent(tenant)}`} className="ios-btn-primary inline-block">
        View plans & upgrade
      </Link>
    </div>
  );
}
