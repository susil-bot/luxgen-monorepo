# Assets Package

A comprehensive asset management system for the LuxGen application, providing global and tenant-specific brand identity assets with React components and utilities.

## 🎯 Overview

The Assets package provides:
- **Global Asset Management**: Application-wide asset management
- **Tenant-Specific Assets**: Custom branding for different tenants
- **Asset Components**: Reusable React components for displaying assets
- **Asset Utilities**: Helper functions for asset manipulation
- **Brand Configuration**: Complete brand identity management

## 🏗️ Architecture

### Core Components

1. **AssetManager**: Context provider for asset management
2. **AssetUtils**: Utility components and functions
3. **DefaultBrandAssets**: Predefined brand assets for different tenants
4. **Asset Components**: React components for displaying assets

### Asset Types

- **Images**: Photos, graphics, backgrounds
- **Icons**: UI icons, navigation icons
- **Logos**: Primary, secondary, icon, favicon variants
- **Backgrounds**: Pattern backgrounds, hero images
- **Illustrations**: 404 pages, empty states, success states

## 🚀 Quick Start

### Basic Usage

```tsx
import { AssetManagerProvider, useAssetManager } from '@luxgen/ui';

function App() {
  return (
    <AssetManagerProvider tenantId="demo" autoLoad={true}>
      <YourApp />
    </AssetManagerProvider>
  );
}

function YourComponent() {
  const { getAsset, getBrandAssets, loading } = useAssetManager();
  
  const logo = getAsset('demo-logo-primary');
  const brandAssets = getBrandAssets();
  
  if (loading) return <div>Loading assets...</div>;
  
  return <img src={logo?.url} alt={logo?.alt} />;
}
```

### Asset Components

```tsx
import { AssetImage, AssetLogo, AssetBackground } from '@luxgen/ui';

// Display an image asset
<AssetImage 
  asset={logoAsset}
  className="w-32 h-32"
  fallback="/default-logo.png"
/>

// Display brand logo
<AssetLogo 
  brandAssets={brandAssets}
  variant="primary"
  size={40}
  showText={true}
/>

// Use as background
<AssetBackground 
  asset={backgroundAsset}
  className="h-screen"
  overlay={true}
  overlayColor="black"
  overlayOpacity={0.5}
/>
```

## 📚 Components

### AssetManagerProvider

Context provider for asset management.

```tsx
interface AssetManagerProviderProps {
  children: React.ReactNode;
  defaultAssets?: AssetConfig[];
  defaultBrandAssets?: BrandAssets;
  tenantId?: string;
  autoLoad?: boolean;
}
```

**Props:**
- `children`: React children
- `defaultAssets`: Default asset configuration
- `defaultBrandAssets`: Default brand assets
- `tenantId`: Tenant identifier
- `autoLoad`: Whether to automatically load assets

### AssetImage

Component for displaying image assets.

```tsx
interface AssetImageProps {
  asset: AssetConfig;
  className?: string;
  style?: React.CSSProperties;
  fallback?: string;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  onClick?: () => void;
}
```

**Features:**
- Automatic loading states
- Error handling with fallbacks
- Lazy loading support
- Click handlers
- Custom styling

### AssetIcon

Component for displaying icon assets.

```tsx
interface AssetIconProps {
  asset: AssetConfig;
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
  color?: string;
}
```

**Features:**
- Customizable size
- Color theming
- SVG support
- Placeholder fallbacks

### AssetLogo

Component for displaying brand logos.

```tsx
interface AssetLogoProps {
  brandAssets: BrandAssets;
  variant?: 'primary' | 'secondary' | 'icon';
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
  showText?: boolean;
}
```

**Features:**
- Multiple logo variants
- Text display options
- Brand consistency
- Responsive sizing

### AssetBackground

Component for background images.

```tsx
interface AssetBackgroundProps {
  asset: AssetConfig;
  className?: string;
  style?: React.CSSProperties;
  overlay?: boolean;
  overlayColor?: string;
  overlayOpacity?: number;
}
```

**Features:**
- Overlay support
- Custom positioning
- Responsive backgrounds
- Performance optimized

## 🛠️ Utilities

### Asset Management

```typescript
// Get asset by ID
const asset = getAsset('logo-primary', 'demo');

// Get brand assets for tenant
const brandAssets = getBrandAssets('demo');

// Add new asset
addAsset({
  id: 'new-asset',
  name: 'New Asset',
  type: 'image',
  category: 'ui',
  url: '/new-asset.jpg',
});

// Update asset
updateAsset('asset-id', { name: 'Updated Name' });

// Remove asset
removeAsset('asset-id');
```

### Asset Utilities

```typescript
// Get asset URL with variant
const url = getAssetUrl(asset, 'dark');

// Get asset dimensions
const { width, height } = getAssetDimensions(asset);

// Check if asset is loaded
const isLoaded = await isAssetLoaded(asset);

// Preload multiple assets
await preloadAssets([asset1, asset2, asset3]);

// Get brand colors
const colors = getBrandColors(brandAssets);

// Get brand typography
const typography = getBrandTypography(brandAssets);
```

## 🎨 Styling

### Style Utilities

```typescript
import { assetStyles, getSizeStyles, getAnimationStyles } from '@luxgen/ui/src/Assets/styles';

// Use predefined styles
const customStyles = assetStyles.image.container;

// Get dynamic styles
const sizeStyles = getSizeStyles(40);
const animationStyles = getAnimationStyles('fadeIn');
```

### Custom Styling

```tsx
<AssetImage 
  asset={asset}
  className="w-32 h-32 rounded-lg shadow-lg"
  style={{ 
    filter: 'brightness(1.1)',
    transition: 'transform 0.2s ease'
  }}
/>
```

## 🏢 Tenant Configuration

### Demo Tenant
```typescript
const demoBrandAssets = {
  logo: {
    primary: { /* Demo logo config */ },
    icon: { /* Demo icon config */ },
  },
  colors: {
    primary: '#1E40AF',
    secondary: '#64748B',
    accent: '#059669',
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
  },
};
```

### Idea Vibes Tenant
```typescript
const ideaVibesBrandAssets = {
  logo: {
    primary: { /* Idea Vibes logo config */ },
    icon: { /* Idea Vibes icon config */ },
  },
  colors: {
    primary: '#7C3AED',
    secondary: '#EC4899',
    accent: '#F59E0B',
  },
  typography: {
    fontFamily: 'Poppins, system-ui, sans-serif',
  },
};
```

## 📡 API Integration

### Global Assets
```
GET /api/assets/global
```

Returns global assets and LuxGen brand assets.

### Tenant Assets
```
GET /api/assets/tenant/[tenantId]
```

Returns tenant-specific assets and brand configuration.

### Response Format
```typescript
interface AssetApiResponse {
  assets: AssetConfig[];
  brandAssets: BrandAssets;
  tenantId?: string;
  timestamp: string;
}
```

## 🧪 Testing

### Component Testing
```typescript
import { render, screen } from '@testing-library/react';
import { AssetManagerProvider, AssetImage } from '@luxgen/ui';

test('renders asset image', () => {
  render(
    <AssetManagerProvider>
      <AssetImage asset={mockAsset} />
    </AssetManagerProvider>
  );
  
  expect(screen.getByAltText('Test Asset')).toBeInTheDocument();
});
```

### Mock Assets
```typescript
const mockAsset: AssetConfig = {
  id: 'test-asset',
  name: 'Test Asset',
  type: 'image',
  category: 'ui',
  url: '/test.jpg',
  alt: 'Test Asset',
};
```

## 🎯 Best Practices

### Performance
- **Lazy Loading**: Use lazy loading for non-critical assets
- **Preloading**: Preload critical assets
- **Optimization**: Optimize asset sizes and formats
- **Caching**: Implement proper caching strategies

### Accessibility
- **Alt Text**: Always provide meaningful alt text
- **Focus Management**: Ensure keyboard navigation
- **Screen Readers**: Test with screen readers
- **Color Contrast**: Maintain proper contrast ratios

### Error Handling
- **Fallbacks**: Provide fallback images
- **Error States**: Handle loading and error states
- **Retry Logic**: Implement retry mechanisms
- **User Feedback**: Show appropriate error messages

## 🔧 Configuration

### Environment Variables
```bash
# Asset CDN URL
ASSET_CDN_URL=https://cdn.example.com

# Asset cache duration
ASSET_CACHE_DURATION=3600

# Enable asset optimization
ASSET_OPTIMIZATION=true
```

### Build Configuration
```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['cdn.example.com'],
    formats: ['image/webp', 'image/avif'],
  },
};
```

## 🚀 Advanced Usage

### Custom Asset Types
```typescript
interface CustomAssetConfig extends AssetConfig {
  customProperty: string;
  metadata: {
    author: string;
    license: string;
  };
}
```

### Dynamic Asset Loading
```typescript
const loadTenantAssets = async (tenantId: string) => {
  const response = await fetch(`/api/assets/tenant/${tenantId}`);
  const { assets, brandAssets } = await response.json();
  
  // Process and cache assets
  return { assets, brandAssets };
};
```

### Asset Optimization
```typescript
const optimizeAsset = (asset: AssetConfig) => {
  // Implement asset optimization logic
  return {
    ...asset,
    url: `${CDN_URL}/${asset.id}?optimize=true`,
  };
};
```

## 🐛 Troubleshooting

### Common Issues

1. **Assets not loading**
   - Check file paths and permissions
   - Verify CDN configuration
   - Check network requests

2. **Tenant assets not found**
   - Verify tenant ID
   - Check asset configuration
   - Ensure proper API endpoints

3. **Performance issues**
   - Optimize asset sizes
   - Implement lazy loading
   - Use appropriate formats

4. **Type errors**
   - Check TypeScript interfaces
   - Verify import statements
   - Update type definitions

### Debug Tools
- Use browser dev tools to inspect asset loading
- Check network tab for failed requests
- Verify asset URLs in console
- Test with different tenant configurations

## 📈 Performance Metrics

### Key Metrics
- **Asset Load Time**: < 2 seconds
- **Bundle Size**: Monitor asset bundle size
- **Cache Hit Rate**: > 80%
- **Error Rate**: < 1%

### Monitoring
- **Asset Performance**: Track loading times
- **Error Tracking**: Monitor failed requests
- **Usage Analytics**: Track asset usage
- **CDN Performance**: Monitor CDN metrics

## 🔄 Migration Guide

### From Legacy Assets
```typescript
// Old way
const logoUrl = '/assets/logo.png';

// New way
const { getAsset } = useAssetManager();
const logo = getAsset('logo-primary');
const logoUrl = logo?.url;
```

### Updating Existing Components
```typescript
// Before
<img src="/assets/logo.png" alt="Logo" />

// After
<AssetImage 
  asset={logoAsset}
  alt="Logo"
  className="w-32 h-32"
/>
```

## 📞 Support

For questions or issues:
1. Check the troubleshooting section
2. Review the API documentation
3. Create an issue in the repository
4. Contact the development team

## 🔗 Related Documentation

- [Component Library](../README.md)
- [Theme System](../theme/README.md)
- [Layout System](../Layout/README.md)
- [Testing Guide](../../testing/README.md)
