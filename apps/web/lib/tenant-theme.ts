import { applyCssVariables, applyTenantTheme, type ColorScheme } from '@luxgen/design-tokens';

type TenantThemeColors = {
  primary?: string;
  secondary?: string;
  accent?: string;
};

type TenantBranding = {
  colors?: { primary?: string; secondary?: string; accentColor?: string; primaryColor?: string };
  accentColor?: string;
  primaryColor?: string;
};

type TenantSettings = {
  branding?: TenantBranding;
};

/** Read appearance from html.dark (ThemeProvider), not prefers-color-scheme alone. */
export function resolveColorScheme(): ColorScheme {
  if (typeof window === 'undefined') return 'light';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export function resolveTenantAccent(sources: {
  settings?: unknown;
  theme?: { colors?: TenantThemeColors };
  branding?: TenantBranding;
}): string | undefined {
  const { settings, theme, branding } = sources;

  if (settings && typeof settings === 'object') {
    const s = settings as TenantSettings;
    const b = s.branding;
    const fromSettings =
      b?.accentColor ?? b?.primaryColor ?? b?.colors?.accentColor ?? b?.colors?.primaryColor ?? b?.colors?.primary;
    if (fromSettings) return fromSettings;
  }

  return (
    theme?.colors?.accent ??
    theme?.colors?.primary ??
    branding?.colors?.primary ??
    branding?.accentColor ??
    branding?.primaryColor
  );
}

/** Keep sidebar --lux-* tokens in sync with tenant accent (matches globals.css / sidebar.css). */
function applyLuxSidebarAccent(accent: string, scheme: ColorScheme): void {
  const root = document.documentElement;
  root.style.setProperty('--lux-color-accent', accent);

  if (scheme === 'light') {
    root.style.setProperty('--lux-color-accent-tint', `${accent}24`);
    root.style.setProperty('--lux-color-accent-hover', `${accent}2e`);
    root.style.setProperty('--lux-item-active-bg', `${accent}1f`);
    root.style.setProperty('--lux-item-active-hover-bg', `${accent}29`);
    root.style.setProperty('--lux-subnav-border', `${accent}59`);
    root.style.setProperty('--lux-search-focus-border', `${accent}73`);
  } else {
    root.style.setProperty('--lux-color-accent-tint', `${accent}2e`);
    root.style.setProperty('--lux-color-accent-hover', `${accent}42`);
    root.style.setProperty('--lux-item-active-bg', `${accent}2e`);
    root.style.setProperty('--lux-item-active-hover-bg', `${accent}42`);
    root.style.setProperty('--lux-subnav-border', `${accent}66`);
    root.style.setProperty('--lux-search-focus-border', `${accent}99`);
  }
}

/**
 * Single entry point: apply iOS design tokens + tenant accent to :root.
 * Re-run whenever tenant or light/dark scheme changes.
 */
export function applyTenantDesignTokens(options: { tenantId: string; scheme: ColorScheme; accent?: string }): void {
  if (typeof document === 'undefined') return;

  const { tenantId, scheme, accent } = options;
  document.documentElement.setAttribute('data-tenant', tenantId);

  const theme = applyTenantTheme(scheme, accent ? { accent, primary: accent } : undefined);
  applyCssVariables(theme);

  if (accent) {
    applyLuxSidebarAccent(accent, scheme);
  }
}
