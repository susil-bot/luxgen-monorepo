import { defaultTheme } from '../theme';
import type { TenantTheme } from '../types';

export interface CountryLanguageDropdownData {
  tenantTheme: TenantTheme;
}

export const fetchCountryLanguageDropdownData = async (_tenantId?: string): Promise<CountryLanguageDropdownData> => {
  return { tenantTheme: defaultTheme };
};

export const fetchCountryLanguageDropdownSSR = async (tenantId?: string): Promise<{ html: string; styles: string }> => {
  const data = await fetchCountryLanguageDropdownData(tenantId);
  return {
    html: `<div class="country-language-dropdown"></div>`,
    styles: `.country-language-dropdown { font-family: ${data.tenantTheme.fonts.primary}; }`,
  };
};
