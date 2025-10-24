/**
 * Centralized Tenant Configuration Export
 * 
 * This file exports all tenant configurations from the backend.
 * Each tenant has its own secure configuration folder.
 */

export { default as demo } from './demo';
export { default as ideaVibes } from './idea-vibes';
export { default as acmeCorp } from './acme-corp';

// Re-export types and utilities from default config
export type { 
  TenantConfig, 
  TenantTheme
} from './default';
export { 
  defaultTenantConfig, 
  mergeTenantConfig 
} from './default';
