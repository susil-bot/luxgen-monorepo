import { config } from 'dotenv';
import { getApiUrl, getGraphqlUrl, getMongoUri, getOllamaUrl, getRedisUrl, getWebUrl, getCorsOrigins } from './urls';

// Load environment variables
config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '4000', 10),

  // URLs (from .env — see apps/*/.env.example)
  WEB_APP_URL: getWebUrl(),
  API_URL: getApiUrl(),
  GRAPHQL_URL: getGraphqlUrl(),
  OLLAMA_HOST: getOllamaUrl(),
  CORS_ORIGINS: getCorsOrigins(),

  // Database
  MONGODB_URI: getMongoUri(),
  DB_NAME: process.env.DB_NAME || 'luxgen',

  // JWT — no fallback; apps/api hard-fails at startup if JWT_SECRET is unset
  JWT_SECRET: process.env.JWT_SECRET ?? '',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // CORS (primary origin — full list in CORS_ORIGINS)
  CORS_ORIGIN: process.env.CORS_ORIGIN || getWebUrl(),

  // Apollo
  APOLLO_PLAYGROUND: process.env.APOLLO_PLAYGROUND === 'true',
  APOLLO_INTROSPECTION: process.env.APOLLO_INTROSPECTION === 'true',

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  // Email
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,

  // Storage
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB

  // Redis
  REDIS_URL: getRedisUrl(),

  // External APIs
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,

  // Feature flags
  ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS === 'true',
  ENABLE_PAYMENTS: process.env.ENABLE_PAYMENTS === 'true',
  ENABLE_NOTIFICATIONS: process.env.ENABLE_NOTIFICATIONS === 'true',
} as const;

export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
