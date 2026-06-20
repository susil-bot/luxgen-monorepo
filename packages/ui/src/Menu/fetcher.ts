import { defaultTheme } from '../theme';
import type { TenantTheme } from '../types';

export interface MenuData {
  tenantTheme: TenantTheme;
}

export const fetchMenuData = async (_tenantId?: string): Promise<MenuData> => {
  return { tenantTheme: defaultTheme };
};

export const fetchMenuSSR = async (tenantId?: string): Promise<{ html: string; styles: string }> => {
  const data = await fetchMenuData(tenantId);
  return {
    html: `<div class="menu"></div>`,
    styles: `.menu { font-family: ${data.tenantTheme.fonts.primary}; }`,
  };
};
