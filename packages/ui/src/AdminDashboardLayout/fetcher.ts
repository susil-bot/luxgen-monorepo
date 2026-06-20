import { defaultTheme } from '../theme';
import type { TenantTheme } from '../types';

export interface AdminDashboardLayoutData {
  tenantTheme: TenantTheme;
}

export const fetchAdminDashboardLayoutData = async (_tenantId?: string): Promise<AdminDashboardLayoutData> => {
  return { tenantTheme: defaultTheme };
};

export const fetchAdminDashboardLayoutSSR = async (tenantId?: string): Promise<{ html: string; styles: string }> => {
  const data = await fetchAdminDashboardLayoutData(tenantId);
  return {
    html: `<div class="admin-dashboard-layout"></div>`,
    styles: `.admin-dashboard-layout { font-family: ${data.tenantTheme.fonts.primary}; }`,
  };
};
