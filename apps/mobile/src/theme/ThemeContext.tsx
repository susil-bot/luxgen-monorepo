import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

import type { TenantBrandingPayload } from '../../lib/tenant-api';

const light = {
  background: '#ffffff',
  text: '#1a1a1a',
  subtext: '#666666',
  dot: '#cccccc',
  dotActive: '#007AFF',
  skipBorder: '#007AFF',
  skipText: '#007AFF',
  btnPrimary: '#007AFF',
  btnPrimaryText: '#ffffff',
};

const dark = {
  background: '#121212',
  text: '#f0f0f0',
  subtext: '#aaaaaa',
  dot: '#444444',
  dotActive: '#4da3ff',
  skipBorder: '#4da3ff',
  skipText: '#4da3ff',
  btnPrimary: '#4da3ff',
  btnPrimaryText: '#ffffff',
};

export type Theme = typeof light;

const ThemeContext = createContext<Theme>(light);

function applyBranding(base: Theme, branding?: TenantBrandingPayload | null): Theme {
  if (!branding) return base;
  const primary = branding.primaryColor ?? branding.accentColor;
  if (!primary) return base;
  return {
    ...base,
    dotActive: primary,
    skipBorder: primary,
    skipText: primary,
    btnPrimary: primary,
  };
}

export function ThemeProvider({
  children,
  branding,
}: {
  children: React.ReactNode;
  branding?: TenantBrandingPayload | null;
}) {
  const scheme = useColorScheme();
  const theme = useMemo(() => {
    const base = scheme === 'dark' ? dark : light;
    return applyBranding(base, branding);
  }, [scheme, branding]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
