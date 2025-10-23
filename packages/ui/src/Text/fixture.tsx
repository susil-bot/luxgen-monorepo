import { TextProps } from './Text';
import { defaultTheme } from '../theme';

export const textFixtures = {
  default: {
    tenantTheme: defaultTheme,
    text: 'Default text content',
    variant: 'normal' as const,
  } as TextProps,
  
  normal: {
    tenantTheme: defaultTheme,
    text: 'Normal text content',
    variant: 'normal' as const,
  } as TextProps,
  
  small: {
    tenantTheme: defaultTheme,
    text: 'Small text content',
    variant: 'small' as const,
  } as TextProps,
  
  large: {
    tenantTheme: defaultTheme,
    text: 'Large text content',
    variant: 'large' as const,
  } as TextProps,
  
  lead: {
    tenantTheme: defaultTheme,
    text: 'Lead text content that stands out',
    variant: 'lead' as const,
  } as TextProps,
  
  caption: {
    tenantTheme: defaultTheme,
    text: 'Caption text content',
    variant: 'caption' as const,
  } as TextProps,
  
  muted: {
    tenantTheme: defaultTheme,
    text: 'Muted text content',
    variant: 'muted' as const,
  } as TextProps,
  
  withVariant: {
    tenantTheme: defaultTheme,
    text: 'Success text content',
    variant: 'normal' as const,
    variant: 'success' as const,
  } as TextProps,
  
  withWeight: {
    tenantTheme: defaultTheme,
    text: 'Bold text content',
    variant: 'normal' as const,
    weight: 'bold' as const,
  } as TextProps,
  
  withAlignment: {
    tenantTheme: defaultTheme,
    text: 'Centered text content',
    variant: 'normal' as const,
    align: 'center' as const,
  } as TextProps,
  
  withColor: {
    tenantTheme: defaultTheme,
    text: 'Custom colored text content',
    variant: 'normal' as const,
    color: '#8B5CF6',
  } as TextProps,
  
  withTruncate: {
    tenantTheme: defaultTheme,
    text: 'This is a very long text content that should be truncated when the container is too small',
    variant: 'normal' as const,
    truncate: true,
  } as TextProps,
  
  asSpan: {
    tenantTheme: defaultTheme,
    text: 'Span text content',
    variant: 'normal' as const,
    as: 'span' as const,
  } as TextProps,
  
  asDiv: {
    tenantTheme: defaultTheme,
    text: 'Div text content',
    variant: 'normal' as const,
    as: 'div' as const,
  } as TextProps,
  
  withCustomTheme: {
    tenantTheme: {
      ...defaultTheme,
      colors: {
        ...defaultTheme.colors,
        text: '#1F2937',
      },
    },
    text: 'Custom themed text content',
    variant: 'normal' as const,
  } as TextProps,
};
