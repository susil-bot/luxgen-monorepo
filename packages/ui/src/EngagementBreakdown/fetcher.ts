import { defaultTheme } from '../theme';
import type { TenantTheme } from '../types';

export interface EngagementBreakdownData {
  tenantTheme: TenantTheme;
}

export const fetchEngagementBreakdownData = async (_tenantId?: string): Promise<EngagementBreakdownData> => {
  return { tenantTheme: defaultTheme };
};

export const fetchEngagementBreakdownSSR = async (tenantId?: string): Promise<{ html: string; styles: string }> => {
  const data = await fetchEngagementBreakdownData(tenantId);
  return {
    html: `<div class="engagement-breakdown"></div>`,
    styles: `.engagement-breakdown { font-family: ${data.tenantTheme.fonts.primary}; }`,
  };
};
