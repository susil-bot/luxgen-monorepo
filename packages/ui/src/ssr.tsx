import React, { ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { TenantTheme } from './types';
import { defaultTheme } from './theme';

export interface SSRProps {
  tenantTheme?: TenantTheme;
  isServer?: boolean;
}

export const createSSRComponent = <P extends object>(
  Component: React.ComponentType<P>,
  defaultProps?: Partial<P>
) => {
  return (props: P & SSRProps) => {
    const mergedProps = { ...defaultProps, ...props } as P;
    return React.createElement(Component, mergedProps);
  };
};

export const renderComponentToString = (element: ReactElement): string => {
  try {
    return renderToString(element);
  } catch (error) {
    console.error('SSR rendering error:', error);
    return '';
  }
};

export const getServerStyles = (theme: TenantTheme = defaultTheme): string => {
  return `
    :root {
      --color-primary: ${theme.colors.primary};
      --color-secondary: ${theme.colors.secondary};
      --color-accent: ${theme.colors.accent};
      --color-background: ${theme.colors.background};
      --color-surface: ${theme.colors.surface};
      --color-text: ${theme.colors.text};
      --color-text-secondary: ${theme.colors.textSecondary};
      --color-border: ${theme.colors.border};
      --color-error: ${theme.colors.error};
      --color-warning: ${theme.colors.warning};
      --color-success: ${theme.colors.success};
      --color-info: ${theme.colors.info};
      
      --font-primary: ${theme.fonts.primary};
      --font-secondary: ${theme.fonts.secondary};
      --font-mono: ${theme.fonts.mono};
      
      --spacing-xs: ${theme.spacing.xs};
      --spacing-sm: ${theme.spacing.sm};
      --spacing-md: ${theme.spacing.md};
      --spacing-lg: ${theme.spacing.lg};
      --spacing-xl: ${theme.spacing.xl};
      
      --border-radius-sm: ${theme.borderRadius.sm};
      --border-radius-md: ${theme.borderRadius.md};
      --border-radius-lg: ${theme.borderRadius.lg};
      
      --shadow-sm: ${theme.shadows.sm};
      --shadow-md: ${theme.shadows.md};
      --shadow-lg: ${theme.shadows.lg};
    }
  `;
};

export const withSSR = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return (props: P & SSRProps) => {
    const { tenantTheme = defaultTheme, isServer = false, ...restProps } = props;
    
    if (isServer) {
      const styles = getServerStyles(tenantTheme);
      return (
        <>
          <style dangerouslySetInnerHTML={{ __html: styles }} />
          <Component {...(restProps as P)} />
        </>
      );
    }
    
    return <Component {...(restProps as P)} />;
  };
};
