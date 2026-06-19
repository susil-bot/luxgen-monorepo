import { Tenant, ITenant } from '@luxgen/db';
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

  async suspendTenant(id: string): Promise<ITenant> {
    return this.updateTenant(id, { status: 'suspended' });
  }

  async activateTenant(id: string): Promise<ITenant> {
    return this.updateTenant(id, { status: 'active' });
  }
}

export const tenantService = new TenantService();
