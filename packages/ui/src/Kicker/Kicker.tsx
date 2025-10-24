import React from 'react';
import { BaseComponentProps, TenantTheme, VariantProps } from '../types';
import { withSSR } from '../ssr';
import { defaultTheme } from '../theme';

export interface KickerProps extends BaseComponentProps, VariantProps {
  tenantTheme?: TenantTheme;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  size?: 'small' | 'medium' | 'large';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right';
  uppercase?: boolean;
  underline?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const KickerComponent: React.FC<KickerProps> = ({
  tenantTheme = defaultTheme,
  className = '',
  style,
  children,
  variant = 'primary',
  size = 'medium',
  weight = 'medium',
  align = 'left',
  uppercase = true,
  underline = false,
  icon,
  iconPosition = 'left',
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

  const getSizeStyles = () => {
    const sizeMap = {
      small: {
        fontSize: '0.75rem',
        letterSpacing: '0.05em',
        lineHeight: '1.2',
      },
      medium: {
        fontSize: '0.875rem',
        letterSpacing: '0.1em',
        lineHeight: '1.3',
      },
      large: {
        fontSize: '1rem',
        letterSpacing: '0.15em',
        lineHeight: '1.4',
      },
    };
    
    return sizeMap[size];
  };

  const sizeStyles = getSizeStyles();

  const styles = {
    ...style,
    fontFamily: tenantTheme.fonts.primary,
    fontWeight: weight,
    color: getVariantColor(),
    textAlign: align,
    textTransform: uppercase ? 'uppercase' : 'none',
    textDecoration: underline ? 'underline' : 'none',
    textDecorationColor: getVariantColor(),
    textDecorationThickness: '2px',
    textUnderlineOffset: '0.25em',
    ...sizeStyles,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexDirection: iconPosition === 'right' ? 'row-reverse' : 'row',
  };

  return (
    <div
      className={`kicker kicker-${variant} kicker-${size} ${className}`}
      style={styles as React.CSSProperties}
      {...props}
    >
      {icon && (
        <span className="kicker-icon">
          {icon}
        </span>
      )}
      <span className="kicker-content">
        {children}
      </span>
    </div>
  );
};

export const Kicker = withSSR(KickerComponent);
