import { BadgeProps } from './Badge';
import { defaultTheme } from '../theme';

export const badgeFixtures = {
  default: {
    tenantTheme: defaultTheme,
    children: 'Default badge',
    variant: 'primary' as const,
  } as BadgeProps,
  
  primary: {
    tenantTheme: defaultTheme,
    children: 'Primary badge',
    variant: 'primary' as const,
  } as BadgeProps,
  
  secondary: {
    tenantTheme: defaultTheme,
    children: 'Secondary badge',
    variant: 'secondary' as const,
  } as BadgeProps,
  
  success: {
    tenantTheme: defaultTheme,
    children: 'Success badge',
    variant: 'success' as const,
  } as BadgeProps,
  
  error: {
    tenantTheme: defaultTheme,
    children: 'Error badge',
    variant: 'error' as const,
  } as BadgeProps,
  
  warning: {
    tenantTheme: defaultTheme,
    children: 'Warning badge',
    variant: 'warning' as const,
  } as BadgeProps,
  
  info: {
    tenantTheme: defaultTheme,
    children: 'Info badge',
    variant: 'info' as const,
  } as BadgeProps,
  
  small: {
    tenantTheme: defaultTheme,
    children: 'Small badge',
    variant: 'primary' as const,
    size: 'small' as const,
  } as BadgeProps,
  
  medium: {
    tenantTheme: defaultTheme,
    children: 'Medium badge',
    variant: 'primary' as const,
    size: 'medium' as const,
  } as BadgeProps,
  
  large: {
    tenantTheme: defaultTheme,
    children: 'Large badge',
    variant: 'primary' as const,
    size: 'large' as const,
  } as BadgeProps,
  
  rounded: {
    tenantTheme: defaultTheme,
    children: 'Rounded badge',
    variant: 'primary' as const,
    shape: 'rounded' as const,
  } as BadgeProps,
  
  pill: {
    tenantTheme: defaultTheme,
    children: 'Pill badge',
    variant: 'primary' as const,
    shape: 'pill' as const,
  } as BadgeProps,
  
  square: {
    tenantTheme: defaultTheme,
    children: 'Square badge',
    variant: 'primary' as const,
    shape: 'square' as const,
  } as BadgeProps,
  
  dot: {
    tenantTheme: defaultTheme,
    children: '',
    variant: 'primary' as const,
    dot: true,
  } as BadgeProps,
  
  closable: {
    tenantTheme: defaultTheme,
    children: 'Closable badge',
    variant: 'primary' as const,
    closable: true,
    onClose: () => console.log('Badge closed'),
  } as BadgeProps,
  
  withIcon: {
    tenantTheme: defaultTheme,
    children: 'Badge with icon',
    variant: 'primary' as const,
    icon: '🔖',
  } as BadgeProps,
  
  withMaxWidth: {
    tenantTheme: defaultTheme,
    children: 'Badge with max width',
    variant: 'primary' as const,
    maxWidth: '200px',
  } as BadgeProps,
  
  withCustomTheme: {
    tenantTheme: {
      ...defaultTheme,
      colors: {
        ...defaultTheme.colors,
        primary: '#8B5CF6',
      },
    },
    children: 'Custom themed badge',
    variant: 'primary' as const,
  } as BadgeProps,
};
