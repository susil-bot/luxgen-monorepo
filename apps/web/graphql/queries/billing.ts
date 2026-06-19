import { gql } from '@apollo/client';

export const GET_TENANT_BILLING = gql`
  query GetTenantBilling($tenantId: String!) {
    tenantBilling(tenantId: $tenantId) {
      tenantId
      plan
      planName
      priceMonthly
      subscriptionStatus
      stripeConfigured
      currentPeriodEnd
      cancelAtPeriodEnd
      limits {
        maxLearners
        maxAutomations
        maxAutomationRunsPerMonth
      }
      features
      featureFlags {
        automations
        analytics
        webhooks
        customDomain
        agentStudio
        mobileApp
        apiAccess
      }
    }
  }
`;

export const GET_PRICING_PLANS = gql`
  query GetPricingPlans {
    pricingPlans {
      id
      name
      priceMonthly
      description
      features
      limits {
        maxLearners
        maxAutomations
        maxAutomationRunsPerMonth
      }
    }
  }
`;

export const CREATE_CHECKOUT_SESSION = gql`
  mutation CreateCheckoutSession($tenantId: String!, $plan: PlanTier!, $successUrl: String!, $cancelUrl: String!) {
    createCheckoutSession(tenantId: $tenantId, plan: $plan, successUrl: $successUrl, cancelUrl: $cancelUrl) {
      url
      sessionId
    }
  }
`;

export const CREATE_BILLING_PORTAL = gql`
  mutation CreateBillingPortalSession($tenantId: String!, $returnUrl: String!) {
    createBillingPortalSession(tenantId: $tenantId, returnUrl: $returnUrl) {
      url
    }
  }
`;

export const SET_TENANT_PLAN_DEV = gql`
  mutation SetTenantPlanDev($tenantId: String!, $plan: PlanTier!) {
    setTenantPlanDev(tenantId: $tenantId, plan: $plan) {
      plan
      planName
      featureFlags {
        automations
        agentStudio
      }
    }
  }
`;
