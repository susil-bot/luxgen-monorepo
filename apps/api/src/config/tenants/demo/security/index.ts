/**
 * Demo Tenant - Security Configuration
 * Security policies and authentication settings
 */

export const demoSecurityConfig = {
  // Authentication settings
  authentication: {
    sessionTimeout: 480, // 8 hours in minutes
    requireMFA: false,
    maxLoginAttempts: 5,
    lockoutDuration: 30, // minutes
    passwordExpiry: 90, // days
    rememberMe: true,
    rememberMeDuration: 30 // days
  },

  // Password policy
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: false,
    preventCommonPasswords: true,
    preventUserInfo: true,
    preventSequentialChars: true
  },

  // Rate limiting
  rateLimiting: {
    enabled: true,
    maxRequests: 2000,
    windowMs: 900000, // 15 minutes
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    keyGenerator: 'ip', // 'ip' | 'user' | 'tenant'
    message: 'Too many requests from this IP, please try again later.'
  },

  // CORS configuration
  cors: {
    enabled: true,
    origins: [
      'http://demo.localhost:3000',
      'https://demo.example.com',
      'https://demo.vercel.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Tenant-ID'
    ],
    credentials: true,
    maxAge: 86400 // 24 hours
  },

  // Domain restrictions
  domainRestrictions: {
    allowedDomains: [
      'demo.localhost',
      'demo.example.com',
      'demo.vercel.app'
    ],
    blockedDomains: [],
    redirectToHttps: true,
    enforceSubdomain: true
  },

  // API security
  apiSecurity: {
    requireApiKey: false,
    apiKeyHeader: 'X-API-Key',
    rateLimitPerKey: 1000,
    allowedIPs: [],
    blockedIPs: [],
    requireHttps: true,
    contentSecurityPolicy: {
      enabled: true,
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:', 'https:'],
        'font-src': ["'self'", 'https:'],
        'connect-src': ["'self'"],
        'frame-src': ["'none'"]
      }
    }
  },

  // Data protection
  dataProtection: {
    encryptSensitiveData: true,
    encryptionAlgorithm: 'aes-256-gcm',
    dataRetention: 2555, // days (7 years)
    anonymizeOnDelete: true,
    auditLogging: true,
    gdprCompliant: true
  },

  // Security headers
  securityHeaders: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
  },

  // Monitoring and alerts
  monitoring: {
    enabled: true,
    logFailedAttempts: true,
    alertOnSuspiciousActivity: true,
    alertThresholds: {
      failedLogins: 10,
      apiErrors: 50,
      unusualTraffic: 1000
    },
    notificationChannels: ['email', 'slack']
  }
};
