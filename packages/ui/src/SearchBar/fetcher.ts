import { defaultTheme } from '../theme';
import type { TenantTheme } from '../types';

export interface SearchBarData {
  tenantTheme: TenantTheme;
}

export const fetchSearchBarData = async (_tenantId?: string): Promise<SearchBarData> => {
  return { tenantTheme: defaultTheme };
};

export const fetchSearchBarSSR = async (tenantId?: string): Promise<{ html: string; styles: string }> => {
  const data = await fetchSearchBarData(tenantId);
  return {
    html: `<div class="search-bar"></div>`,
    styles: `.search-bar { font-family: ${data.tenantTheme.fonts.primary}; }`,
  };
};
