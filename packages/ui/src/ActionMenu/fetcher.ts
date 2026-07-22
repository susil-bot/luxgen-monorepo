import { defaultTheme } from '../theme';
import type { TenantTheme } from '../types';

export interface ActionMenuData {
  tenantTheme: TenantTheme;
}

export const fetchActionMenuData = async (_tenantId?: string): Promise<ActionMenuData> => {
  return { tenantTheme: defaultTheme };
};

export const fetchActionMenuSSR = async (tenantId?: string): Promise<{ html: string; styles: string }> => {
  const data = await fetchActionMenuData(tenantId);
  return {
    html: `<div class="action-menu"></div>`,
    styles: `.action-menu { font-family: ${data.tenantTheme.fonts.primary}; }`,
  };
};
