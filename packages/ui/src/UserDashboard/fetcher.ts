import { defaultTheme } from '../theme';
import type { TenantTheme } from '../types';

export interface UserDashboardData {
  tenantTheme: TenantTheme;
}

export const fetchUserDashboardData = async (_tenantId?: string): Promise<UserDashboardData> => {
  return { tenantTheme: defaultTheme };
};

export const fetchUserDashboardSSR = async (tenantId?: string): Promise<{ html: string; styles: string }> => {
  const data = await fetchUserDashboardData(tenantId);
  return {
    html: `<div class="user-dashboard"></div>`,
    styles: `.user-dashboard { font-family: ${data.tenantTheme.fonts.primary}; }`,
  };
};
