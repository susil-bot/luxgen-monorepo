import { defaultTheme } from '../theme';
import type { TenantTheme } from '../types';

export interface NavBarData {
  tenantTheme: TenantTheme;
}

export const fetchNavBarData = async (_tenantId?: string): Promise<NavBarData> => {
  return { tenantTheme: defaultTheme };
};

export const fetchNavBarSSR = async (tenantId?: string): Promise<{ html: string; styles: string }> => {
  const data = await fetchNavBarData(tenantId);
  return {
    html: `<div class="nav-bar"></div>`,
    styles: `.nav-bar { font-family: ${data.tenantTheme.fonts.primary}; }`,
  };
};
