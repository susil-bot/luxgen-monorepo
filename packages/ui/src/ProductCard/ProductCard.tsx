import React, { useState } from 'react';
import { BaseComponentProps, TenantTheme } from '../types';
import { withSSR } from '../ssr';
import { defaultTheme } from '../theme';
import { 
  getProductCardStyles, 
  getProgressColor, 
  getTagColor,
  productCardClasses,
  productCardCSS 
} from './styles';

export interface ProductCardProps extends BaseComponentProps {
  tenantTheme?: TenantTheme;
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
  onEdit?: (productId: string) => void;
  onLike?: (productId: string, liked: boolean) => void;
  onAddToCart?: (productId: string) => void;
  onViewDetails?: (productId: string) => void;
  liked?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
  showActions?: boolean;
  showProgress?: boolean;
  showPrice?: boolean;
}

const ProductCardComponent: React.FC<ProductCardProps> = ({
  tenantTheme = defaultTheme,
  product,
  onEdit,
  onLike,
  onAddToCart,
  onViewDetails,
  liked = false,
  className = '',
  variant = 'default',
  showActions = true,
  showProgress = true,
  showPrice = true,
  ...props
}) => {
  const [isLiked, setIsLiked] = useState(liked);
  const [imageError, setImageError] = useState(false);

  const handleLike = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    onLike?.(product.id, newLikedState);
  };

  const handleEdit = () => {
    onEdit?.(product.id);
  };

  const handleAddToCart = () => {
    onAddToCart?.(product.id);
  };

  const handleViewDetails = () => {
    onViewDetails?.(product.id);
  };

  const styles = getProductCardStyles(
    tenantTheme,
    variant,
    product.tagColor,
    product.progress?.scoreColor,
    isLiked
  );

  return (
    <>
      <style>{productCardCSS}</style>
      <div
        className={`${productCardClasses.card} product-card-${variant} ${className}`}
        style={styles.card}
        onClick={handleViewDetails}
        {...props}
      >
      {/* Image Section */}
      <div
        className={productCardClasses.imageContainer}
        style={styles.imageContainer}
      >
        {!imageError ? (
          <img
            src={product.image}
            alt={product.imageAlt || product.title}
            className={productCardClasses.image}
            style={styles.image}
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            className={productCardClasses.imagePlaceholder}
            style={styles.imagePlaceholder}
          >
            📷
          </div>
        )}

        {/* Like Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleLike();
          }}
          className={productCardClasses.likeButton}
          style={styles.likeButton}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={isLiked ? '#EF4444' : 'none'}
            stroke={isLiked ? '#EF4444' : '#6B7280'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      {/* Content Section */}
      <div
        className={productCardClasses.content}
        style={styles.content}
      >
        {/* Tag */}
        {product.tag && (
          <div
            className={productCardClasses.tag}
            style={{
              ...styles.tag,
              backgroundColor: getTagColor(product.tagColor),
            }}
          >
            {product.tag}
          </div>
        )}

        {/* Title */}
        <h3
          className={productCardClasses.title}
          style={styles.title}
        >
          {product.title}
        </h3>

        {/* Progress Indicators */}
        {showProgress && product.progress && (
          <div
            className={productCardClasses.progress}
            style={styles.progress}
          >
            <div style={styles.progressItem}>
              <div style={styles.progressDot} />
              <span style={styles.progressText}>
                {product.progress.status}
              </span>
            </div>
            
            {product.progress.score !== undefined && (
              <div style={styles.progressItem}>
                <div 
                  style={{
                    ...styles.progressDot,
                    backgroundColor: getProgressColor(product.progress.score, product.progress.scoreColor),
                  }}
                />
                <span style={styles.progressText}>
                  score: {product.progress.score}%
                </span>
              </div>
            )}
          </div>
        )}

        {/* Price Section */}
        {showPrice && (product.price || product.originalPrice) && (
          <div
            className={productCardClasses.price}
            style={styles.price}
          >
            {product.price && (
              <span style={styles.currentPrice}>
                {product.price}
              </span>
            )}
            {product.originalPrice && (
              <span style={styles.originalPrice}>
                {product.originalPrice}
              </span>
            )}
            {product.discount && (
              <span style={styles.discount}>
                -{product.discount}%
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div
            className={productCardClasses.actions}
            style={styles.actions}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEdit();
              }}
              className={productCardClasses.editButton}
              style={styles.editButton}
            >
              Edit Product
            </button>
            
            {onAddToCart && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart();
                }}
                className={productCardClasses.addToCartButton}
                style={styles.addToCartButton}
              >
                Add to Cart
              </button>
            )}
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export const ProductCard = withSSR(ProductCardComponent);