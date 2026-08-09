import { gql } from '@apollo/client';

export const GET_AUTOMATION_TEMPLATES = gql`
  query GetAutomationTemplates($category: TemplateCategory, $featured: Boolean) {
    automationTemplates(category: $category, featured: $featured) {
      id
      slug
      name
      description
      category
      priceCents
      priceLabel
      featured
      triggerType
      triggerLabel
      actions {
        type
        label
      }
      installCount
      tags
    }
  }
`;

export const GET_TENANT_USAGE = gql`
  query GetTenantUsage($tenantId: String!) {
    tenantUsage(tenantId: $tenantId) {
      tenantId
      period
      plan
      automationRuns
      activeLearners
      agentTasks
      automationCount
      limits {
        maxLearners
        maxAutomations
        maxAutomationRunsPerMonth
      }
      percentUsed {
        automationRuns
        activeLearners
      }
      withinLimits {
        automationRuns
        activeLearners
        automations
      }
    }
  }
`;

export const INSTALL_AUTOMATION_TEMPLATE = gql`
  mutation InstallAutomationTemplate($tenantId: String!, $slug: String!, $nameOverride: String) {
    installAutomationTemplate(tenantId: $tenantId, slug: $slug, nameOverride: $nameOverride) {
      id
      name
      enabled
      triggerType
      triggerLabel
    }
  }
`;

// T-VERT-09 — Funnel Templates (vocabulary + feature flags + automations bundle),
// see docs/PLATFORM_VERTICALIZATION_STRATEGY.md §4.
export const GET_FUNNEL_TEMPLATES = gql`
  query GetFunnelTemplates($industry: String) {
    funnelTemplates(industry: $industry) {
      id
      slug
      name
      description
      industry
      vocabularyPreset
      enabledModules
      automationTemplateSlugs
      funnelStages {
        stage
        description
      }
      installCount
    }
  }
`;

export const INSTALL_FUNNEL_TEMPLATE = gql`
  mutation InstallFunnelTemplate($tenantId: ID!, $slug: String!) {
    installFunnelTemplate(tenantId: $tenantId, slug: $slug) {
      id
      slug
      name
      installCount
    }
  }
`;
