import { HeadingProps } from './Heading';
import { defaultTheme } from '../theme';

export const headingFixtures = {
  default: {
    tenantTheme: defaultTheme,
    level: 1 as const,
    text: 'Main Heading',
  } as HeadingProps,
  
  h1: {
    tenantTheme: defaultTheme,
    level: 1 as const,
    text: 'Heading 1',
    size: '6xl' as const,
    weight: 'bold' as const,
  } as HeadingProps,
  
  h2: {
    tenantTheme: defaultTheme,
    level: 2 as const,
    text: 'Heading 2',
    size: '5xl' as const,
    weight: 'semibold' as const,
  } as HeadingProps,
  
  h3: {
    tenantTheme: defaultTheme,
    level: 3 as const,
    text: 'Heading 3',
    size: '4xl' as const,
    weight: 'semibold' as const,
  } as HeadingProps,
  
  h4: {
    tenantTheme: defaultTheme,
    level: 4 as const,
    text: 'Heading 4',
    size: '3xl' as const,
    weight: 'medium' as const,
  } as HeadingProps,
  
  h5: {
    tenantTheme: defaultTheme,
    level: 5 as const,
    text: 'Heading 5',
    size: '2xl' as const,
    weight: 'medium' as const,
  } as HeadingProps,
  
  h6: {
    tenantTheme: defaultTheme,
    level: 6 as const,
    text: 'Heading 6',
    size: 'xl' as const,
    weight: 'medium' as const,
  } as HeadingProps,
  
  withVariant: {
    tenantTheme: defaultTheme,
    level: 2 as const,
    text: 'Success Heading',
    variant: 'success' as const,
  } as HeadingProps,
  
  withColor: {
    tenantTheme: defaultTheme,
    level: 2 as const,
    text: 'Custom Color Heading',
    color: '#8B5CF6',
  } as HeadingProps,
  
  withAlignment: {
    tenantTheme: defaultTheme,
    level: 2 as const,
    text: 'Centered Heading',
    align: 'center' as const,
  } as HeadingProps,
  
  withTruncate: {
    tenantTheme: defaultTheme,
    level: 2 as const,
    text: 'This is a very long heading that should be truncated when the container is too small',
    truncate: true,
  } as HeadingProps,
  
  withCustomTheme: {
    tenantTheme: {
      ...defaultTheme,
      colors: {
        ...defaultTheme.colors,
        text: '#1F2937',
      },
    },
    level: 2 as const,
    text: 'Custom Themed Heading',
  } as HeadingProps,
  
  withWeight: {
    tenantTheme: defaultTheme,
    level: 2 as const,
    text: 'Bold Heading',
    weight: 'bold' as const,
  } as HeadingProps,
  
  withSize: {
    tenantTheme: defaultTheme,
    level: 2 as const,
    text: 'Large Heading',
    size: '5xl' as const,
  } as HeadingProps,
};
