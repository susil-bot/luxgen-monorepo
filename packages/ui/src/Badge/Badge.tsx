import React from 'react';
import { BaseComponentProps, TenantTheme, VariantProps } from '../types';
import { withSSR } from '../ssr';
import { defaultTheme } from '../theme';

export interface BadgeProps extends BaseComponentProps, VariantProps {
  tenantTheme?: TenantTheme;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  size?: 'small' | 'medium' | 'large';
  shape?: 'rounded' | 'pill' | 'square';
  dot?: boolean;
  closable?: boolean;
  onClose?: () => void;
  icon?: React.ReactNode;
  maxWidth?: string | number;
}

const BadgeComponent: React.FC<BadgeProps> = ({
  tenantTheme = defaultTheme,
  className = '',
  style,
  children,
  variant = 'primary',
  size = 'medium',
  shape = 'rounded',
  dot = false,
  closable = false,
  onClose,
  icon,
  maxWidth,
  ...props
}) => {
  const getVariantColor = () => {
    const variantColors = {
      primary: tenantTheme.colors.primary,
      secondary: tenantTheme.colors.textSecondary,
      success: tenantTheme.colors.success,
      error: tenantTheme.colors.error,
      warning: tenantTheme.colors.warning,
      info: tenantTheme.colors.info,
    };
    
    return variantColors[variant];
  };

  const getVariantBackground = () => {
    const variantBackgrounds = {
      primary: `${tenantTheme.colors.primary}20`,
      secondary: `${tenantTheme.colors.textSecondary}20`,
      success: `${tenantTheme.colors.success}20`,
      error: `${tenantTheme.colors.error}20`,
      warning: `${tenantTheme.colors.warning}20`,
      info: `${tenantTheme.colors.info}20`,
    };
    
    return variantBackgrounds[variant];
  };

  const getSizeStyles = () => {
    const sizeMap = {
      small: {
        padding: '0.25rem 0.5rem',
        fontSize: '0.75rem',
        minHeight: '1.25rem',
      },
      medium: {
        padding: '0.375rem 0.75rem',
        fontSize: '0.875rem',
        minHeight: '1.5rem',
      },
      large: {
        padding: '0.5rem 1rem',
        fontSize: '1rem',
        minHeight: '1.75rem',
      },
    };
    
    return sizeMap[size];
  };

  const getShapeStyles = () => {
    const shapeMap = {
      rounded: '0.375rem',
      pill: '9999px',
      square: '0',
    };
    
    return shapeMap[shape];
  };

  const sizeStyles = getSizeStyles();
  const borderRadius = getShapeStyles();

  const styles = {
    ...style,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.25rem',
    fontFamily: tenantTheme.fonts.primary,
    fontWeight: '500',
    color: getVariantColor(),
    backgroundColor: getVariantBackground(),
    border: `1px solid ${getVariantColor()}40`,
    borderRadius,
    ...sizeStyles,
    ...(maxWidth && { maxWidth }),
    ...(dot && {
      width: '0.5rem',
      height: '0.5rem',
      padding: '0',
      minHeight: '0.5rem',
      borderRadius: '50%',
    }),
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose?.();
  };

  return (
    <span
      className={`badge badge-${variant} badge-${size} badge-${shape} ${className}`}
      style={styles}
      {...props}
    >
      {icon && !dot && (
        <span className="badge-icon">
          {icon}
        </span>
      )}
      
      {!dot && (
        <span className="badge-content">
          {children}
        </span>
      )}
      
      {closable && !dot && (
        <button
          type="button"
          className="badge-close"
          onClick={handleClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0',
            marginLeft: '0.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'inherit',
            fontSize: '0.75rem',
          }}
          aria-label="Close badge"
        >
          ×
        </button>
      )}
    </span>
  );
};

export const Badge = withSSR(BadgeComponent);
