import { TenantTheme } from '../types';
import { defaultTheme } from '../theme';

export interface ProductCardData {
  product: {
    id: string;
    title: string;
    tag?: string;
    tagColor?: string;
    image: string;
    imageAlt?: string;
    progress?: {
      status: string;
      score?: number;
      scoreColor?: string;
    };
    price?: string;
    originalPrice?: string;
    discount?: number;
  };
  tenantTheme: TenantTheme;
  variant: 'default' | 'compact' | 'detailed';
  showActions: boolean;
  showProgress: boolean;
  showPrice: boolean;
}

export const fetchProductCardData = async (
  productId: string,
  tenantId?: string
): Promise<ProductCardData> => {
  // Mock data - replace with actual API call
  const mockProduct = {
    id: productId,
    title: 'Role-Based Modules',
    tag: 'Tech talk',
    tagColor: '#8B5CF6',
    image: '/api/products/placeholder.jpg',
    imageAlt: 'Product image',
    progress: {
      status: 'Completed',
      score: 50,
      scoreColor: '#F59E0B',
    },
    price: '$99.99',
    originalPrice: '$149.99',
    discount: 33,
  };

  // Mock tenant theme - replace with actual tenant lookup
  const tenantTheme = tenantId === 'premium' 
    ? {
        ...defaultTheme,
        colors: {
          ...defaultTheme.colors,
          primary: '#8B5CF6',
          primaryDark: '#7C3AED',
        },
      }
    : defaultTheme;

  return {
    product: mockProduct,
    tenantTheme,
    variant: 'default',
    showActions: true,
    showProgress: true,
    showPrice: true,
  };
};

export const fetchProductCardSSR = async (
  productId: string,
  tenantId?: string
): Promise<{ html: string; styles: string }> => {
  const data = await fetchProductCardData(productId, tenantId);
  
  const html = `
    <div class="product-card product-card-${data.variant}" style="
      width: ${data.variant === 'compact' ? '240px' : data.variant === 'detailed' ? '320px' : '280px'};
      min-height: ${data.variant === 'compact' ? '320px' : data.variant === 'detailed' ? '480px' : '400px'};
      background-color: #FFFFFF;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      overflow: hidden;
      position: relative;
      transition: all 0.2s ease;
      cursor: pointer;
      font-family: ${data.tenantTheme.fonts.primary};
      color: ${data.tenantTheme.colors.text};
    ">
      <!-- Image Section -->
      <div class="product-card-image" style="
        position: relative;
        width: 100%;
        height: ${data.variant === 'compact' ? '160px' : data.variant === 'detailed' ? '240px' : '200px'};
        overflow: hidden;
      ">
        <img 
          src="${data.product.image}" 
          alt="${data.product.imageAlt || data.product.title}"
          style="
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.2s ease;
          "
        />
        
        <!-- Like Button -->
        <button style="
          position: absolute;
          top: 12px;
          right: 12px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.9);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          z-index: 2;
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      <!-- Content Section -->
      <div class="product-card-content" style="
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      ">
        ${data.product.tag ? `
          <!-- Tag -->
          <div class="product-card-tag" style="
            display: inline-block;
            padding: 4px 8px;
            border-radius: 6px;
            background-color: ${data.product.tagColor || '#8B5CF6'};
            color: #FFFFFF;
            font-size: 0.75rem;
            font-weight: 500;
            align-self: flex-start;
          ">
            ${data.product.tag}
          </div>
        ` : ''}

        <!-- Title -->
        <h3 class="product-card-title" style="
          margin: 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #1F2937;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        ">
          ${data.product.title}
        </h3>

        ${data.showProgress && data.product.progress ? `
          <!-- Progress Indicators -->
          <div class="product-card-progress" style="
            display: flex;
            flex-direction: column;
            gap: 8px;
          ">
            <div style="
              display: flex;
              align-items: center;
              gap: 8px;
            ">
              <div style="
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background-color: #10B981;
              "></div>
              <span style="
                font-size: 0.875rem;
                color: #6B7280;
                font-weight: 500;
              ">
                ${data.product.progress.status}
              </span>
            </div>
            
            ${data.product.progress.score !== undefined ? `
              <div style="
                display: flex;
                align-items: center;
                gap: 8px;
              ">
                <div style="
                  width: 8px;
                  height: 8px;
                  border-radius: 50%;
                  background-color: ${data.product.progress.scoreColor || '#F59E0B'};
                "></div>
                <span style="
                  font-size: 0.875rem;
                  color: #6B7280;
                  font-weight: 500;
                ">
                  score: ${data.product.progress.score}%
                </span>
              </div>
            ` : ''}
          </div>
        ` : ''}

        ${data.showPrice && (data.product.price || data.product.originalPrice) ? `
          <!-- Price Section -->
          <div class="product-card-price" style="
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: auto;
          ">
            ${data.product.price ? `
              <span style="
                font-size: 1.125rem;
                font-weight: 600;
                color: #1F2937;
              ">
                ${data.product.price}
              </span>
            ` : ''}
            ${data.product.originalPrice ? `
              <span style="
                font-size: 0.875rem;
                color: #9CA3AF;
                text-decoration: line-through;
              ">
                ${data.product.originalPrice}
              </span>
            ` : ''}
            ${data.product.discount ? `
              <span style="
                font-size: 0.75rem;
                color: #EF4444;
                font-weight: 500;
                background-color: #FEF2F2;
                padding: 2px 6px;
                border-radius: 4px;
              ">
                -${data.product.discount}%
              </span>
            ` : ''}
          </div>
        ` : ''}

        ${data.showActions ? `
          <!-- Actions -->
          <div class="product-card-actions" style="
            display: flex;
            gap: 8px;
            margin-top: 12px;
          ">
            <button style="
              flex: 1;
              padding: 8px 16px;
              background-color: #F3F4F6;
              color: #374151;
              border: none;
              border-radius: 6px;
              font-size: 0.875rem;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s ease;
            ">
              Edit Product
            </button>
          </div>
        ` : ''}
      </div>
    </div>
  `;

  const styles = `
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
    
    .product-card-actions button:hover {
      background-color: #E5E7EB;
    }
  `;

  return { html, styles };
};
