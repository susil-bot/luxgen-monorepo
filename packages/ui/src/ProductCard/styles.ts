import { TenantTheme } from '../types';

export interface ProductCardStyles {
  card: React.CSSProperties;
  imageContainer: React.CSSProperties;
  image: React.CSSProperties;
  likeButton: React.CSSProperties;
  likeButtonHover: React.CSSProperties;
  content: React.CSSProperties;
  tag: React.CSSProperties;
  title: React.CSSProperties;
  progress: React.CSSProperties;
  progressItem: React.CSSProperties;
  progressDot: React.CSSProperties;
  progressText: React.CSSProperties;
  price: React.CSSProperties;
  currentPrice: React.CSSProperties;
  originalPrice: React.CSSProperties;
  discount: React.CSSProperties;
  actions: React.CSSProperties;
  editButton: React.CSSProperties;
  editButtonHover: React.CSSProperties;
  addToCartButton: React.CSSProperties;
  addToCartButtonHover: React.CSSProperties;
  imagePlaceholder: React.CSSProperties;
}

export const getVariantStyles = (variant: 'default' | 'compact' | 'detailed') => {
  const variants = {
    default: {
      width: '280px',
      minHeight: '400px',
      imageHeight: '200px',
    },
    compact: {
      width: '240px',
      minHeight: '320px',
      imageHeight: '160px',
    },
    detailed: {
      width: '320px',
      minHeight: '480px',
      imageHeight: '240px',
    },
  };
  return variants[variant];
};

export const getProductCardStyles = (
  tenantTheme: TenantTheme,
  variant: 'default' | 'compact' | 'detailed',
  tagColor?: string,
  scoreColor?: string,
  liked: boolean = false
): ProductCardStyles => {
  const variantStyles = getVariantStyles(variant);
  
  return {
    card: {
      width: variantStyles.width,
      minHeight: variantStyles.minHeight,
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      overflow: 'hidden',
      position: 'relative',
      transition: 'all 0.2s ease',
      cursor: 'pointer',
      fontFamily: tenantTheme.fonts.primary,
      color: tenantTheme.colors.text,
    },

    imageContainer: {
      position: 'relative',
      width: '100%',
      height: variantStyles.imageHeight,
      overflow: 'hidden',
    },

    image: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transition: 'transform 0.2s ease',
    },

    likeButton: {
      position: 'absolute',
      top: '12px',
      right: '12px',
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      zIndex: 2,
    },

    likeButtonHover: {
      backgroundColor: 'rgba(255, 255, 255, 1)',
      transform: 'scale(1.1)',
    },

    content: {
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    },

    tag: {
      display: 'inline-block',
      padding: '4px 8px',
      borderRadius: '6px',
      backgroundColor: tagColor || '#8B5CF6',
      color: '#FFFFFF',
      fontSize: '0.75rem',
      fontWeight: '500',
      alignSelf: 'flex-start',
    },

    title: {
      margin: 0,
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#1F2937',
      lineHeight: '1.4',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
    },

    progress: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },

    progressItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },

    progressDot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: '#10B981',
    },

    progressText: {
      fontSize: '0.875rem',
      color: '#6B7280',
      fontWeight: '500',
    },

    price: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginTop: 'auto',
    },

    currentPrice: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#1F2937',
    },

    originalPrice: {
      fontSize: '0.875rem',
      color: '#9CA3AF',
      textDecoration: 'line-through',
    },

    discount: {
      fontSize: '0.75rem',
      color: '#EF4444',
      fontWeight: '500',
      backgroundColor: '#FEF2F2',
      padding: '2px 6px',
      borderRadius: '4px',
    },

    actions: {
      display: 'flex',
      gap: '8px',
      marginTop: '12px',
    },

    editButton: {
      flex: 1,
      padding: '8px 16px',
      backgroundColor: '#F3F4F6',
      color: '#374151',
      border: 'none',
      borderRadius: '6px',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },

    editButtonHover: {
      backgroundColor: '#E5E7EB',
    },

    addToCartButton: {
      padding: '8px 12px',
      backgroundColor: tenantTheme.colors.primary,
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '6px',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },

    addToCartButtonHover: {
      backgroundColor: (tenantTheme.colors as any).primaryDark || tenantTheme.colors.primary,
      transform: 'translateY(-1px)',
    },

    imagePlaceholder: {
      width: '100%',
      height: '100%',
      backgroundColor: '#F3F4F6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#9CA3AF',
      fontSize: '1.5rem',
    },
  };
};

export const getProgressColor = (score?: number, customColor?: string): string => {
  if (customColor) {
    return customColor;
  }
  
  if (score === undefined) {
    return '#F59E0B';
  }
  
  if (score >= 80) return '#10B981'; // green
  if (score >= 60) return '#F59E0B'; // yellow
  if (score >= 40) return '#F97316'; // orange
  return '#EF4444'; // red
};

export const getTagColor = (customColor?: string): string => {
  return customColor || '#8B5CF6';
};

// CSS classes for additional styling
export const productCardClasses = {
  card: 'product-card',
  cardHover: 'product-card:hover',
  imageContainer: 'product-card-image',
  image: 'product-card-image img',
  imageHover: 'product-card-image:hover img',
  imagePlaceholder: 'product-card-image-placeholder',
  likeButton: 'product-card-like-button',
  content: 'product-card-content',
  tag: 'product-card-tag',
  title: 'product-card-title',
  progress: 'product-card-progress',
  price: 'product-card-price',
  actions: 'product-card-actions',
  editButton: 'product-card-edit-button',
  addToCartButton: 'product-card-add-to-cart-button',
};

// CSS styles for additional hover effects and animations
export const productCardCSS = `
  .product-card {
    transition: all 0.2s ease;
  }
  
  .product-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.1);
  }
  
  .product-card-image img {
    transition: transform 0.2s ease;
  }
  
  .product-card-image:hover img {
    transform: scale(1.05);
  }
  
  .product-card-like-button:hover {
    background-color: rgba(255, 255, 255, 1) !important;
    transform: scale(1.1);
  }
  
  .product-card-edit-button:hover {
    background-color: #E5E7EB !important;
  }
  
  .product-card-add-to-cart-button:hover {
    transform: translateY(-1px);
  }
`;
