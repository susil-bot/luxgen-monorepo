import { applyCssVariables, applyTenantTheme } from '@luxgen/design-tokens';

type TenantSettings = {
  branding?: {
    accentColor?: string;
    primaryColor?: string;
  };
};

export function resolveTenantAccent(settings: unknown): string | undefined {
  if (!settings || typeof settings !== 'object') return undefined;
  const branding = (settings as TenantSettings).branding;
  return branding?.accentColor ?? branding?.primaryColor;
}

function resolveColorScheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Apply tenant accent onto LuxGen design tokens (browser only). */
export function applyLearnTenantTheme(settings: unknown): void {
  const accent = resolveTenantAccent(settings);
  const theme = applyTenantTheme(resolveColorScheme(), { accent, primary: accent });
  applyCssVariables(theme);
}
