/**
 * Demo Tenant Database Model
 * 
 * This file contains the database model and operations
 * specific to the demo tenant.
 */

import { Schema, model, Document } from 'mongoose';

// Demo tenant specific database operations
export interface DemoTenantDocument extends Document {
  tenantId: string;
  customSettings: {
    theme: string;
    features: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const demoTenantSchema = new Schema<DemoTenantDocument>({
  tenantId: {
    type: String,
    required: true,
    unique: true,
    default: 'demo'
  },
  customSettings: {
    theme: {
      type: String,
      default: 'default'
    },
    features: [{
      type: String,
      enum: ['analytics', 'reporting', 'notifications', 'userManagement']
    }]
  }
}, {
  timestamps: true
});

export const DemoTenant = model<DemoTenantDocument>('DemoTenant', demoTenantSchema);

// Demo tenant specific database operations
export const demoTenantOperations = {
  async getCustomSettings(tenantId: string) {
    return await DemoTenant.findOne({ tenantId });
  },

  async updateCustomSettings(tenantId: string, settings: any) {
    return await DemoTenant.findOneAndUpdate(
      { tenantId },
      { customSettings: settings },
      { upsert: true, new: true }
    );
  },

  async getTheme(tenantId: string) {
    const tenant = await DemoTenant.findOne({ tenantId });
    return tenant?.customSettings?.theme || 'default';
  },

  async getFeatures(tenantId: string) {
    const tenant = await DemoTenant.findOne({ tenantId });
    return tenant?.customSettings?.features || [];
  }
};
