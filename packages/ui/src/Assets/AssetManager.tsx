import React, { createContext, useContext, useState, useEffect } from 'react';
import { defaultTheme } from '../theme';
import { TenantTheme } from '../types';

export interface AssetConfig {
  id: string;
  name: string;
  type: 'image' | 'icon' | 'logo' | 'background' | 'illustration' | 'animation';
  category: 'brand' | 'ui' | 'content' | 'marketing';
  url: string;
  alt?: string;
  description?: string;
  dimensions?: {
    width: number;
    height: number;
  };
  variants?: {
    [key: string]: string;
  };
  tenant?: string;
  global?: boolean;
}

export interface BrandAssets {
  logo: {
    primary: AssetConfig;
    secondary?: AssetConfig;
    icon?: AssetConfig;
    favicon?: AssetConfig;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    muted: string;
  };
  typography: {
    fontFamily: string;
    headingFont?: string;
    bodyFont?: string;
  };
  images: {
    hero?: AssetConfig;
    background?: AssetConfig;
    placeholder?: AssetConfig;
  };
  icons: {
    [key: string]: AssetConfig;
  };
  illustrations: {
    [key: string]: AssetConfig;
  };
}

export interface AssetManagerContextType {
  assets: AssetConfig[];
  brandAssets: BrandAssets | null;
  tenantAssets: { [tenantId: string]: BrandAssets };
  loadAssets: (tenantId?: string) => Promise<void>;
  getAsset: (id: string, tenantId?: string) => AssetConfig | null;
  getBrandAssets: (tenantId?: string) => BrandAssets | null;
  addAsset: (asset: AssetConfig) => void;
  updateAsset: (id: string, updates: Partial<AssetConfig>) => void;
  removeAsset: (id: string) => void;
  loading: boolean;
  error: string | null;
}

const AssetManagerContext = createContext<AssetManagerContextType | null>(null);

export const useAssetManager = () => {
  const context = useContext(AssetManagerContext);
  if (!context) {
    throw new Error('useAssetManager must be used within an AssetManagerProvider');
  }
  return context;
};

export interface AssetManagerProviderProps {
  children: React.ReactNode;
  defaultAssets?: AssetConfig[];
  defaultBrandAssets?: BrandAssets;
  tenantId?: string;
  autoLoad?: boolean;
}

export const AssetManagerProvider: React.FC<AssetManagerProviderProps> = ({
  children,
  defaultAssets = [],
  defaultBrandAssets,
  tenantId,
  autoLoad = true,
}) => {
  const [assets, setAssets] = useState<AssetConfig[]>(defaultAssets);
  const [brandAssets, setBrandAssets] = useState<BrandAssets | null>(defaultBrandAssets || null);
  const [tenantAssets, setTenantAssets] = useState<{ [tenantId: string]: BrandAssets }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAssets = async (targetTenantId?: string) => {
    setLoading(true);
    setError(null);

    try {
      const currentTenantId = targetTenantId || tenantId;
      
      if (currentTenantId) {
        // Load tenant-specific assets
        const response = await fetch(`/api/assets/tenant/${currentTenantId}`);
        if (response.ok) {
          const tenantData = await response.json();
          setTenantAssets(prev => ({
            ...prev,
            [currentTenantId]: tenantData.brandAssets,
          }));
          setAssets(tenantData.assets);
        }
      } else {
        // Load global assets
        const response = await fetch('/api/assets/global');
        if (response.ok) {
          const globalData = await response.json();
          setAssets(globalData.assets);
          setBrandAssets(globalData.brandAssets);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assets');
      console.error('Asset loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getAsset = (id: string, targetTenantId?: string): AssetConfig | null => {
    const currentTenantId = targetTenantId || tenantId;
    
    // First try to find tenant-specific asset
    if (currentTenantId && tenantAssets[currentTenantId]) {
      const tenantAsset = findAssetInBrandAssets(tenantAssets[currentTenantId], id);
      if (tenantAsset) return tenantAsset;
    }
    
    // Then try global assets
    const globalAsset = findAssetInBrandAssets(brandAssets, id);
    if (globalAsset) return globalAsset;
    
    // Finally try the assets array
    return assets.find(asset => asset.id === id) || null;
  };

  const findAssetInBrandAssets = (brandAssets: BrandAssets | null, id: string): AssetConfig | null => {
    if (!brandAssets) return null;
    
    // Search in logo assets
    if (brandAssets.logo.primary.id === id) return brandAssets.logo.primary;
    if (brandAssets.logo.secondary?.id === id) return brandAssets.logo.secondary;
    if (brandAssets.logo.icon?.id === id) return brandAssets.logo.icon;
    if (brandAssets.logo.favicon?.id === id) return brandAssets.logo.favicon;
    
    // Search in images
    if (brandAssets.images.hero?.id === id) return brandAssets.images.hero;
    if (brandAssets.images.background?.id === id) return brandAssets.images.background;
    if (brandAssets.images.placeholder?.id === id) return brandAssets.images.placeholder;
    
    // Search in icons
    const iconAsset = Object.values(brandAssets.icons).find(asset => asset.id === id);
    if (iconAsset) return iconAsset;
    
    // Search in illustrations
    const illustrationAsset = Object.values(brandAssets.illustrations).find(asset => asset.id === id);
    if (illustrationAsset) return illustrationAsset;
    
    return null;
  };

  const getBrandAssets = (targetTenantId?: string): BrandAssets | null => {
    const currentTenantId = targetTenantId || tenantId;
    
    if (currentTenantId && tenantAssets[currentTenantId]) {
      return tenantAssets[currentTenantId];
    }
    
    return brandAssets;
  };

  const addAsset = (asset: AssetConfig) => {
    setAssets(prev => [...prev, asset]);
  };

  const updateAsset = (id: string, updates: Partial<AssetConfig>) => {
    setAssets(prev => prev.map(asset => 
      asset.id === id ? { ...asset, ...updates } : asset
    ));
  };

  const removeAsset = (id: string) => {
    setAssets(prev => prev.filter(asset => asset.id !== id));
  };

  useEffect(() => {
    if (autoLoad) {
      loadAssets();
    }
  }, [tenantId, autoLoad]);

  const value: AssetManagerContextType = {
    assets,
    brandAssets,
    tenantAssets,
    loadAssets,
    getAsset,
    getBrandAssets,
    addAsset,
    updateAsset,
    removeAsset,
    loading,
    error,
  };

  return (
    <AssetManagerContext.Provider value={value}>
      {children}
    </AssetManagerContext.Provider>
  );
};
