import React from 'react';
import { BaseComponentProps, TenantTheme, VariantProps } from '../types';
import { withSSR } from '../ssr';
import { defaultTheme } from '../theme';

export interface TextProps extends BaseComponentProps, VariantProps {
  tenantTheme?: TenantTheme;
  text: string;
  variant?: 'normal' | 'muted' | 'small' | 'large' | 'lead' | 'caption';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right' | 'justify';
  color?: string;
  truncate?: boolean;
  as?: 'p' | 'span' | 'div' | 'label';
}

const TextComponent: React.FC<TextProps> = ({
  tenantTheme = defaultTheme,
  className = '',
  style,
  text,
  variant = 'normal',
  weight = 'normal',
  align = 'left',
  color,
  truncate = false,
  as: Component = 'p',
  ...props
}) => {
  const getVariantColor = () => {
    if (color) return color;
    
    const variantColors = {
      primary: tenantTheme.colors.text,
      secondary: tenantTheme.colors.textSecondary,
      success: tenantTheme.colors.success,
      error: tenantTheme.colors.error,
      warning: tenantTheme.colors.warning,
      info: tenantTheme.colors.info,
    };
    
    return variantColors[props.variant] || tenantTheme.colors.text;
  };

  const getVariantSize = () => {
    const sizeMap = {
      caption: '0.75rem',
      small: '0.875rem',
      normal: '1rem',
      large: '1.125rem',
      lead: '1.25rem',
      muted: '1rem',
    };
    
    return sizeMap[variant];
  };

  const getVariantWeight = () => {
    if (weight !== 'normal') return weight;
    
    const weightMap = {
      caption: 'normal',
      small: 'normal',
      normal: 'normal',
      large: 'medium',
      lead: 'medium',
      muted: 'normal',
    };
    
    return weightMap[variant];
  };

  const styles = {
    ...style,
    fontFamily: tenantTheme.fonts.primary,
    color: getVariantColor(),
    fontSize: getVariantSize(),
    fontWeight: getVariantWeight(),
    textAlign: align,
    ...(truncate && {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    }),
  };

  return (
    <Component
      className={`text text-${variant} ${className}`}
      style={styles}
      {...props}
    >
      {text}
    </Component>
  );
};

export const Text = withSSR(TextComponent);
