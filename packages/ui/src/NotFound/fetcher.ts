import { defaultTheme } from '../theme';
import type { TenantTheme } from '../types';

export interface NotFoundData {
  tenantTheme: TenantTheme;
}

export const fetchNotFoundData = async (_tenantId?: string): Promise<NotFoundData> => {
  return { tenantTheme: defaultTheme };
};

export const fetchNotFoundSSR = async (tenantId?: string): Promise<{ html: string; styles: string }> => {
  const data = await fetchNotFoundData(tenantId);
  return {
    html: `<div class="not-found"></div>`,
    styles: `.not-found { font-family: ${data.tenantTheme.fonts.primary}; }`,
  };
};
