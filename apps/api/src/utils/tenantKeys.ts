import { randomBytes } from 'crypto';
import { TextEncoder } from 'util';
import {
  insertGraceKey,
  loadActiveAndGraceKeys,
  revokeKeysForTenant,
  upsertActiveKey,
} from '../services/tenantKeyPersistence';

export interface TenantKeyStore {
  [tenantId: string]: string;
}

interface GraceKeyEntry {
  secret: string;
  expiresAt: Date;
}

const DEFAULT_GRACE_HOURS = 24;

function gracePeriodMs(): number {
  const hours = Number(process.env.TENANT_KEY_GRACE_HOURS ?? DEFAULT_GRACE_HOURS);
  return (Number.isFinite(hours) && hours > 0 ? hours : DEFAULT_GRACE_HOURS) * 60 * 60 * 1000;
}

export class TenantKeyManager {
  private keyStore: TenantKeyStore;
  private graceKeys: Map<string, GraceKeyEntry[]>;

  constructor() {
    this.keyStore = this.loadEnvKeys();
    this.graceKeys = new Map();
  }

  private loadEnvKeys(): TenantKeyStore {
    const keyStore: TenantKeyStore = {};
    const envVars = Object.keys(process.env);
    const tenantKeyPattern = /^TENANT_(.+)_KEY$/;

    envVars.forEach((envVar) => {
      const match = envVar.match(tenantKeyPattern);
      if (match) {
        const tenantId = match[1].toLowerCase();
        keyStore[tenantId] = process.env[envVar]!;
      }
    });

    if (process.env.JWT_SECRET) {
      keyStore['default'] = process.env.JWT_SECRET;
    }

    return keyStore;
  }

  /**
   * Load persisted keys from MongoDB (call after connectDB).
   * DB active keys override env keys for the same tenantId.
   */
  async hydrateFromDatabase(): Promise<void> {
    const rows = await loadActiveAndGraceKeys();
    const graceByTenant = new Map<string, GraceKeyEntry[]>();

    for (const row of rows) {
      if (row.status === 'active') {
        this.keyStore[row.tenantId] = row.secret;
      } else if (row.status === 'grace' && row.expiresAt) {
        const list = graceByTenant.get(row.tenantId) ?? [];
        list.push({ secret: row.secret, expiresAt: row.expiresAt });
        graceByTenant.set(row.tenantId, list);
      }
    }

    this.graceKeys = graceByTenant;
  }

  /**
   * Active signing key for a tenant (kid === tenantId in JWT headers).
   */
  getTenantKey(tenantId: string): string {
    const key = this.keyStore[tenantId] || this.keyStore['default'];
    if (!key) {
      throw new Error(`No signing key found for tenant: ${tenantId}`);
    }
    return key;
  }

  /**
   * All secrets to try when verifying a token (active + unexpired grace keys).
   */
  getSigningSecretsForKid(kid: string): string[] {
    const secrets: string[] = [];
    const active = this.keyStore[kid];
    if (active) secrets.push(active);

    const now = Date.now();
    for (const entry of this.graceKeys.get(kid) ?? []) {
      if (entry.expiresAt.getTime() > now) {
        secrets.push(entry.secret);
      }
    }

    if (secrets.length === 0 && this.keyStore['default']) {
      return [this.keyStore['default']];
    }

    return secrets;
  }

  getTenantKeyBuffer(tenantId: string): Uint8Array {
    const key = this.getTenantKey(tenantId);
    return new TextEncoder().encode(key);
  }

  getAvailableTenants(): string[] {
    const ids = new Set(Object.keys(this.keyStore));
    for (const tenantId of this.graceKeys.keys()) {
      ids.add(tenantId);
    }
    return [...ids];
  }

  hasTenantKey(tenantId: string): boolean {
    return tenantId in this.keyStore;
  }

  /** In-memory only — used by tests. */
  addTenantKey(tenantId: string, key: string): void {
    this.keyStore[tenantId] = key;
  }

  /** In-memory only — used by tests. */
  removeTenantKey(tenantId: string): void {
    delete this.keyStore[tenantId];
    this.graceKeys.delete(tenantId);
  }

  async setActiveKey(tenantId: string, secret: string): Promise<void> {
    this.keyStore[tenantId] = secret;
    await upsertActiveKey(tenantId, secret);
  }

  async addGraceKey(tenantId: string, secret: string, expiresAt: Date): Promise<void> {
    const list = this.graceKeys.get(tenantId) ?? [];
    list.push({ secret, expiresAt });
    this.graceKeys.set(tenantId, list);
    await insertGraceKey(tenantId, secret, expiresAt);
  }

  async revokeTenantKeys(tenantId: string): Promise<number> {
    delete this.keyStore[tenantId];
    this.graceKeys.delete(tenantId);
    return revokeKeysForTenant(tenantId);
  }

  async reloadKeys(): Promise<void> {
    this.keyStore = this.loadEnvKeys();
    this.graceKeys = new Map();
    await this.hydrateFromDatabase();
  }
}

export const tenantKeyManager = new TenantKeyManager();

export function gracePeriodExpiresAt(): Date {
  return new Date(Date.now() + gracePeriodMs());
}

export function generateNewTenantKey(length: number = 64): string {
  return randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
}
