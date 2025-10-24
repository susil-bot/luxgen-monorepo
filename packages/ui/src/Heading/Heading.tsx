import React from 'react';
import { BaseComponentProps, TenantTheme, VariantProps } from '../types';
import { withSSR } from '../ssr';
import { defaultTheme } from '../theme';

export interface HeadingProps extends BaseComponentProps, VariantProps {
  tenantTheme?: TenantTheme;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
  align?: 'left' | 'center' | 'right' | 'justify';
  color?: string;
  truncate?: boolean;
}

const HeadingComponent: React.FC<HeadingProps> = ({
  tenantTheme = defaultTheme,
  className = '',
  style,
  level,
  text,
  size,
  weight = 'semibold',
  align = 'left',
  color,
  truncate = false,
  variant = 'primary',
  ...props
}) => {
  const getSizeClass = () => {
    if (size) return size;
    
    const sizeMap = {
      1: '6xl',
      2: '5xl',
      3: '4xl',
      4: '3xl',
      5: '2xl',
      6: 'xl',
    };
    
    return sizeMap[level];
  };

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
    
    return variantColors[variant] || tenantTheme.colors.text;
  };

  const styles = {
    ...style,
    fontFamily: tenantTheme.fonts.primary,
    color: getVariantColor(),
    textAlign: align,
    fontWeight: weight,
    ...(truncate && {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    }),
  };

  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
  const sizeClass = getSizeClass();

  const { loading, ...headingProps } = props;
  
  return (
    <HeadingTag
      className={`heading heading-${sizeClass} ${className}`}
      style={styles}
      {...headingProps}
    >
      {text}
    </HeadingTag>
  );
};

export const Heading = withSSR(HeadingComponent);
