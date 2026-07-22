import { TenantTheme } from '../types';

export interface ArrowStyles {
  button: React.CSSProperties;
  buttonHover: React.CSSProperties;
  buttonFocus: React.CSSProperties;
  buttonDisabled: React.CSSProperties;
  svg: React.CSSProperties;
  path: React.CSSProperties;
}

export const getSizeStyles = (size: 'small' | 'medium' | 'large') => {
  const sizes = {
    small: {
      width: '24px',
      height: '24px',
      iconSize: '16px',
    },
    medium: {
      width: '32px',
      height: '32px',
      iconSize: '20px',
    },
    large: {
      width: '40px',
      height: '40px',
      iconSize: '24px',
    },
  };
  return sizes[size];
};

export const getVariantStyles = (variant: 'default' | 'outline' | 'ghost', tenantTheme: TenantTheme) => {
  // Theme-aware colors
  const primaryColor = tenantTheme.colors.primary || '#3B82F6';
  const lightPrimary = tenantTheme.colors.primaryLight || '#E3F2FD';
  const darkPrimary = tenantTheme.colors.primaryDark || '#BBDEFB';
  const textColor = tenantTheme.colors.text || '#424242';
  const surfaceColor = tenantTheme.colors.surface || '#FFFFFF';
  const borderColor = tenantTheme.colors.border || '#D1D5DB';
  const textSecondary = tenantTheme.colors.textSecondary || '#6B7280';

  const variants = {
    default: {
      backgroundColor: lightPrimary, // Light blue circular button matching Figma
      color: textColor, // Dark gray arrow color matching Figma
      border: 'none',
      hoverBackgroundColor: darkPrimary, // Slightly darker blue on hover
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', // Subtle shadow
    },
    outline: {
      backgroundColor: surfaceColor,
      color: textColor,
      border: `1px solid ${borderColor}`,
      hoverBackgroundColor: tenantTheme.colors.surfaceHover || '#F9FAFB',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: textSecondary,
      border: 'none',
      hoverBackgroundColor: tenantTheme.colors.surfaceHover || '#F3F4F6',
      boxShadow: 'none',
    },
  };
  return variants[variant];
};

export const getDirectionStyles = (direction: 'left' | 'right' | 'up' | 'down') => {
  const directions = {
    left: { transform: 'rotate(0deg)' },
    right: { transform: 'rotate(180deg)' },
    up: { transform: 'rotate(-90deg)' },
    down: { transform: 'rotate(90deg)' },
  };
  return directions[direction];
};

export const getArrowStyles = (
  direction: 'left' | 'right' | 'up' | 'down',
  size: 'small' | 'medium' | 'large',
  variant: 'default' | 'outline' | 'ghost',
  disabled: boolean,
  tenantTheme: TenantTheme,
): ArrowStyles => {
  const sizeStyles = getSizeStyles(size);
  const variantStyles = getVariantStyles(variant, tenantTheme);
  const directionStyles = getDirectionStyles(direction);

  return {
    button: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: sizeStyles.width,
      height: sizeStyles.height,
      borderRadius: '50%',
      backgroundColor: variantStyles.backgroundColor,
      color: variantStyles.color,
      border: variantStyles.border,
      boxShadow: variantStyles.boxShadow,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'all 0.2s ease',
      outline: 'none',
      position: 'relative',
    },

    buttonHover: {
      backgroundColor: variantStyles.hoverBackgroundColor,
      transform: 'scale(1.05)',
    },

    buttonFocus: {
      boxShadow: `0 0 0 2px ${tenantTheme.colors.primary}`,
      outline: 'none',
    },

    buttonDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
      pointerEvents: 'none',
    },

    svg: {
      width: sizeStyles.iconSize,
      height: sizeStyles.iconSize,
      ...directionStyles,
      transition: 'transform 0.2s ease',
    },

    path: {
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      strokeWidth: 2,
      fill: 'none',
      stroke: 'currentColor',
    },
  };
};

// CSS classes for additional styling
export const arrowClasses = {
  button: 'arrow-button',
  buttonHover: 'arrow-button:hover',
  buttonFocus: 'arrow-button:focus',
  buttonDisabled: 'arrow-button:disabled',
  svg: 'arrow-icon',
  path: 'arrow-path',
};

// Hover/focus rules live in ./arrow.css (imported once from Arrow.tsx or _app.tsx).

// Utility functions for common arrow configurations
export const getArrowConfig = (
  direction: 'left' | 'right' | 'up' | 'down',
  size: 'small' | 'medium' | 'large' = 'medium',
  variant: 'default' | 'outline' | 'ghost' = 'default',
  disabled: boolean = false,
  tenantTheme: TenantTheme,
) => {
  return {
    styles: getArrowStyles(direction, size, variant, disabled, tenantTheme),
    classes: arrowClasses,
  };
};

// Predefined arrow configurations for common use cases
export const arrowConfigs = {
  carousel: {
    left: (tenantTheme: TenantTheme) => getArrowConfig('left', 'medium', 'default', false, tenantTheme),
    right: (tenantTheme: TenantTheme) => getArrowConfig('right', 'medium', 'default', false, tenantTheme),
  },
  navigation: {
    up: (tenantTheme: TenantTheme) => getArrowConfig('up', 'small', 'outline', false, tenantTheme),
    down: (tenantTheme: TenantTheme) => getArrowConfig('down', 'small', 'outline', false, tenantTheme),
    left: (tenantTheme: TenantTheme) => getArrowConfig('left', 'small', 'outline', false, tenantTheme),
    right: (tenantTheme: TenantTheme) => getArrowConfig('right', 'small', 'outline', false, tenantTheme),
  },
  ghost: {
    up: (tenantTheme: TenantTheme) => getArrowConfig('up', 'small', 'ghost', false, tenantTheme),
    down: (tenantTheme: TenantTheme) => getArrowConfig('down', 'small', 'ghost', false, tenantTheme),
    left: (tenantTheme: TenantTheme) => getArrowConfig('left', 'small', 'ghost', false, tenantTheme),
    right: (tenantTheme: TenantTheme) => getArrowConfig('right', 'small', 'ghost', false, tenantTheme),
  },
};
