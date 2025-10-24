import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AssetImage, AssetIcon, AssetLogo, AssetBackground } from './AssetUtils';
import { AssetConfig, BrandAssets } from './AssetManager';

// Mock Image constructor
const mockImage = {
  onload: null,
  onerror: null,
  src: '',
};

Object.defineProperty(global, 'Image', {
  value: jest.fn(() => mockImage),
  writable: true,
});

describe('AssetImage', () => {
  const mockAsset: AssetConfig = {
    id: 'test-image',
    name: 'Test Image',
    type: 'image',
    category: 'ui',
    url: '/test-image.jpg',
    alt: 'Test Image Alt',
    dimensions: { width: 100, height: 100 },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders image with correct attributes', () => {
    render(<AssetImage asset={mockAsset} />);
    
    const img = screen.getByAltText('Test Image Alt');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/test-image.jpg');
    expect(img).toHaveAttribute('alt', 'Test Image Alt');
  });

  it('applies custom className', () => {
    render(<AssetImage asset={mockAsset} className="custom-class" />);
    
    const img = screen.getByAltText('Test Image Alt');
    expect(img).toHaveClass('custom-class');
  });

  it('applies custom style', () => {
    const customStyle = { width: '200px', height: '200px' };
    render(<AssetImage asset={mockAsset} style={customStyle} />);
    
    const img = screen.getByAltText('Test Image Alt');
    expect(img).toHaveStyle(customStyle);
  });

  it('shows loading spinner initially', () => {
    render(<AssetImage asset={mockAsset} />);
    
    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
  });

  it('shows fallback image on error', async () => {
    render(<AssetImage asset={mockAsset} fallback="/fallback.jpg" />);
    
    const img = screen.getByAltText('Test Image Alt');
    fireEvent.error(img);
    
    await waitFor(() => {
      const fallbackImg = screen.getByAltText('Test Image Alt');
      expect(fallbackImg).toHaveAttribute('src', '/fallback.jpg');
    });
  });

  it('shows error message when no fallback provided', async () => {
    render(<AssetImage asset={mockAsset} />);
    
    const img = screen.getByAltText('Test Image Alt');
    fireEvent.error(img);
    
    await waitFor(() => {
      expect(screen.getByText('Image not found')).toBeInTheDocument();
    });
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<AssetImage asset={mockAsset} onClick={handleClick} />);
    
    const img = screen.getByAltText('Test Image Alt');
    fireEvent.click(img);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies loading attribute', () => {
    render(<AssetImage asset={mockAsset} loading="eager" />);
    
    const img = screen.getByAltText('Test Image Alt');
    expect(img).toHaveAttribute('loading', 'eager');
  });

  it('applies sizes attribute', () => {
    render(<AssetImage asset={mockAsset} sizes="(max-width: 768px) 100vw, 50vw" />);
    
    const img = screen.getByAltText('Test Image Alt');
    expect(img).toHaveAttribute('sizes', '(max-width: 768px) 100vw, 50vw');
  });
});

describe('AssetIcon', () => {
  const mockAsset: AssetConfig = {
    id: 'test-icon',
    name: 'Test Icon',
    type: 'icon',
    category: 'ui',
    url: '/test-icon.svg',
    alt: 'Test Icon Alt',
    dimensions: { width: 24, height: 24 },
  };

  it('renders icon with correct attributes', () => {
    render(<AssetIcon asset={mockAsset} />);
    
    const img = screen.getByAltText('Test Icon Alt');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/test-icon.svg');
  });

  it('applies custom size', () => {
    render(<AssetIcon asset={mockAsset} size={32} />);
    
    const img = screen.getByAltText('Test Icon Alt');
    expect(img).toHaveStyle({ width: '32px', height: '32px' });
  });

  it('applies custom size as string', () => {
    render(<AssetIcon asset={mockAsset} size="2rem" />);
    
    const img = screen.getByAltText('Test Icon Alt');
    expect(img).toHaveStyle({ width: '2rem', height: '2rem' });
  });

  it('applies custom color', () => {
    render(<AssetIcon asset={mockAsset} color="#FF0000" />);
    
    const img = screen.getByAltText('Test Icon Alt');
    expect(img).toHaveStyle({ color: '#FF0000' });
  });

  it('applies custom className', () => {
    render(<AssetIcon asset={mockAsset} className="custom-icon" />);
    
    const img = screen.getByAltText('Test Icon Alt');
    expect(img).toHaveClass('custom-icon');
  });

  it('shows placeholder for non-SVG icons', () => {
    const nonSvgAsset: AssetConfig = {
      ...mockAsset,
      url: '/test-icon.png',
    };
    
    render(<AssetIcon asset={nonSvgAsset} />);
    
    expect(screen.getByText('Icon')).toBeInTheDocument();
  });
});

describe('AssetLogo', () => {
  const mockBrandAssets: BrandAssets = {
    logo: {
      primary: {
        id: 'test-logo',
        name: 'Test Logo',
        type: 'logo',
        category: 'brand',
        url: '/test-logo.svg',
        alt: 'Test Logo',
        dimensions: { width: 200, height: 60 },
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

  it('renders logo with correct attributes', () => {
    render(<AssetLogo brandAssets={mockBrandAssets} />);
    
    const img = screen.getByAltText('Test Logo');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/test-logo.svg');
  });

  it('renders secondary logo variant', () => {
    const brandAssetsWithSecondary: BrandAssets = {
      ...mockBrandAssets,
      logo: {
        ...mockBrandAssets.logo,
        secondary: {
          id: 'test-logo-secondary',
          name: 'Test Logo Secondary',
          type: 'logo',
          category: 'brand',
          url: '/test-logo-secondary.svg',
          alt: 'Test Logo Secondary',
          dimensions: { width: 200, height: 60 },
        },
      },
    };
    
    render(<AssetLogo brandAssets={brandAssetsWithSecondary} variant="secondary" />);
    
    const img = screen.getByAltText('Test Logo Secondary');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/test-logo-secondary.svg');
  });

  it('applies custom size', () => {
    render(<AssetLogo brandAssets={mockBrandAssets} size={100} />);
    
    const container = screen.getByAltText('Test Logo').parentElement;
    expect(container).toHaveStyle({ width: '100px', height: '100px' });
  });

  it('shows text when showText is true', () => {
    render(<AssetLogo brandAssets={mockBrandAssets} showText={true} />);
    
    expect(screen.getByText('Test Logo')).toBeInTheDocument();
  });

  it('does not show text when showText is false', () => {
    render(<AssetLogo brandAssets={mockBrandAssets} showText={false} />);
    
    expect(screen.queryByText('Test Logo')).not.toBeInTheDocument();
  });

  it('shows placeholder when logo is missing', () => {
    const brandAssetsWithoutLogo: BrandAssets = {
      ...mockBrandAssets,
      logo: {
        primary: {
          id: 'missing-logo',
          name: 'Missing Logo',
          type: 'logo',
          category: 'brand',
          url: '',
          alt: 'Missing Logo',
          dimensions: { width: 200, height: 60 },
        },
      },
    };
    
    render(<AssetLogo brandAssets={brandAssetsWithoutLogo} />);
    
    expect(screen.getByText('Logo')).toBeInTheDocument();
  });
});

describe('AssetBackground', () => {
  const mockAsset: AssetConfig = {
    id: 'test-background',
    name: 'Test Background',
    type: 'background',
    category: 'ui',
    url: '/test-background.jpg',
    alt: 'Test Background',
    dimensions: { width: 1920, height: 1080 },
  };

  it('renders background with correct style', () => {
    render(<AssetBackground asset={mockAsset} />);
    
    const div = screen.getByRole('img', { hidden: true });
    expect(div).toHaveStyle({
      backgroundImage: 'url(/test-background.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    });
  });

  it('applies custom className', () => {
    render(<AssetBackground asset={mockAsset} className="custom-bg" />);
    
    const div = screen.getByRole('img', { hidden: true });
    expect(div).toHaveClass('custom-bg');
  });

  it('applies custom style', () => {
    const customStyle = { opacity: 0.5 };
    render(<AssetBackground asset={mockAsset} style={customStyle} />);
    
    const div = screen.getByRole('img', { hidden: true });
    expect(div).toHaveStyle(customStyle);
  });

  it('renders overlay when enabled', () => {
    render(
      <AssetBackground 
        asset={mockAsset} 
        overlay={true}
        overlayColor="black"
        overlayOpacity={0.5}
      />
    );
    
    const overlay = screen.getByRole('img', { hidden: true }).querySelector('.absolute');
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveStyle({
      backgroundColor: 'black',
      opacity: 0.5,
    });
  });

  it('does not render overlay when disabled', () => {
    render(<AssetBackground asset={mockAsset} overlay={false} />);
    
    const overlay = screen.getByRole('img', { hidden: true }).querySelector('.absolute');
    expect(overlay).not.toBeInTheDocument();
  });
});
