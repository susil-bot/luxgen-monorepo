import { defaultTheme } from '../theme';
import type { TenantTheme } from '../types';

export interface EngagementTrendsData {
  tenantTheme: TenantTheme;
}

export const fetchEngagementTrendsData = async (_tenantId?: string): Promise<EngagementTrendsData> => {
  return { tenantTheme: defaultTheme };
};

export const fetchEngagementTrendsSSR = async (tenantId?: string): Promise<{ html: string; styles: string }> => {
  const data = await fetchEngagementTrendsData(tenantId);
  return {
    html: `<div class="engagement-trends"></div>`,
    styles: `.engagement-trends { font-family: ${data.tenantTheme.fonts.primary}; }`,
  };
};
