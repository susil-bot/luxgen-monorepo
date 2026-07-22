import { luxgenBrand, type TenantThemeOverrides } from './brand';
import { darkThemeColors, lightThemeColors, type ThemeColors } from './colors';
import { radius, type RadiusScale } from './radius';
import { darkShadows, lightShadows, type ShadowScale } from './shadows';
import { layout, spacing, type SpacingScale } from './spacing';
import { transitions } from './transitions';
import { typography, type Typography } from './typography';

export type ColorScheme = 'light' | 'dark';

export interface LuxGenTheme {
  scheme: ColorScheme;
  colors: ThemeColors;
  shadows: ShadowScale;
  typography: Typography;
  spacing: SpacingScale;
  layout: typeof layout;
  radius: RadiusScale;
  transitions: typeof transitions;
  brand: typeof luxgenBrand;
}

export function createTheme(scheme: ColorScheme = 'light', overrides?: TenantThemeOverrides): LuxGenTheme {
  const baseColors = scheme === 'dark' ? { ...darkThemeColors } : { ...lightThemeColors };

  if (overrides?.accentColor) {
    baseColors.blue = overrides.accentColor;
    if (scheme === 'light') {
      baseColors.sidebarItemActive = `${overrides.accentColor}1f`;
    } else {
      baseColors.sidebarItemActive = `${overrides.accentColor}2e`;
    }
  }

  return {
    scheme,
    colors: baseColors,
    shadows: scheme === 'dark' ? darkShadows : lightShadows,
    typography,
    spacing,
    layout,
    radius,
    transitions,
    brand: {
      ...luxgenBrand,
      accentColor:
        overrides?.accentColor ?? (scheme === 'dark' ? luxgenBrand.accentColorDark : luxgenBrand.accentColor),
    },
  };
}

/** Default light theme — use in web SSR and mobile initial render */
export const lightTheme = createTheme('light');

/** Default dark theme */
export const darkTheme = createTheme('dark');

/**
 * Apply tenant accent from DB tenant config branding.colors.primary or theme.colors.accent.
 */
export function applyTenantTheme(
  scheme: ColorScheme,
  tenantColors?: { primary?: string; accent?: string },
): LuxGenTheme {
  const accent = tenantColors?.accent ?? tenantColors?.primary;
  return createTheme(scheme, accent ? { accentColor: accent } : undefined);
}
