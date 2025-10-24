import { Schema, model, Document } from 'mongoose';

export interface TenantBranding {
  logo?: string;
  favicon?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  customCSS?: string;
}

export interface TenantSecurity {
  allowedDomains: string[];
  corsOrigins: string[];
  rateLimiting: {
    enabled: boolean;
    maxRequests: number;
    windowMs: number;
  };
  sessionTimeout: number; // in minutes
  requireMFA: boolean;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
  };
}

export interface TenantConfig {
  features: {
    analytics: boolean;
    notifications: boolean;
    fileUpload: boolean;
    apiAccess: boolean;
    customDomain: boolean;
  };
  limits: {
    maxUsers: number;
    maxStorage: number; // in MB
    maxApiCalls: number;
  };
  integrations: {
    emailProvider?: string;
    paymentProvider?: string;
    analyticsProvider?: string;
  };
}

export interface ITenant extends Document {
  name: string;
  subdomain: string;
  domain?: string; // Custom domain
  status: 'active' | 'suspended' | 'pending';
  settings: {
    branding: TenantBranding;
    security: TenantSecurity;
    config: TenantConfig;
  };
  metadata: {
    plan: 'free' | 'pro' | 'enterprise';
    createdAt: Date;
    lastActive: Date;
    createdBy: Schema.Types.ObjectId;
  };
  createdAt: Date;
  updatedAt: Date;
}

const tenantSchema = new Schema<ITenant>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  subdomain: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens'],
  },
  domain: {
    type: String,
    trim: true,
    lowercase: true,
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'pending'],
    default: 'active',
  },
  settings: {
    branding: {
      logo: String,
      favicon: String,
      primaryColor: {
        type: String,
        default: '#3B82F6',
        match: [/^#[0-9A-Fa-f]{6}$/, 'Primary color must be a valid hex color'],
      },
      secondaryColor: {
        type: String,
        default: '#6B7280',
        match: [/^#[0-9A-Fa-f]{6}$/, 'Secondary color must be a valid hex color'],
      },
      accentColor: {
        type: String,
        default: '#10B981',
        match: [/^#[0-9A-Fa-f]{6}$/, 'Accent color must be a valid hex color'],
      },
      fontFamily: {
        type: String,
        default: 'Inter, system-ui, sans-serif',
      },
      customCSS: String,
    },
    security: {
      allowedDomains: [String],
      corsOrigins: [String],
      rateLimiting: {
        enabled: {
          type: Boolean,
          default: true,
        },
        maxRequests: {
          type: Number,
          default: 1000,
        },
        windowMs: {
          type: Number,
          default: 900000, // 15 minutes
        },
      },
      sessionTimeout: {
        type: Number,
        default: 480, // 8 hours in minutes
      },
      requireMFA: {
        type: Boolean,
        default: false,
      },
      passwordPolicy: {
        minLength: {
          type: Number,
          default: 8,
        },
        requireUppercase: {
          type: Boolean,
          default: true,
        },
        requireLowercase: {
          type: Boolean,
          default: true,
        },
        requireNumbers: {
          type: Boolean,
          default: true,
        },
        requireSymbols: {
          type: Boolean,
          default: false,
        },
      },
    },
    config: {
      features: {
        analytics: {
          type: Boolean,
          default: true,
        },
        notifications: {
          type: Boolean,
          default: true,
        },
        fileUpload: {
          type: Boolean,
          default: true,
        },
        apiAccess: {
          type: Boolean,
          default: true,
        },
        customDomain: {
          type: Boolean,
          default: false,
        },
      },
      limits: {
        maxUsers: {
          type: Number,
          default: 100,
        },
        maxStorage: {
          type: Number,
          default: 1024, // 1GB in MB
        },
        maxApiCalls: {
          type: Number,
          default: 10000,
        },
      },
      integrations: {
        emailProvider: String,
        paymentProvider: String,
        analyticsProvider: String,
      },
    },
  },
  metadata: {
    plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
}, {
  timestamps: true,
});

// Indexes for performance
tenantSchema.index({ subdomain: 1 });
tenantSchema.index({ domain: 1 });
tenantSchema.index({ status: 1 });
tenantSchema.index({ 'metadata.plan': 1 });

export const Tenant = model<ITenant>('Tenant', tenantSchema);
