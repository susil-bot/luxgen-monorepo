import { PageWrapperProps } from './PageWrapper';
import { defaultTheme } from '../theme';

export const pageWrapperFixtures = {
  default: {
    tenantTheme: defaultTheme,
    children: 'Default PageWrapper Content',
    padding: '1rem',
  } as PageWrapperProps,
  
  withCustomPadding: {
    tenantTheme: defaultTheme,
    children: 'PageWrapper with custom padding',
    padding: '2rem',
  } as PageWrapperProps,
  
  withCustomTheme: {
    tenantTheme: {
      ...defaultTheme,
      colors: {
        ...defaultTheme.colors,
        primary: '#8B5CF6',
        background: '#F3F4F6',
      },
    },
    children: 'PageWrapper with custom theme',
    padding: '1.5rem',
  } as PageWrapperProps,
  
  withClassName: {
    tenantTheme: defaultTheme,
    children: 'PageWrapper with custom className',
    className: 'custom-page-wrapper',
    padding: '1rem',
  } as PageWrapperProps,
  
  withStyle: {
    tenantTheme: defaultTheme,
    children: 'PageWrapper with custom style',
    style: {
      border: '1px solid #E5E7EB',
      borderRadius: '0.5rem',
    },
    padding: '1rem',
  } as PageWrapperProps,
};
