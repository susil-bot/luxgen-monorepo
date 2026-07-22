import { defaultTheme } from '../theme';
import type { TenantTheme } from '../types';

export interface GroupDashboardCardData {
  tenantTheme: TenantTheme;
}

export const fetchGroupDashboardCardData = async (_tenantId?: string): Promise<GroupDashboardCardData> => {
  return { tenantTheme: defaultTheme };
};

export const fetchGroupDashboardCardSSR = async (tenantId?: string): Promise<{ html: string; styles: string }> => {
  const data = await fetchGroupDashboardCardData(tenantId);
  return {
    html: `<div class="group-dashboard-card"></div>`,
    styles: `.group-dashboard-card { font-family: ${data.tenantTheme.fonts.primary}; }`,
  };
};
