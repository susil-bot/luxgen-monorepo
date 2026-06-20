/** LuxGen product branding defaults */

export interface LuxGenBrand {
  productName: string;
  tagline: string;
  accentColor: string;
  accentColorDark: string;
}

export const luxgenBrand: LuxGenBrand = {
  productName: 'LuxGen',
  tagline: 'Expert-led training on web and mobile',
  accentColor: '#007aff',
  accentColorDark: '#0a84ff',
};

export interface TenantThemeOverrides {
  /** Tenant accent from packages/db tenant config (e.g. idea-vibes purple) */
  accentColor?: string;
  /** Optional override for primary label / brand text color */
  primaryColor?: string;
}
