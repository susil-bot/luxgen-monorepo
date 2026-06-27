import { defaultTheme } from '../theme';
import type { TenantTheme } from '../types';

export interface UserDashboardLayoutData {
  tenantTheme: TenantTheme;
}

export const fetchUserDashboardLayoutData = async (_tenantId?: string): Promise<UserDashboardLayoutData> => {
  return { tenantTheme: defaultTheme };
};

export const fetchUserDashboardLayoutSSR = async (tenantId?: string): Promise<{ html: string; styles: string }> => {
  const data = await fetchUserDashboardLayoutData(tenantId);
  return {
    html: `<div class="user-dashboard-layout"></div>`,
    styles: `.user-dashboard-layout { font-family: ${data.tenantTheme.fonts.primary}; }`,
  };
};
