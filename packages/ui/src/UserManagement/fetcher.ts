import { defaultTheme } from '../theme';
import type { TenantTheme } from '../types';

export interface UserManagementData {
  tenantTheme: TenantTheme;
}

export const fetchUserManagementData = async (_tenantId?: string): Promise<UserManagementData> => {
  return { tenantTheme: defaultTheme };
};

export const fetchUserManagementSSR = async (tenantId?: string): Promise<{ html: string; styles: string }> => {
  const data = await fetchUserManagementData(tenantId);
  return {
    html: `<div class="user-management"></div>`,
    styles: `.user-management { font-family: ${data.tenantTheme.fonts.primary}; }`,
  };
};
