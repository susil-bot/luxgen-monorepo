import type { LuxGenTheme } from './theme';

/** Maps theme colors to CSS custom property names used in apps/web/styles/globals.css */
const COLOR_CSS_MAP: Record<keyof LuxGenTheme['colors'], string> = {
  bgPrimary: '--color-bg-primary',
  bgSecondary: '--color-bg-secondary',
  bgTertiary: '--color-bg-tertiary',
  bgElevated: '--color-bg-elevated',
  labelPrimary: '--color-label-primary',
  labelSecondary: '--color-label-secondary',
  labelTertiary: '--color-label-tertiary',
  labelQuaternary: '--color-label-quaternary',
  separator: '--color-separator',
  separatorOpaque: '--color-separator-opaque',
  fillPrimary: '--color-fill-primary',
  fillSecondary: '--color-fill-secondary',
  fillTertiary: '--color-fill-tertiary',
  fillQuaternary: '--color-fill-quaternary',
  sidebarBg: '--color-sidebar-bg',
  sidebarBorder: '--color-sidebar-border',
  sidebarItemHover: '--color-sidebar-item-hover',
  sidebarItemActive: '--color-sidebar-item-active',
  blue: '--color-blue',
  blueHover: '--color-blue-hover',
  green: '--color-green',
  indigo: '--color-indigo',
  orange: '--color-orange',
  pink: '--color-pink',
  purple: '--color-purple',
  red: '--color-red',
  teal: '--color-teal',
  yellow: '--color-yellow',
  mint: '--color-mint',
};

const SHADOW_CSS_MAP: Record<keyof LuxGenTheme['shadows'], string> = {
  xs: '--shadow-xs',
  sm: '--shadow-sm',
  md: '--shadow-md',
  lg: '--shadow-lg',
  xl: '--shadow-xl',
  floating: '--shadow-floating',
};

const RADIUS_CSS_MAP: Record<keyof LuxGenTheme['radius'], string> = {
  xs: '--radius-xs',
  sm: '--radius-sm',
  md: '--radius-md',
  lg: '--radius-lg',
  xl: '--radius-xl',
  '2xl': '--radius-2xl',
  full: '--radius-full',
};

/**
 * Flat map of CSS variable name → value for injecting on :root or a scoped element.
 * Web apps can merge this with existing globals.css or apply tenant overrides at runtime.
 */
export function toCssVariables(theme: LuxGenTheme): Record<string, string> {
  const vars: Record<string, string> = {};

  for (const [key, cssVar] of Object.entries(COLOR_CSS_MAP)) {
    vars[cssVar] = theme.colors[key as keyof LuxGenTheme['colors']];
  }

  for (const [key, cssVar] of Object.entries(SHADOW_CSS_MAP)) {
    vars[cssVar] = theme.shadows[key as keyof LuxGenTheme['shadows']];
  }

  for (const [key, cssVar] of Object.entries(RADIUS_CSS_MAP)) {
    vars[cssVar] = `${theme.radius[key as keyof LuxGenTheme['radius']]}px`;
  }

  return vars;
}

/** Apply CSS variables to document root (browser only). No-op in SSR. */
export function applyCssVariables(
  theme: LuxGenTheme,
  target: HTMLElement | null = typeof document !== 'undefined' ? document.documentElement : null,
): void {
  if (!target) return;
  const vars = toCssVariables(theme);
  for (const [name, value] of Object.entries(vars)) {
    target.style.setProperty(name, value);
  }
}
