import { defaultTheme } from '../theme';
import type { TenantTheme } from '../types';

export interface LoginFormData {
  tenantTheme: TenantTheme;
}

export const fetchLoginFormData = async (_tenantId?: string): Promise<LoginFormData> => {
  return { tenantTheme: defaultTheme };
};

export const fetchLoginFormSSR = async (tenantId?: string): Promise<{ html: string; styles: string }> => {
  const data = await fetchLoginFormData(tenantId);
  return {
    html: `<div class="login-form"></div>`,
    styles: `.login-form { font-family: ${data.tenantTheme.fonts.primary}; }`,
  };
};
