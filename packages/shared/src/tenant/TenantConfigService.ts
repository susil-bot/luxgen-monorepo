/**
 * Centralized Tenant Configuration Service
 * 
 * This service provides a sustainable approach to tenant management by:
 * 1. Centralizing all tenant configurations in workflow objects
 * 2. Providing type-safe access to tenant properties
 * 3. Enabling dynamic configuration updates
 * 4. Supporting tenant-specific feature flags and limits
 * 5. Maintaining tenant isolation while sharing infrastructure
 */

import { TenantWorkflow, TenantWorkflowManager, TenantWorkflowUtils } from './TenantWorkflow';

export interface TenantConfigServiceOptions {
  cacheEnabled: boolean;
  cacheTTL: number; // seconds
  autoSync: boolean;
  syncInterval: number; // seconds
}

export class TenantConfigService {
  private static instance: TenantConfigService;
  private workflowManager: TenantWorkflowManager;
  private cache: Map<string, TenantWorkflow> = new Map();
  private options: TenantConfigServiceOptions;
  private syncInterval?: NodeJS.Timeout;
  
  private constructor(options: TenantConfigServiceOptions = {
    cacheEnabled: true,
    cacheTTL: 300, // 5 minutes
    autoSync: true,
    syncInterval: 60 // 1 minute
  }) {
    this.workflowManager = TenantWorkflowManager.getInstance();
    this.options = options;
    
    if (this.options.autoSync) {
      this.startAutoSync();
    }
  }
  
  public static getInstance(options?: TenantConfigServiceOptions): TenantConfigService {
    if (!TenantConfigService.instance) {
      TenantConfigService.instance = new TenantConfigService(options);
    }
    return TenantConfigService.instance;
  }
  
  /**
   * Get tenant configuration
   */
  public async getTenantConfig(tenantId: string): Promise<TenantWorkflow | null> {
    // Check cache first
    if (this.options.cacheEnabled && this.cache.has(tenantId)) {
      const cached = this.cache.get(tenantId)!;
      if (this.isCacheValid(cached)) {
        return cached;
      }
    }
    
    // Get from workflow manager
    const workflow = this.workflowManager.getWorkflow(tenantId);
    if (!workflow) {
      return null;
    }
    
    // Cache the result
    if (this.options.cacheEnabled) {
      this.cache.set(tenantId, workflow);
    }
    
    return workflow;
  }
  
  /**
   * Get tenant branding configuration
   */
  public async getTenantBranding(tenantId: string): Promise<TenantWorkflow['branding'] | null> {
    const workflow = await this.getTenantConfig(tenantId);
    return workflow?.branding || null;
  }
  
  /**
   * Get tenant security configuration
   */
  public async getTenantSecurity(tenantId: string): Promise<TenantWorkflow['security'] | null> {
    const workflow = await this.getTenantConfig(tenantId);
    return workflow?.security || null;
  }
  
  /**
   * Get tenant features
   */
  public async getTenantFeatures(tenantId: string): Promise<TenantWorkflow['features'] | null> {
    const workflow = await this.getTenantConfig(tenantId);
    return workflow?.features || null;
  }
  
  /**
   * Get tenant limits
   */
  public async getTenantLimits(tenantId: string): Promise<TenantWorkflow['limits'] | null> {
    const workflow = await this.getTenantConfig(tenantId);
    return workflow?.limits || null;
  }
  
  /**
   * Check if a feature is enabled for a tenant
   */
  public async isFeatureEnabled(tenantId: string, featurePath: string): Promise<boolean> {
    const features = await this.getTenantFeatures(tenantId);
    if (!features) return false;
    
    const pathParts = featurePath.split('.');
    let current: any = features;
    
    for (const part of pathParts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return false;
      }
    }
    
    return Boolean(current);
  }
  
  /**
   * Check if tenant has reached a limit
   */
  public async isLimitReached(tenantId: string, limitType: keyof TenantWorkflow['limits']): Promise<boolean> {
    const limits = await this.getTenantLimits(tenantId);
    if (!limits) return false;
    
    const limit = limits[limitType];
    if (!limit) return false;
    
    return limit.current >= limit.max;
  }
  
  /**
   * Get tenant usage statistics
   */
  public async getTenantUsage(tenantId: string): Promise<Record<string, { current: number; max: number; percentage: number }> | null> {
    const limits = await this.getTenantLimits(tenantId);
    if (!limits) return null;
    
    const usage: Record<string, { current: number; max: number; percentage: number }> = {};
    
    for (const [key, limit] of Object.entries(limits)) {
      if (limit && typeof limit === 'object' && 'current' in limit && 'max' in limit) {
        usage[key] = {
          current: limit.current,
          max: limit.max,
          percentage: Math.round((limit.current / limit.max) * 100)
        };
      }
    }
    
    return usage;
  }
  
  /**
   * Update tenant configuration
   */
  public async updateTenantConfig(tenantId: string, updates: Partial<TenantWorkflow>): Promise<boolean> {
    const success = this.workflowManager.updateWorkflow(tenantId, updates);
    
    if (success && this.options.cacheEnabled) {
      // Update cache
      const updatedWorkflow = this.workflowManager.getWorkflow(tenantId);
      if (updatedWorkflow) {
        this.cache.set(tenantId, updatedWorkflow);
      }
    }
    
    return success;
  }
  
  /**
   * Create new tenant from template
   */
  public async createTenantFromTemplate(
    tenantId: string,
    template: 'demo' | 'idea-vibes' | 'enterprise' | 'startup',
    overrides: Partial<TenantWorkflow> = {}
  ): Promise<TenantWorkflow> {
    const workflow = TenantWorkflowUtils.createFromTemplate(tenantId, template, overrides);
    
    // Register the workflow
    this.workflowManager.registerWorkflow(tenantId, workflow);
    
    // Cache the workflow
    if (this.options.cacheEnabled) {
      this.cache.set(tenantId, workflow);
    }
    
    return workflow;
  }
  
  /**
   * Validate tenant configuration
   */
  public async validateTenantConfig(tenantId: string): Promise<{ valid: boolean; errors: string[] }> {
    const workflow = await this.getTenantConfig(tenantId);
    if (!workflow) {
      return { valid: false, errors: ['Tenant not found'] };
    }
    
    return this.workflowManager.validateWorkflow(workflow);
  }
  
  /**
   * Get all tenant configurations
   */
  public async getAllTenantConfigs(): Promise<Map<string, TenantWorkflow>> {
    return this.workflowManager.getAllWorkflows();
  }
  
  /**
   * Remove tenant configuration
   */
  public async removeTenantConfig(tenantId: string): Promise<boolean> {
    const success = this.workflowManager.removeWorkflow(tenantId);
    
    if (success && this.options.cacheEnabled) {
      this.cache.delete(tenantId);
    }
    
    return success;
  }
  
  /**
   * Clear cache
   */
  public clearCache(): void {
    this.cache.clear();
  }
  
  /**
   * Get cache statistics
   */
  public getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
  
  /**
   * Start auto-sync
   */
  private startAutoSync(): void {
    this.syncInterval = setInterval(() => {
      this.syncAllConfigs();
    }, this.options.syncInterval * 1000);
  }
  
  /**
   * Stop auto-sync
   */
  public stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = undefined;
    }
  }
  
  /**
   * Sync all configurations
   */
  private async syncAllConfigs(): Promise<void> {
    try {
      // This would typically sync with a database or external service
      // For now, we'll just refresh the cache
      this.cache.clear();
    } catch (error) {
      console.error('Failed to sync tenant configurations:', error);
    }
  }
  
  /**
   * Check if cache is valid
   */
  private isCacheValid(workflow: TenantWorkflow): boolean {
    if (!this.options.cacheEnabled) return false;
    
    const now = Date.now();
    const cacheTime = (workflow as any).__cacheTime || 0;
    const ttl = this.options.cacheTTL * 1000;
    
    return (now - cacheTime) < ttl;
  }
  
  /**
   * Set cache timestamp
   */
  private setCacheTimestamp(workflow: TenantWorkflow): void {
    (workflow as any).__cacheTime = Date.now();
  }
}

/**
 * Global tenant configuration service instance
 */
export const tenantConfigService = TenantConfigService.getInstance();

/**
 * Utility functions for tenant configuration
 */
export class TenantConfigUtils {
  /**
   * Get tenant subdomain from hostname
   */
  public static extractSubdomain(hostname: string): string | null {
    const cleanHostname = hostname.split(':')[0];
    const parts = cleanHostname.split('.');
    
    // For localhost development
    if (cleanHostname.includes('localhost') || cleanHostname.includes('127.0.0.1')) {
      if (parts.length >= 2 && parts[0] !== 'www') {
        return parts[0];
      }
      return null;
    }
    
    // For production domains
    if (parts.length >= 3) {
      return parts[0];
    }
    
    return null;
  }
  
  /**
   * Get tenant ID from request
   */
  public static getTenantIdFromRequest(req: any): string | null {
    // Try subdomain first
    const hostname = req.get('host') || req.hostname;
    const subdomain = this.extractSubdomain(hostname);
    
    if (subdomain) {
      return subdomain;
    }
    
    // Try custom domain
    const customDomain = req.get('host') || req.hostname;
    if (customDomain && !customDomain.includes('localhost')) {
      return customDomain;
    }
    
    // Try header
    const tenantHeader = req.get('X-Tenant-ID');
    if (tenantHeader) {
      return tenantHeader;
    }
    
    return null;
  }
  
  /**
   * Generate tenant-specific CSS
   */
  public static generateTenantCSS(branding: TenantWorkflow['branding']): string {
    const { colors, typography, spacing, borderRadius, shadows } = branding;
    
    return `
      :root {
        --tenant-primary-color: ${colors.primary};
        --tenant-secondary-color: ${colors.secondary};
        --tenant-accent-color: ${colors.accent};
        --tenant-success-color: ${colors.success};
        --tenant-warning-color: ${colors.warning};
        --tenant-error-color: ${colors.error};
        --tenant-info-color: ${colors.info};
        --tenant-background-color: ${colors.background};
        --tenant-surface-color: ${colors.surface};
        --tenant-text-primary: ${colors.text.primary};
        --tenant-text-secondary: ${colors.text.secondary};
        --tenant-text-muted: ${colors.text.muted};
        
        --tenant-font-family: ${typography.fontFamily.primary};
        --tenant-font-family-secondary: ${typography.fontFamily.secondary};
        --tenant-font-family-mono: ${typography.fontFamily.mono};
      }
      
      body {
        font-family: var(--tenant-font-family);
        background-color: var(--tenant-background-color);
        color: var(--tenant-text-primary);
      }
      
      .tenant-button-primary {
        background-color: var(--tenant-primary-color);
        color: white;
        border-radius: ${borderRadius.md};
        padding: ${spacing.sm} ${spacing.md};
        font-weight: ${typography.fontWeight.medium};
        box-shadow: ${shadows.sm};
        transition: all 0.2s ease;
      }
      
      .tenant-button-primary:hover {
        box-shadow: ${shadows.md};
        transform: translateY(-1px);
      }
      
      .tenant-card {
        background-color: var(--tenant-surface-color);
        border-radius: ${borderRadius.lg};
        box-shadow: ${shadows.base};
        padding: ${spacing.lg};
        border: 1px solid #E5E7EB;
      }
      
      .tenant-input {
        border: 1px solid #D1D5DB;
        border-radius: ${borderRadius.md};
        padding: ${spacing.sm} ${spacing.md};
        font-family: var(--tenant-font-family);
        transition: border-color 0.2s ease;
      }
      
      .tenant-input:focus {
        border-color: var(--tenant-primary-color);
        box-shadow: 0 0 0 3px ${colors.primary}20;
        outline: none;
      }
      
      ${branding.customCSS || ''}
    `;
  }
  
  /**
   * Generate tenant-specific environment variables
   */
  public static generateTenantEnvVars(workflow: TenantWorkflow): Record<string, string> {
    return {
      TENANT_ID: workflow.id,
      TENANT_NAME: workflow.name,
      TENANT_SUBDOMAIN: workflow.subdomain,
      TENANT_PLAN: workflow.metadata.plan,
      TENANT_TIER: workflow.metadata.tier,
      TENANT_REGION: workflow.metadata.region,
      TENANT_TIMEZONE: workflow.metadata.timezone,
      TENANT_PRIMARY_COLOR: workflow.branding.colors.primary,
      TENANT_SECONDARY_COLOR: workflow.branding.colors.secondary,
      TENANT_ACCENT_COLOR: workflow.branding.colors.accent,
      TENANT_FONT_FAMILY: workflow.branding.typography.fontFamily.primary,
      TENANT_LOGO_URL: workflow.branding.logo.primary,
      TENANT_FAVICON_URL: workflow.branding.logo.favicon,
      TENANT_MAX_USERS: workflow.limits.users.max.toString(),
      TENANT_MAX_STORAGE: workflow.limits.storage.max.toString(),
      TENANT_MAX_API_CALLS: workflow.limits.apiCalls.max.toString(),
      TENANT_SESSION_TIMEOUT: workflow.security.authentication.sessionTimeout.toString(),
      TENANT_REQUIRE_MFA: workflow.security.authentication.requireMFA.toString(),
      TENANT_RATE_LIMIT: workflow.security.rateLimiting.maxRequests.toString(),
      TENANT_CORS_ORIGINS: workflow.security.cors.origins.join(','),
      TENANT_ALLOWED_DOMAINS: workflow.security.domainRestrictions.allowedDomains.join(',')
    };
  }
}
