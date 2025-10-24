import React from 'react';
import { BaseComponentProps, TenantTheme, VariantProps } from '../types';
import { withSSR } from '../ssr';
import { defaultTheme } from '../theme';

export interface CardProps extends BaseComponentProps {
  tenantTheme?: TenantTheme;
  children: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  size?: 'small' | 'medium' | 'large';
  padding?: 'none' | 'small' | 'medium' | 'large';
  shadow?: 'none' | 'small' | 'medium' | 'large';
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  image?: string;
  imageAlt?: string;
  imagePosition?: 'top' | 'bottom' | 'left' | 'right';
}

const CardComponent: React.FC<CardProps> = ({
  tenantTheme = defaultTheme,
  className = '',
  style,
  children,
  title,
  description,
  icon,
  variant = 'default',
  size = 'medium',
  padding = 'medium',
  shadow = 'medium',
  hover = false,
  clickable = false,
  onClick,
  header,
  footer,
  image,
  imageAlt = '',
  imagePosition = 'top',
  ...props
}) => {
  const getVariantStyles = () => {
    const variantStyles = {
      default: {
        backgroundColor: tenantTheme.colors.background,
        border: `1px solid ${tenantTheme.colors.border}`,
        borderRadius: '0.5rem',
      },
      elevated: {
        backgroundColor: tenantTheme.colors.background,
        border: 'none',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      outlined: {
        backgroundColor: 'transparent',
        border: `2px solid ${tenantTheme.colors.border}`,
        borderRadius: '0.5rem',
      },
      filled: {
        backgroundColor: tenantTheme.colors.backgroundSecondary,
        border: 'none',
        borderRadius: '0.5rem',
      },
    };
    
    return variantStyles[variant];
  };

  const getSizeStyles = () => {
    const sizeStyles = {
      small: {
        fontSize: '0.875rem',
        minHeight: '8rem',
      },
      medium: {
        fontSize: '1rem',
        minHeight: '10rem',
      },
      large: {
        fontSize: '1.125rem',
        minHeight: '12rem',
      },
    };
    
    return sizeStyles[size];
  };

  const getPaddingStyles = () => {
    const paddingStyles = {
      none: '0',
      small: '0.75rem',
      medium: '1rem',
      large: '1.5rem',
    };
    
    return paddingStyles[padding];
  };

  const getShadowStyles = () => {
    const shadowStyles = {
      none: 'none',
      small: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      large: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    };
    
    return shadowStyles[shadow];
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();
  const paddingValue = getPaddingStyles();
  const shadowValue = getShadowStyles();

  const styles = {
    ...style,
    fontFamily: tenantTheme.fonts.primary,
    color: tenantTheme.colors.text,
    ...variantStyles,
    ...sizeStyles,
    boxShadow: shadowValue,
    padding: paddingValue,
    cursor: clickable ? 'pointer' : 'default',
    transition: hover || clickable ? 'all 0.2s ease' : 'none',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: imagePosition === 'left' || imagePosition === 'right' ? 'row' : 'column',
  };

  const handleClick = () => {
    if (clickable && onClick) {
      onClick();
    }
  };

  const renderImage = () => {
    if (!image) return null;
    
    return (
      <img
        src={image}
        alt={imageAlt}
        style={{
          width: imagePosition === 'left' || imagePosition === 'right' ? '40%' : '100%',
          height: imagePosition === 'left' || imagePosition === 'right' ? 'auto' : '200px',
          objectFit: 'cover',
          order: imagePosition === 'bottom' || imagePosition === 'right' ? 1 : 0,
        }}
      />
    );
  };

  const renderHeader = () => {
    if (!header && !title && !icon) return null;
    
    return (
      <div
        className="card-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: children ? '1rem' : '0',
          padding: paddingValue,
          paddingBottom: '0',
        }}
      >
        {icon && (
          <div
            className="card-icon"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '2rem',
              height: '2rem',
              color: tenantTheme.colors.primary,
              fontSize: '1.25rem',
            }}
          >
            {icon}
          </div>
        )}
        <div style={{ flex: 1 }}>
          {title && (
            <h3
              className="card-title"
              style={{
                margin: 0,
                fontSize: '1.125rem',
                fontWeight: '600',
                color: tenantTheme.colors.text,
                lineHeight: '1.4',
              }}
            >
              {title}
            </h3>
          )}
          {description && (
            <p
              className="card-description"
              style={{
                margin: title ? '0.25rem 0 0 0' : '0',
                fontSize: '0.875rem',
                color: tenantTheme.colors.textSecondary,
                lineHeight: '1.5',
              }}
            >
              {description}
            </p>
          )}
        </div>
        {header}
      </div>
    );
  };

  const renderFooter = () => {
    if (!footer) return null;
    
    return (
      <div
        className="card-footer"
        style={{
          padding: paddingValue,
          paddingTop: '0',
          borderTop: `1px solid ${tenantTheme.colors.border}`,
          marginTop: 'auto',
        }}
      >
        {footer}
      </div>
    );
  };

  return (
    <div
      className={`card card-${variant} card-${size} ${clickable ? 'card-clickable' : ''} ${hover ? 'card-hover' : ''} ${className}`}
      style={styles as React.CSSProperties}
      onClick={handleClick}
      {...props}
    >
      {image && imagePosition === 'top' && renderImage()}
      {image && imagePosition === 'left' && renderImage()}
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' } as React.CSSProperties}>
        {renderHeader()}
        
        <div
          className="card-content"
          style={{
            flex: 1,
            padding: paddingValue,
            paddingTop: title || description || icon ? '0' : paddingValue,
          }}
        >
          {children}
        </div>
        
        {renderFooter()}
      </div>
      
      {image && imagePosition === 'right' && renderImage()}
      {image && imagePosition === 'bottom' && renderImage()}
    </div>
  );
};

export const Card = withSSR(CardComponent);
