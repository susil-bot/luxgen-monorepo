import { Tenant, ITenant, resolveVocabulary, type TenantVocabulary } from '@luxgen/db';
import { logger } from '../utils/logger';

export interface CreateTenantInput {
  name: string;
  subdomain: string;
  domain?: string;
  plan?: 'free' | 'pro' | 'enterprise';
  createdBy?: string;
}

export interface UpdateTenantInput {
  name?: string;
  domain?: string;
  status?: 'active' | 'suspended' | 'pending';
  settings?: {
    branding?: Record<string, unknown>;
    security?: Record<string, unknown>;
    config?: Record<string, unknown>;
  };
}

export class TenantService {
  async getTenantById(id: string): Promise<ITenant | null> {
    return Tenant.findById(id);
  }

  async getTenantBySubdomain(subdomain: string): Promise<ITenant | null> {
    return Tenant.findOne({ subdomain });
  }

  async getAllTenants(): Promise<ITenant[]> {
    return Tenant.find({});
  }

  async getActiveTenants(): Promise<ITenant[]> {
    return Tenant.find({ status: 'active' });
  }

  async createTenant(input: CreateTenantInput): Promise<ITenant> {
    const existing = await Tenant.findOne({ subdomain: input.subdomain });
    if (existing) throw new Error(`Tenant with subdomain "${input.subdomain}" already exists`);

    const tenant = new Tenant({
      name: input.name,
      subdomain: input.subdomain.toLowerCase().trim(),
      domain: input.domain,
      status: 'active',
      metadata: {
        plan: input.plan || 'free',
        createdAt: new Date(),
        lastActive: new Date(),
        createdBy: input.createdBy,
      },
    });

    await tenant.save();
    logger.info(`Tenant created: ${tenant.subdomain}`);
    return tenant;
  }

  async updateTenant(id: string, input: UpdateTenantInput): Promise<ITenant> {
    const tenant = await Tenant.findByIdAndUpdate(id, { $set: input }, { new: true });
    if (!tenant) throw new Error('Tenant not found');
    logger.info(`Tenant updated: ${tenant.subdomain}`);
    return tenant;
  }

  async deleteTenant(id: string): Promise<boolean> {
    const result = await Tenant.findByIdAndDelete(id);
    if (result) logger.info(`Tenant deleted: ${(result._id as any).toString()}`);
    return !!result;
  }

  /**
   * T-VERT-02 — partial update: only terms present in `input` change. Uses a scoped
   * `settings.vocabulary.<term>` $set per field rather than replacing the whole `settings`
   * object, so this can never clobber `settings.branding`/`security`/`config` the way a
   * naive `updateTenant({ settings: { vocabulary } })` call would (see updateTenant() above,
   * which does `$set: input` — safe only because it's never called with a partial `settings`
   * sub-object in practice; this method exists precisely to avoid relying on that).
   */
  async updateVocabulary(
    id: string,
    input: Partial<Record<keyof TenantVocabulary, string | null | undefined>>,
  ): Promise<TenantVocabulary> {
    const $set: Record<string, string> = {};
    for (const [term, label] of Object.entries(input)) {
      if (typeof label === 'string' && label.trim().length > 0) {
        $set[`settings.vocabulary.${term}`] = label.trim();
      }
    }
    const tenant = Object.keys($set).length
      ? await Tenant.findByIdAndUpdate(id, { $set }, { new: true })
      : await Tenant.findById(id);
    if (!tenant) throw new Error('Tenant not found');
    return resolveVocabulary(tenant);
  }

  async suspendTenant(id: string): Promise<ITenant> {
    return this.updateTenant(id, { status: 'suspended' });
  }

  async activateTenant(id: string): Promise<ITenant> {
    return this.updateTenant(id, { status: 'active' });
  }
}

export const tenantService = new TenantService();
