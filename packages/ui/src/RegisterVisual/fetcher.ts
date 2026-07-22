import { defaultTheme } from '../theme';
import type { TenantTheme } from '../types';

export interface RegisterVisualData {
  tenantTheme: TenantTheme;
}

export const fetchRegisterVisualData = async (_tenantId?: string): Promise<RegisterVisualData> => {
  return { tenantTheme: defaultTheme };
};

export const fetchRegisterVisualSSR = async (tenantId?: string): Promise<{ html: string; styles: string }> => {
  const data = await fetchRegisterVisualData(tenantId);
  return {
    html: `<div class="register-visual"></div>`,
    styles: `.register-visual { font-family: ${data.tenantTheme.fonts.primary}; }`,
  };
};
