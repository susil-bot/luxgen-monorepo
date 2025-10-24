/**
 * Centralized Tenant Configuration Wrapper
 * 
 * This file provides a clean interface to the centralized tenant configurations
 * from the packages/db package, ensuring proper TypeScript types.
 */

import { TenantConfig, demo, ideaVibes, acmeCorp } from '../../../db/src/tenant-config';

// Export the centralized tenant configurations
export { demo, ideaVibes, acmeCorp, type TenantConfig };

// Tenant configurations map
export const tenantConfigs: Record<string, TenantConfig> = {
  'demo': demo,
  'ideavibes': ideaVibes,
  'idea-vibes': ideaVibes, // Keep both for compatibility
  'acme-corp': acmeCorp,
  'acmecorp': acmeCorp, // Add without hyphen for consistency
};

// Get tenant configuration
export const getTenantConfig = (tenantId: string): TenantConfig => {
  console.log('🔍 Getting centralized tenant config for:', tenantId);
  const config = tenantConfigs[tenantId] || tenantConfigs['demo'];
  console.log('📋 Loaded centralized config:', {
    id: config.id,
    name: config.name,
    primary: config.theme.colors.primary,
    logoText: config.branding.logo.text,
  });
  return config;
};
