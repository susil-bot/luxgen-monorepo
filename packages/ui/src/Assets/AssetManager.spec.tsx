import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AssetManagerProvider, useAssetManager } from './AssetManager';
import { AssetConfig, BrandAssets } from './AssetManager';

// Mock fetch
global.fetch = jest.fn();

// Test component to access context
const TestComponent: React.FC = () => {
  const { assets, brandAssets, loading, error, getAsset, getBrandAssets } = useAssetManager();
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="error">{error || 'No Error'}</div>
      <div data-testid="assets-count">{assets.length}</div>
      <div data-testid="brand-assets">{brandAssets ? 'Has Brand Assets' : 'No Brand Assets'}</div>
      <div data-testid="asset">{getAsset('test-asset')?.name || 'No Asset'}</div>
      <div data-testid="brand-asset">{getBrandAssets() ? 'Has Brand Assets' : 'No Brand Assets'}</div>
    </div>
  );
};

describe('AssetManager', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('renders with default props', () => {
    render(
      <AssetManagerProvider>
        <TestComponent />
      </AssetManagerProvider>
    );
    
    expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    expect(screen.getByTestId('error')).toHaveTextContent('No Error');
    expect(screen.getByTestId('assets-count')).toHaveTextContent('0');
  });

  it('renders with default assets', () => {
    const defaultAssets: AssetConfig[] = [
      {
        id: 'test-asset',
        name: 'Test Asset',
        type: 'image',
        category: 'ui',
        url: '/test.jpg',
        global: true,
      },
    ];

    render(
      <AssetManagerProvider defaultAssets={defaultAssets}>
        <TestComponent />
      </AssetManagerProvider>
    );
    
    expect(screen.getByTestId('assets-count')).toHaveTextContent('1');
    expect(screen.getByTestId('asset')).toHaveTextContent('Test Asset');
  });

  it('renders with default brand assets', () => {
    const defaultBrandAssets: BrandAssets = {
      logo: {
        primary: {
          id: 'test-logo',
          name: 'Test Logo',
          type: 'logo',
          category: 'brand',
          url: '/test-logo.svg',
          global: true,
        },
      },
      colors: {
        primary: '#000000',
        secondary: '#666666',
        accent: '#FF0000',
        background: '#FFFFFF',
        text: '#000000',
        muted: '#999999',
      },
      typography: {
        fontFamily: 'Arial, sans-serif',
      },
      images: {},
      icons: {},
      illustrations: {},
    };

    render(
      <AssetManagerProvider defaultBrandAssets={defaultBrandAssets}>
        <TestComponent />
      </AssetManagerProvider>
    );
    
    expect(screen.getByTestId('brand-assets')).toHaveTextContent('Has Brand Assets');
  });

  it('loads assets automatically when autoLoad is true', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        assets: [],
        brandAssets: null,
      }),
    });

    render(
      <AssetManagerProvider autoLoad={true}>
        <TestComponent />
      </AssetManagerProvider>
    );
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/assets/global');
    });
  });

  it('loads tenant assets when tenantId is provided', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        assets: [],
        brandAssets: null,
      }),
    });

    render(
      <AssetManagerProvider tenantId="demo" autoLoad={true}>
        <TestComponent />
      </AssetManagerProvider>
    );
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/assets/tenant/demo');
    });
  });

  it('handles loading state', async () => {
    (fetch as jest.Mock).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ assets: [], brandAssets: null }),
      }), 100))
    );

    render(
      <AssetManagerProvider autoLoad={true}>
        <TestComponent />
      </AssetManagerProvider>
    );
    
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading');
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });
  });

  it('handles error state', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(
      <AssetManagerProvider autoLoad={true}>
        <TestComponent />
      </AssetManagerProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Network error');
    });
  });

  it('does not load assets when autoLoad is false', () => {
    render(
      <AssetManagerProvider autoLoad={false}>
        <TestComponent />
      </AssetManagerProvider>
    );
    
    expect(fetch).not.toHaveBeenCalled();
  });

  it('finds assets by ID', () => {
    const defaultAssets: AssetConfig[] = [
      {
        id: 'test-asset',
        name: 'Test Asset',
        type: 'image',
        category: 'ui',
        url: '/test.jpg',
        global: true,
      },
    ];

    render(
      <AssetManagerProvider defaultAssets={defaultAssets}>
        <TestComponent />
      </AssetManagerProvider>
    );
    
    expect(screen.getByTestId('asset')).toHaveTextContent('Test Asset');
  });

  it('returns null for non-existent assets', () => {
    render(
      <AssetManagerProvider>
        <TestComponent />
      </AssetManagerProvider>
    );
    
    expect(screen.getByTestId('asset')).toHaveTextContent('No Asset');
  });

  it('finds brand assets by tenant', () => {
    const defaultBrandAssets: BrandAssets = {
      logo: {
        primary: {
          id: 'test-logo',
          name: 'Test Logo',
          type: 'logo',
          category: 'brand',
          url: '/test-logo.svg',
          global: true,
        },
      },
      colors: {
        primary: '#000000',
        secondary: '#666666',
        accent: '#FF0000',
        background: '#FFFFFF',
        text: '#000000',
        muted: '#999999',
      },
      typography: {
        fontFamily: 'Arial, sans-serif',
      },
      images: {},
      icons: {},
      illustrations: {},
    };

    render(
      <AssetManagerProvider defaultBrandAssets={defaultBrandAssets}>
        <TestComponent />
      </AssetManagerProvider>
    );
    
    expect(screen.getByTestId('brand-asset')).toHaveTextContent('Has Brand Assets');
  });
});

describe('useAssetManager hook', () => {
  it('throws error when used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = jest.fn();
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAssetManager must be used within an AssetManagerProvider');
    
    console.error = originalError;
  });
});
