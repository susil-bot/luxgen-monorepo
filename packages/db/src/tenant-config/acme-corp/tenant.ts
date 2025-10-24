/**
 * ACME Corporation Tenant Database Model
 * 
 * This file contains the database model and operations
 * specific to the ACME Corporation tenant.
 */

import { Schema, model, Document } from 'mongoose';

// ACME Corporation tenant specific database operations
export interface AcmeCorpTenantDocument extends Document {
  tenantId: string;
  customSettings: {
    theme: string;
    features: string[];
    enterpriseMode: boolean;
    securityLevel: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const acmeCorpTenantSchema = new Schema<AcmeCorpTenantDocument>({
  tenantId: {
    type: String,
    required: true,
    unique: true,
    default: 'acme-corp'
  },
  customSettings: {
    theme: {
      type: String,
      default: 'enterprise'
    },
    features: [{
      type: String,
      enum: ['analytics', 'reporting', 'notifications', 'userManagement', 'enterpriseMode']
    }],
    enterpriseMode: {
      type: Boolean,
      default: true
    },
    securityLevel: {
      type: String,
      enum: ['standard', 'high', 'maximum'],
      default: 'high'
    }
  }
}, {
  timestamps: true
});

export const AcmeCorpTenant = model<AcmeCorpTenantDocument>('AcmeCorpTenant', acmeCorpTenantSchema);

// ACME Corporation tenant specific database operations
export const acmeCorpTenantOperations = {
  async getCustomSettings(tenantId: string) {
    return await AcmeCorpTenant.findOne({ tenantId });
  },

  async updateCustomSettings(tenantId: string, settings: any) {
    return await AcmeCorpTenant.findOneAndUpdate(
      { tenantId },
      { customSettings: settings },
      { upsert: true, new: true }
    );
  },

  async getTheme(tenantId: string) {
    const tenant = await AcmeCorpTenant.findOne({ tenantId });
    return tenant?.customSettings?.theme || 'enterprise';
  },

  async getFeatures(tenantId: string) {
    const tenant = await AcmeCorpTenant.findOne({ tenantId });
    return tenant?.customSettings?.features || [];
  },

  async isEnterpriseModeEnabled(tenantId: string) {
    const tenant = await AcmeCorpTenant.findOne({ tenantId });
    return tenant?.customSettings?.enterpriseMode || false;
  },

  async getSecurityLevel(tenantId: string) {
    const tenant = await AcmeCorpTenant.findOne({ tenantId });
    return tenant?.customSettings?.securityLevel || 'high';
  }
};
