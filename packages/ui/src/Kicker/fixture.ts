import { KickerProps } from './Kicker';
import { defaultTheme } from '../theme';

export const kickerFixtures = {
  default: {
    tenantTheme: defaultTheme,
    children: 'Default kicker',
    variant: 'primary' as const,
  } as KickerProps,
  
  primary: {
    tenantTheme: defaultTheme,
    children: 'Primary kicker',
    variant: 'primary' as const,
  } as KickerProps,
  
  secondary: {
    tenantTheme: defaultTheme,
    children: 'Secondary kicker',
    variant: 'secondary' as const,
  } as KickerProps,
  
  success: {
    tenantTheme: defaultTheme,
    children: 'Success kicker',
    variant: 'success' as const,
  } as KickerProps,
  
  error: {
    tenantTheme: defaultTheme,
    children: 'Error kicker',
    variant: 'error' as const,
  } as KickerProps,
  
  warning: {
    tenantTheme: defaultTheme,
    children: 'Warning kicker',
    variant: 'warning' as const,
  } as KickerProps,
  
  info: {
    tenantTheme: defaultTheme,
    children: 'Info kicker',
    variant: 'info' as const,
  } as KickerProps,
  
  small: {
    tenantTheme: defaultTheme,
    children: 'Small kicker',
    variant: 'primary' as const,
    size: 'small' as const,
  } as KickerProps,
  
  medium: {
    tenantTheme: defaultTheme,
    children: 'Medium kicker',
    variant: 'primary' as const,
    size: 'medium' as const,
  } as KickerProps,
  
  large: {
    tenantTheme: defaultTheme,
    children: 'Large kicker',
    variant: 'primary' as const,
    size: 'large' as const,
  } as KickerProps,
  
  withWeight: {
    tenantTheme: defaultTheme,
    children: 'Bold kicker',
    variant: 'primary' as const,
    weight: 'bold' as const,
  } as KickerProps,
  
  withAlignment: {
    tenantTheme: defaultTheme,
    children: 'Centered kicker',
    variant: 'primary' as const,
    align: 'center' as const,
  } as KickerProps,
  
  withUnderline: {
    tenantTheme: defaultTheme,
    children: 'Underlined kicker',
    variant: 'primary' as const,
    underline: true,
  } as KickerProps,
  
  withIcon: {
    tenantTheme: defaultTheme,
    children: 'Kicker with icon',
    variant: 'primary' as const,
    icon: '🔖',
  } as KickerProps,
  
  withIconRight: {
    tenantTheme: defaultTheme,
    children: 'Kicker with right icon',
    variant: 'primary' as const,
    icon: '🔖',
    iconPosition: 'right' as const,
  } as KickerProps,
  
  notUppercase: {
    tenantTheme: defaultTheme,
    children: 'Not uppercase kicker',
    variant: 'primary' as const,
    uppercase: false,
  } as KickerProps,
  
  withCustomTheme: {
    tenantTheme: {
      ...defaultTheme,
      colors: {
        ...defaultTheme.colors,
        primary: '#8B5CF6',
      },
    },
    children: 'Custom themed kicker',
    variant: 'primary' as const,
  } as KickerProps,
};
