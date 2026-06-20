import { defaultTheme } from '../theme';
import type { TenantTheme } from '../types';

export interface AdminDashboardData {
  tenantTheme: TenantTheme;
}

export const fetchAdminDashboardData = async (_tenantId?: string): Promise<AdminDashboardData> => {
  return { tenantTheme: defaultTheme };
};

export const fetchAdminDashboardSSR = async (tenantId?: string): Promise<{ html: string; styles: string }> => {
  const data = await fetchAdminDashboardData(tenantId);
  return {
    html: `<div class="admin-dashboard"></div>`,
    styles: `.admin-dashboard { font-family: ${data.tenantTheme.fonts.primary}; }`,
  };
};
