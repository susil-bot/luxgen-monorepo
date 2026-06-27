import { defaultTheme } from '../theme';
import type { TenantTheme } from '../types';

export interface GroupCardData {
  tenantTheme: TenantTheme;
}

export const fetchGroupCardData = async (_tenantId?: string): Promise<GroupCardData> => {
  return { tenantTheme: defaultTheme };
};

export const fetchGroupCardSSR = async (tenantId?: string): Promise<{ html: string; styles: string }> => {
  const data = await fetchGroupCardData(tenantId);
  return {
    html: `<div class="group-card"></div>`,
    styles: `.group-card { font-family: ${data.tenantTheme.fonts.primary}; }`,
  };
};
