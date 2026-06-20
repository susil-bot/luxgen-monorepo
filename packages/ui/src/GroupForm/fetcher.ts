import { defaultTheme } from '../theme';
import type { TenantTheme } from '../types';

export interface GroupFormData {
  tenantTheme: TenantTheme;
}

export const fetchGroupFormData = async (_tenantId?: string): Promise<GroupFormData> => {
  return { tenantTheme: defaultTheme };
};

export const fetchGroupFormSSR = async (tenantId?: string): Promise<{ html: string; styles: string }> => {
  const data = await fetchGroupFormData(tenantId);
  return {
    html: `<div class="group-form"></div>`,
    styles: `.group-form { font-family: ${data.tenantTheme.fonts.primary}; }`,
  };
};
