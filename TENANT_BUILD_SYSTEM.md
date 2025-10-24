# 🏢 Tenant-Based Build System

This document explains how to use the tenant-based build system for LuxGen, which allows you to build the application with tenant-specific configurations, logos, and branding.

## 🚀 Quick Start

### 1. Interactive Tenant Selection
```bash
npm run build
```
This will prompt you to select a tenant interactively.

### 2. Direct Tenant Selection
```bash
# Build for Demo tenant
npm run build:demo

# Build for Idea Vibes tenant
npm run build:idea-vibes

# Build for ACME Corporation tenant
npm run build:acme-corp
```

### 3. Manual Tenant Selection
```bash
npm run select-tenant
```

## 🏢 Available Tenants

### 1. Demo Tenant
- **ID**: `demo`
- **Name**: Demo Tenant
- **Logo**: LuxGen (text)
- **Primary Color**: #3B82F6 (Blue)
- **Subdomain**: demo

### 2. Idea Vibes
- **ID**: `idea-vibes`
- **Name**: Idea Vibes
- **Logo**: Idea Vibes (with SVG logo)
- **Primary Color**: #8B5CF6 (Purple)
- **Subdomain**: idea-vibes

### 3. ACME Corporation
- **ID**: `acme-corp`
- **Name**: ACME Corporation
- **Logo**: ACME (with SVG logo)
- **Primary Color**: #DC2626 (Red)
- **Subdomain**: acme-corp

## 🔧 How It Works

### Build Process
1. **Tenant Selection**: User selects a tenant (interactive or direct)
2. **Configuration Generation**: Script generates `packages/ui/src/selected-tenant.ts`
3. **Build Execution**: Turbo runs the build with tenant-specific configuration
4. **Global Application**: All components use tenant-specific logos and themes

### Generated Files
- `packages/ui/src/selected-tenant.ts` - Auto-generated tenant configuration
- Contains: `SELECTED_TENANT`, `TENANT_CONFIG`, `getTenantLogo()`, `getTenantTheme()`

### Component Integration
- **Sidebar**: Uses `getTenantLogo()` for tenant-specific logo
- **NavBar**: Uses `getTenantLogo()` for tenant-specific logo
- **Theme**: Uses `getTenantTheme()` for tenant-specific colors
- **Global**: All components automatically use tenant configuration

## 📁 File Structure

```
luxgen-monorepo/
├── scripts/
│   └── select-tenant.js          # Tenant selection script
├── packages/ui/src/
│   ├── tenant-config.ts          # Tenant configuration definitions
│   └── selected-tenant.ts        # Auto-generated (build-time)
└── package.json                  # Updated build scripts
```

## 🎨 Adding New Tenants

### 1. Update Tenant Configuration
Edit `packages/ui/src/tenant-config.ts`:

```typescript
export const tenantConfigs: Record<string, TenantConfig> = {
  // ... existing tenants
  'your-tenant': {
    id: 'your-tenant',
    name: 'Your Company',
    subdomain: 'your-tenant',
    logo: {
      src: '/logos/your-logo.svg',
      text: 'Your Company',
      alt: 'Your Company Logo',
      href: '/',
    },
    theme: {
      colors: {
        primary: '#YOUR_COLOR',
        // ... other colors
      },
      // ... other theme properties
    },
    branding: {
      companyName: 'Your Company',
      tagline: 'Your Tagline',
      primaryColor: '#YOUR_COLOR',
      secondaryColor: '#YOUR_SECONDARY_COLOR',
    },
  },
};
```

### 2. Update Build Script
Edit `scripts/select-tenant.js`:

```javascript
const tenantConfigs = {
  // ... existing tenants
  'your-tenant': {
    id: 'your-tenant',
    name: 'Your Company',
    // ... configuration
  },
};
```

### 3. Add Build Script
Edit `package.json`:

```json
{
  "scripts": {
    "build:your-tenant": "node scripts/select-tenant.js your-tenant && turbo run build"
  }
}
```

## 🔄 Development Workflow

### 1. Development Mode
```bash
npm run dev
```
Uses default tenant configuration (demo).

### 2. Production Build
```bash
# Interactive selection
npm run build

# Direct tenant selection
npm run build:idea-vibes
```

### 3. Testing Different Tenants
```bash
# Test Idea Vibes tenant
npm run build:idea-vibes
npm run dev

# Test ACME tenant
npm run build:acme-corp
npm run dev
```

## 🎯 Benefits

1. **Tenant-Specific Branding**: Each tenant gets their own logo, colors, and branding
2. **Build-Time Configuration**: No runtime tenant switching - optimized builds
3. **Global Application**: All components automatically use tenant configuration
4. **Easy Management**: Simple script-based tenant selection
5. **Scalable**: Easy to add new tenants and configurations

## 🚨 Important Notes

- **Build-Time Only**: Tenant selection happens at build time, not runtime
- **Generated Files**: `selected-tenant.ts` is auto-generated - don't edit manually
- **Logo Assets**: Place tenant logos in `public/logos/` directory
- **Theme Consistency**: All components use the same tenant theme
- **Subdomain Routing**: Each tenant can have its own subdomain configuration

## 🔧 Troubleshooting

### Issue: Tenant not found
**Solution**: Check tenant ID in `tenant-config.ts` and `select-tenant.js`

### Issue: Logo not showing
**Solution**: Verify logo path in `public/logos/` and tenant configuration

### Issue: Colors not applying
**Solution**: Check theme configuration in tenant config and component usage

### Issue: Build fails
**Solution**: Ensure all tenant configurations are valid and complete
