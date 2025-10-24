import React, { useState } from 'react';
import { AssetConfig, BrandAssets } from './AssetManager';

export interface AssetImageProps {
  asset: AssetConfig;
  className?: string;
  style?: React.CSSProperties;
  fallback?: string;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  onClick?: () => void;
}

export const AssetImage: React.FC<AssetImageProps> = ({
  asset,
  className = '',
  style = {},
  fallback,
  loading = 'lazy',
  sizes,
  onClick,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  if (imageError && fallback) {
    return (
      <img
        src={fallback}
        alt={asset.alt || asset.name}
        className={className}
        style={style}
        loading={loading}
        sizes={sizes}
        onClick={onClick}
      />
    );
  }

  if (imageError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-200 text-gray-500 ${className}`}
        style={style}
        onClick={onClick}
      >
        <span className="text-sm">Image not found</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
        </div>
      )}
      <img
        src={asset.url}
        alt={asset.alt || asset.name}
        className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 ${className}`}
        style={style}
        loading={loading}
        sizes={sizes}
        onError={handleError}
        onLoad={handleLoad}
        onClick={onClick}
      />
    </div>
  );
};

export interface AssetIconProps {
  asset: AssetConfig;
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
  color?: string;
}

export const AssetIcon: React.FC<AssetIconProps> = ({
  asset,
  size = 24,
  className = '',
  style = {},
  color,
}) => {
  const iconStyle = {
    width: typeof size === 'number' ? `${size}px` : size,
    height: typeof size === 'number' ? `${size}px` : size,
    color,
    ...style,
  };

  if (asset.type === 'icon' && asset.url.endsWith('.svg')) {
    return (
      <img
        src={asset.url}
        alt={asset.alt || asset.name}
        className={className}
        style={iconStyle}
      />
    );
  }

  // For other icon types, you might want to use a different approach
  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={iconStyle}
    >
      <span className="text-xs text-gray-500">Icon</span>
    </div>
  );
};

export interface AssetLogoProps {
  brandAssets: BrandAssets;
  variant?: 'primary' | 'secondary' | 'icon';
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
  showText?: boolean;
}

export const AssetLogo: React.FC<AssetLogoProps> = ({
  brandAssets,
  variant = 'primary',
  size = 40,
  className = '',
  style = {},
  showText = true,
}) => {
  const logoAsset = brandAssets.logo[variant];
  
  if (!logoAsset) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-200 text-gray-500 ${className}`}
        style={{ width: size, height: size, ...style }}
      >
        <span className="text-xs">Logo</span>
      </div>
    );
  }

  const logoStyle = {
    width: typeof size === 'number' ? `${size}px` : size,
    height: typeof size === 'number' ? `${size}px` : size,
    ...style,
  };

  return (
    <div className={`flex items-center ${className}`} style={logoStyle}>
      <AssetImage
        asset={logoAsset}
        className="object-contain"
        style={{ width: '100%', height: '100%' }}
      />
      {showText && variant !== 'icon' && brandAssets.logo.primary.name && (
        <span className="ml-2 font-semibold text-lg">
          {brandAssets.logo.primary.name}
        </span>
      )}
    </div>
  );
};

export interface AssetBackgroundProps {
  asset: AssetConfig;
  className?: string;
  style?: React.CSSProperties;
  overlay?: boolean;
  overlayColor?: string;
  overlayOpacity?: number;
}

export const AssetBackground: React.FC<AssetBackgroundProps> = ({
  asset,
  className = '',
  style = {},
  overlay = false,
  overlayColor = 'black',
  overlayOpacity = 0.5,
}) => {
  const backgroundStyle = {
    backgroundImage: `url(${asset.url})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    ...style,
  };

  return (
    <div
      className={`relative ${className}`}
      style={backgroundStyle}
    >
      {overlay && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: overlayColor,
            opacity: overlayOpacity,
          }}
        />
      )}
    </div>
  );
};

// Utility functions
export const getAssetUrl = (asset: AssetConfig, variant?: string): string => {
  if (variant && asset.variants && asset.variants[variant]) {
    return asset.variants[variant];
  }
  return asset.url;
};

export const getAssetDimensions = (asset: AssetConfig): { width: number; height: number } => {
  if (asset.dimensions) {
    return asset.dimensions;
  }
  
  // Default dimensions based on type
  switch (asset.type) {
    case 'icon':
      return { width: 24, height: 24 };
    case 'logo':
      return { width: 200, height: 60 };
    case 'background':
      return { width: 1920, height: 1080 };
    case 'illustration':
      return { width: 400, height: 300 };
    default:
      return { width: 100, height: 100 };
  }
};

export const isAssetLoaded = (asset: AssetConfig): Promise<boolean> => {
  return new Promise((resolve) => {
    if (asset.type === 'image' || asset.type === 'logo' || asset.type === 'background') {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = asset.url;
    } else {
      resolve(true);
    }
  });
};

export const preloadAssets = async (assets: AssetConfig[]): Promise<void> => {
  const loadPromises = assets.map(asset => isAssetLoaded(asset));
  await Promise.all(loadPromises);
};

export const getBrandColors = (brandAssets: BrandAssets) => {
  return {
    primary: brandAssets.colors.primary,
    secondary: brandAssets.colors.secondary,
    accent: brandAssets.colors.accent,
    background: brandAssets.colors.background,
    text: brandAssets.colors.text,
    muted: brandAssets.colors.muted,
  };
};

export const getBrandTypography = (brandAssets: BrandAssets) => {
  return {
    fontFamily: brandAssets.typography.fontFamily,
    headingFont: brandAssets.typography.headingFont || brandAssets.typography.fontFamily,
    bodyFont: brandAssets.typography.bodyFont || brandAssets.typography.fontFamily,
  };
};
