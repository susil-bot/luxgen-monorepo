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
