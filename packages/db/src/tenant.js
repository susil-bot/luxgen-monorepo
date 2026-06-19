'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.Tenant = void 0;
const mongoose_1 = require('mongoose');
const tenantSchema = new mongoose_1.Schema(
  {
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
      },
    },
  },
  {
    timestamps: true,
  },
);
// Indexes for performance
tenantSchema.index({ subdomain: 1 });
tenantSchema.index({ domain: 1 });
tenantSchema.index({ status: 1 });
tenantSchema.index({ 'metadata.plan': 1 });
exports.Tenant = (0, mongoose_1.model)('Tenant', tenantSchema);
