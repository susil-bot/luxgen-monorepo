import { defaultTheme } from '../theme';
import type { TenantTheme } from '../types';

export interface PermissionRequestData {
  tenantTheme: TenantTheme;
}

export const fetchPermissionRequestData = async (_tenantId?: string): Promise<PermissionRequestData> => {
  return { tenantTheme: defaultTheme };
};

export const fetchPermissionRequestSSR = async (tenantId?: string): Promise<{ html: string; styles: string }> => {
  const data = await fetchPermissionRequestData(tenantId);
  return {
    html: `<div class="permission-request"></div>`,
    styles: `.permission-request { font-family: ${data.tenantTheme.fonts.primary}; }`,
  };
};
