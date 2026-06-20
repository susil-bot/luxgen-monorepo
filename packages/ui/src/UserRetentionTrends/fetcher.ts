import { defaultTheme } from '../theme';
import type { TenantTheme } from '../types';

export interface UserRetentionTrendsData {
  tenantTheme: TenantTheme;
}

export const fetchUserRetentionTrendsData = async (_tenantId?: string): Promise<UserRetentionTrendsData> => {
  return { tenantTheme: defaultTheme };
};

export const fetchUserRetentionTrendsSSR = async (tenantId?: string): Promise<{ html: string; styles: string }> => {
  const data = await fetchUserRetentionTrendsData(tenantId);
  return {
    html: `<div class="user-retention-trends"></div>`,
    styles: `.user-retention-trends { font-family: ${data.tenantTheme.fonts.primary}; }`,
  };
};
