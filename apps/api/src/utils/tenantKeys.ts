import { TextEncoder } from 'util';

export interface TenantKeyStore {
  [tenantId: string]: string;
}

export class TenantKeyManager {
  private keyStore: TenantKeyStore;

  constructor() {
    this.keyStore = this.loadTenantKeys();
  }

  private loadTenantKeys(): TenantKeyStore {
    const keyStore: TenantKeyStore = {};
    
    // Load tenant keys from environment variables
    // Pattern: TENANT_<TENANT_ID>_KEY
    const envVars = Object.keys(process.env);
    const tenantKeyPattern = /^TENANT_(.+)_KEY$/;
    
    envVars.forEach(envVar => {
      const match = envVar.match(tenantKeyPattern);
      if (match) {
        const tenantId = match[1].toLowerCase();
        keyStore[tenantId] = process.env[envVar]!;
      }
    });

    // Add default fallback key
    if (process.env.JWT_SECRET) {
      keyStore['default'] = process.env.JWT_SECRET;
    }

    return keyStore;
  }

  /**
   * Get the signing key for a specific tenant
   */
  getTenantKey(tenantId: string): string {
    const key = this.keyStore[tenantId] || this.keyStore['default'];
    if (!key) {
      throw new Error(`No signing key found for tenant: ${tenantId}`);
    }
    return key;
  }

  /**
   * Get the signing key as a Uint8Array for JWT operations
   */
  getTenantKeyBuffer(tenantId: string): Uint8Array {
    const key = this.getTenantKey(tenantId);
    return new TextEncoder().encode(key);
  }

  /**
   * Get all available tenant IDs
   */
  getAvailableTenants(): string[] {
    return Object.keys(this.keyStore);
  }

  /**
   * Check if a tenant has a specific key
   */
  hasTenantKey(tenantId: string): boolean {
    return tenantId in this.keyStore;
  }

  /**
   * Add a new tenant key (for dynamic key management)
   */
  addTenantKey(tenantId: string, key: string): void {
    this.keyStore[tenantId] = key;
  }

  /**
   * Remove a tenant key
   */
  removeTenantKey(tenantId: string): void {
    delete this.keyStore[tenantId];
  }

  /**
   * Reload keys from environment variables
   */
  reloadKeys(): void {
    this.keyStore = this.loadTenantKeys();
  }
}

// Singleton instance
export const tenantKeyManager = new TenantKeyManager();
