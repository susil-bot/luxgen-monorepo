# 🏢 LuxGen Tenant System Documentation

## 📋 Overview

The LuxGen tenant system provides multi-tenant architecture with subdomain routing, tenant-specific branding, security policies, and feature configurations. Each tenant operates in complete isolation with their own settings, themes, and configurations.

## 🏗️ Architecture

### **Tenant Structure**
```
apps/api/src/config/tenants/
├── demo/
│   ├── brand/
│   │   └── index.ts          # Brand colors, typography, spacing
│   ├── brand-identity/
│   │   └── index.ts          # Logos, assets, messaging
│   ├── themes/
│   │   └── index.ts          # UI themes (light, dark, high-contrast)
│   ├── security/
│   │   └── index.ts          # Security policies, auth settings
│   └── features/
│       └── index.ts          # Feature flags, limits, integrations
├── idea-vibes/
│   ├── brand/
│   ├── brand-identity/
│   ├── themes/
│   ├── security/
│   └── features/
└── index.ts                  # Main configuration loader
```

## 🎨 Tenant Configurations

### **Demo Tenant**
- **Subdomain**: `demo`
- **Plan**: Pro
- **Branding**: Professional blue theme
- **Features**: Analytics, notifications, file upload, API access
- **Security**: Standard security with 8-hour sessions
- **Limits**: 50 users, 2GB storage, 20K API calls

### **Idea Vibes Tenant**
- **Subdomain**: `idea-vibes`
- **Plan**: Enterprise
- **Branding**: Creative purple/pink gradient theme
- **Features**: Full feature set with custom domains
- **Security**: Enhanced security with MFA, 12-hour sessions
- **Limits**: 200 users, 10GB storage, 50K API calls

## 🔧 Configuration Structure

### **Brand Configuration**
```typescript
interface BrandConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    // ... more colors
  };
  typography: {
    fontFamily: Record<string, string>;
    fontSize: Record<string, string>;
    // ... typography settings
  };
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
}
```

### **Brand Identity**
```typescript
interface BrandIdentity {
  logo: {
    primary: LogoConfig;
    secondary: LogoConfig;
    icon: LogoConfig;
    favicon: FaviconConfig;
  };
  assets: {
    heroImage: string;
    backgroundPattern: string;
    // ... more assets
  };
  messaging: {
    tagline: string;
    description: string;
    // ... messaging
  };
}
```

### **Security Configuration**
```typescript
interface SecurityConfig {
  authentication: {
    sessionTimeout: number;
    requireMFA: boolean;
    maxLoginAttempts: number;
    // ... auth settings
  };
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    // ... password requirements
  };
  rateLimiting: {
    enabled: boolean;
    maxRequests: number;
    windowMs: number;
  };
  // ... more security settings
}
```

## 🌐 Subdomain Routing

### **URL Patterns**
- **Demo**: `http://demo.localhost:3000`
- **Idea Vibes**: `http://idea-vibes.localhost:3000`
- **Production**: `https://demo.yourdomain.com`, `https://idea-vibes.yourdomain.com`

### **Middleware Stack**
1. **Tenant Routing Middleware**: Extracts subdomain and finds tenant
2. **Tenant Security Middleware**: Applies tenant-specific security policies
3. **Tenant Headers Middleware**: Adds tenant-specific response headers
4. **Tenant Branding Middleware**: Injects tenant CSS and branding
5. **Tenant Auth Middleware**: Validates tenant-specific authentication

## 🔐 Security Features

### **Tenant Isolation**
- Database-level isolation
- Tenant-specific JWT signing keys
- Cross-tenant access prevention
- Tenant-specific CORS policies

### **Security Headers**
- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- Custom tenant security headers

### **Rate Limiting**
- Tenant-specific rate limits
- IP-based and user-based limiting
- Configurable windows and limits

## 🎨 Branding System

### **Dynamic Theming**
- CSS custom properties injection
- Tenant-specific color schemes
- Custom font families
- Responsive design tokens

### **Asset Management**
- Tenant-specific logos and favicons
- Custom CSS injection
- Brand guideline enforcement
- Social media branding

## 📊 Feature Management

### **Feature Flags**
```typescript
interface FeatureFlags {
  analytics: boolean;
  notifications: boolean;
  fileUpload: boolean;
  apiAccess: boolean;
  customDomain: boolean;
}
```

### **Usage Limits**
```typescript
interface UsageLimits {
  maxUsers: number;
  maxStorage: number; // in MB
  maxApiCalls: number;
}
```

## 🚀 API Endpoints

### **Tenant Management**
- `GET /api/tenant/current` - Get current tenant info
- `GET /api/tenant/config` - Get tenant configuration
- `PATCH /api/tenant/branding` - Update branding
- `PATCH /api/tenant/security` - Update security settings
- `GET /api/tenant/stats` - Get tenant statistics
- `POST /api/tenant/init` - Initialize new tenant

### **Authentication**
- `POST /api/auth/login` - Tenant-aware login
- `POST /api/auth/register` - Tenant-aware registration
- `GET /api/auth/me` - Get current user (tenant-scoped)

## 🛠️ Development Setup

### **1. Initialize Tenants**
```bash
# Run the tenant initialization script
node scripts/init-tenants.js
```

### **2. Test Subdomain Routing**
```bash
# Test demo tenant
curl -H "Host: demo.localhost" http://localhost:4000/api/tenant/current

# Test idea-vibes tenant
curl -H "Host: idea-vibes.localhost" http://localhost:4000/api/tenant/current
```

### **3. Development URLs**
- **Demo**: http://demo.localhost:3000
- **Idea Vibes**: http://idea-vibes.localhost:3000
- **API**: http://localhost:4000

## 🔧 Configuration Management

### **Adding New Tenants**
1. Create tenant directory: `apps/api/src/config/tenants/new-tenant/`
2. Add configuration files:
   - `brand/index.ts`
   - `brand-identity/index.ts`
   - `themes/index.ts`
   - `security/index.ts`
   - `features/index.ts`
3. Update `apps/api/src/config/tenants/index.ts`
4. Initialize tenant via API or script

### **Customizing Existing Tenants**
1. Edit configuration files in tenant directory
2. Restart API server to apply changes
3. Test with subdomain routing

## 📈 Monitoring & Analytics

### **Tenant Metrics**
- User count per tenant
- Storage usage per tenant
- API call counts per tenant
- Feature usage analytics

### **Security Monitoring**
- Failed login attempts
- Suspicious activity detection
- Rate limit violations
- Cross-tenant access attempts

## 🚀 Deployment

### **Production Configuration**
1. Set up DNS for subdomains
2. Configure SSL certificates
3. Set up tenant-specific databases
4. Configure monitoring and logging
5. Set up backup and recovery

### **Environment Variables**
```bash
# MongoDB connection
MONGODB_URI=mongodb://admin:password@mongodb:27017/luxgen_prod?authSource=admin

# JWT secrets (one per tenant)
TENANT_DEMO_KEY=your-demo-tenant-key
TENANT_IDEA_VIBES_KEY=your-idea-vibes-tenant-key

# CORS origins
CORS_ORIGINS=https://demo.yourdomain.com,https://idea-vibes.yourdomain.com
```

## 🧪 Testing

### **Unit Tests**
```bash
npm run test --filter=@luxgen/api
```

### **Integration Tests**
```bash
# Test tenant routing
npm run test:integration:tenants

# Test subdomain isolation
npm run test:integration:subdomains
```

### **Manual Testing**
1. Start development environment
2. Initialize tenants
3. Test subdomain routing
4. Verify tenant isolation
5. Test tenant-specific features

## 📚 Best Practices

### **Tenant Configuration**
- Keep configurations modular and organized
- Use TypeScript for type safety
- Validate configurations before deployment
- Document tenant-specific requirements

### **Security**
- Implement tenant isolation at all levels
- Use tenant-specific JWT keys
- Monitor for cross-tenant access attempts
- Regular security audits

### **Performance**
- Cache tenant configurations
- Optimize database queries
- Use CDN for tenant assets
- Monitor resource usage per tenant

## 🔍 Troubleshooting

### **Common Issues**
1. **Subdomain not resolving**: Check DNS configuration
2. **Tenant not found**: Verify tenant initialization
3. **CORS errors**: Check tenant CORS settings
4. **Authentication issues**: Verify tenant-specific JWT keys

### **Debug Commands**
```bash
# Check tenant status
curl http://localhost:4000/api/tenant/current

# Test subdomain routing
curl -H "Host: demo.localhost" http://localhost:4000/health

# Check tenant configuration
curl http://localhost:4000/api/tenant/config
```

## 📞 Support

For issues with the tenant system:
1. Check the logs: `docker-compose logs api`
2. Verify tenant configuration
3. Test subdomain routing
4. Check database connectivity
5. Review security settings

---

**🎉 The LuxGen tenant system is now ready for multi-tenant applications with complete isolation, custom branding, and flexible configurations!**
