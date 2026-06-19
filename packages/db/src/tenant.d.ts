import { Schema, Document } from 'mongoose';
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
  sessionTimeout: number;
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
    maxStorage: number;
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
  domain?: string;
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
export declare const Tenant: import('mongoose').Model<
  ITenant,
  {},
  {},
  {},
  Document<unknown, {}, ITenant> &
    ITenant & {
      _id: import('mongoose').Types.ObjectId;
    },
  any
>;
