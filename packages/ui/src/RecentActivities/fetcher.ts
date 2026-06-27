import { defaultTheme } from '../theme';
import type { TenantTheme } from '../types';

export interface RecentActivitiesData {
  tenantTheme: TenantTheme;
}

export const fetchRecentActivitiesData = async (_tenantId?: string): Promise<RecentActivitiesData> => {
  return { tenantTheme: defaultTheme };
};

export const fetchRecentActivitiesSSR = async (tenantId?: string): Promise<{ html: string; styles: string }> => {
  const data = await fetchRecentActivitiesData(tenantId);
  return {
    html: `<div class="recent-activities"></div>`,
    styles: `.recent-activities { font-family: ${data.tenantTheme.fonts.primary}; }`,
  };
};
