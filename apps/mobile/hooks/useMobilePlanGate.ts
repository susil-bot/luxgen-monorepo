import { useQuery } from '@apollo/client';
import { FEATURE_MIN_PLAN, normalizePlan, planMeetsMinimum } from '@luxgen/billing';

import { GET_TENANT_BILLING } from '../graphql/queries';
import { useAuth } from './useAuth';

export function useMobilePlanGate() {
  const { user } = useAuth();
  const tenantId = user?.tenant.id;

  const { data, loading, error } = useQuery(GET_TENANT_BILLING, {
    skip: !tenantId,
    variables: { tenantId: tenantId ?? '' },
    fetchPolicy: 'cache-and-network',
  });

  const billing = data?.tenantBilling;
  const plan = normalizePlan(billing?.plan);
  const requiredPlan = FEATURE_MIN_PLAN.mobileApp;
  const allowedByPlan = planMeetsMinimum(plan, requiredPlan);
  const allowedByFlag = Boolean(billing?.featureFlags?.mobileApp);
  const allowed = allowedByPlan || allowedByFlag;

  return {
    loading: Boolean(tenantId) && loading,
    error,
    allowed: !tenantId ? false : allowed,
    plan,
    planName: billing?.planName ?? plan,
    requiredPlan,
  };
}
