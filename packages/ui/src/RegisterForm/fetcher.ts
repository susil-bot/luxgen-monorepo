import { defaultTheme } from '../theme';
import type { TenantTheme } from '../types';

export interface RegisterFormData {
  tenantTheme: TenantTheme;
}

export const fetchRegisterFormData = async (_tenantId?: string): Promise<RegisterFormData> => {
  return { tenantTheme: defaultTheme };
};

export const fetchRegisterFormSSR = async (tenantId?: string): Promise<{ html: string; styles: string }> => {
  const data = await fetchRegisterFormData(tenantId);
  return {
    html: `<div class="register-form"></div>`,
    styles: `.register-form { font-family: ${data.tenantTheme.fonts.primary}; }`,
  };
};
