import { defaultTheme } from '../theme';
import type { TenantTheme } from '../types';

export interface ButtonData {
  tenantTheme: TenantTheme;
}

export const fetchButtonData = async (_tenantId?: string): Promise<ButtonData> => {
  return { tenantTheme: defaultTheme };
};

export const fetchButtonSSR = async (tenantId?: string): Promise<{ html: string; styles: string }> => {
  const data = await fetchButtonData(tenantId);
  return {
    html: `<div class="button"></div>`,
    styles: `.button { font-family: ${data.tenantTheme.fonts.primary}; }`,
  };
};
