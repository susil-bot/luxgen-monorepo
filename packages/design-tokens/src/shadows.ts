/** Shadow tokens — CSS strings for web; native apps map to elevation separately */

export interface ShadowScale {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  floating: string;
}

export const lightShadows: ShadowScale = {
  xs: '0 1px 2px rgba(0, 0, 0, 0.04)',
  sm: '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
  md: '0 4px 6px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.04)',
  lg: '0 10px 20px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.04)',
  xl: '0 20px 40px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.06)',
  floating: '0 24px 48px rgba(0, 0, 0, 0.14), 0 8px 24px rgba(0, 0, 0, 0.08)',
};

export const darkShadows: ShadowScale = {
  xs: '0 1px 2px rgba(0, 0, 0, 0.3)',
  sm: '0 1px 3px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3)',
  md: '0 4px 6px rgba(0, 0, 0, 0.45), 0 2px 4px rgba(0, 0, 0, 0.35)',
  lg: '0 10px 20px rgba(0, 0, 0, 0.5), 0 4px 8px rgba(0, 0, 0, 0.4)',
  xl: '0 20px 40px rgba(0, 0, 0, 0.55), 0 8px 16px rgba(0, 0, 0, 0.45)',
  floating: '0 24px 48px rgba(0, 0, 0, 0.6), 0 8px 24px rgba(0, 0, 0, 0.5)',
};

/** React Native elevation approximations (Android) */
export const nativeElevation: Record<keyof ShadowScale, number> = {
  xs: 1,
  sm: 2,
  md: 4,
  lg: 8,
  xl: 12,
  floating: 16,
};
