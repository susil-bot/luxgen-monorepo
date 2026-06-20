import { defaultTheme } from '../theme';
import type { TenantTheme } from '../types';

export interface LayoutData {
  tenantTheme: TenantTheme;
}

export const fetchLayoutData = async (_tenantId?: string): Promise<LayoutData> => {
  return { tenantTheme: defaultTheme };
};

export const fetchLayoutSSR = async (tenantId?: string): Promise<{ html: string; styles: string }> => {
  const data = await fetchLayoutData(tenantId);
  return {
    html: `<div class="layout"></div>`,
    styles: `.layout { font-family: ${data.tenantTheme.fonts.primary}; }`,
  };
};
