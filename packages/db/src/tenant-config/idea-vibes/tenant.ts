/**
 * Idea Vibes Tenant Database Model
 * 
 * This file contains the database model and operations
 * specific to the Idea Vibes tenant.
 */

import { Schema, model, Document } from 'mongoose';

// Idea Vibes tenant specific database operations
export interface IdeaVibesTenantDocument extends Document {
  tenantId: string;
  customSettings: {
    theme: string;
    features: string[];
    creativeMode: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ideaVibesTenantSchema = new Schema<IdeaVibesTenantDocument>({
  tenantId: {
    type: String,
    required: true,
    unique: true,
    default: 'idea-vibes'
  },
  customSettings: {
    theme: {
      type: String,
      default: 'creative'
    },
    features: [{
      type: String,
      enum: ['analytics', 'reporting', 'notifications', 'userManagement', 'creativeMode']
    }],
    creativeMode: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

export const IdeaVibesTenant = model<IdeaVibesTenantDocument>('IdeaVibesTenant', ideaVibesTenantSchema);

// Idea Vibes tenant specific database operations
export const ideaVibesTenantOperations = {
  async getCustomSettings(tenantId: string) {
    return await IdeaVibesTenant.findOne({ tenantId });
  },

  async updateCustomSettings(tenantId: string, settings: any) {
    return await IdeaVibesTenant.findOneAndUpdate(
      { tenantId },
      { customSettings: settings },
      { upsert: true, new: true }
    );
  },

  async getTheme(tenantId: string) {
    const tenant = await IdeaVibesTenant.findOne({ tenantId });
    return tenant?.customSettings?.theme || 'creative';
  },

  async getFeatures(tenantId: string) {
    const tenant = await IdeaVibesTenant.findOne({ tenantId });
    return tenant?.customSettings?.features || [];
  },

  async isCreativeModeEnabled(tenantId: string) {
    const tenant = await IdeaVibesTenant.findOne({ tenantId });
    return tenant?.customSettings?.creativeMode || false;
  }
};
