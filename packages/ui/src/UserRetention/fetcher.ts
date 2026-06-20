import { defaultTheme } from '../theme';
import type { TenantTheme } from '../types';

export interface UserRetentionData {
  tenantTheme: TenantTheme;
}

export const fetchUserRetentionData = async (_tenantId?: string): Promise<UserRetentionData> => {
  return { tenantTheme: defaultTheme };
};

export const fetchUserRetentionSSR = async (tenantId?: string): Promise<{ html: string; styles: string }> => {
  const data = await fetchUserRetentionData(tenantId);
  return {
    html: `<div class="user-retention"></div>`,
    styles: `.user-retention { font-family: ${data.tenantTheme.fonts.primary}; }`,
  };
};
