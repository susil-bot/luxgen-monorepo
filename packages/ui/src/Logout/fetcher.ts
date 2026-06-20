import { defaultTheme } from '../theme';
import type { TenantTheme } from '../types';

export interface LogoutData {
  tenantTheme: TenantTheme;
}

export const fetchLogoutData = async (_tenantId?: string): Promise<LogoutData> => {
  return { tenantTheme: defaultTheme };
};

export const fetchLogoutSSR = async (tenantId?: string): Promise<{ html: string; styles: string }> => {
  const data = await fetchLogoutData(tenantId);
  return {
    html: `<div class="logout"></div>`,
    styles: `.logout { font-family: ${data.tenantTheme.fonts.primary}; }`,
  };
};
