import { defaultTheme } from '../theme';
import type { TenantTheme } from '../types';

export interface ArrowData {
  tenantTheme: TenantTheme;
}

export const fetchArrowData = async (_tenantId?: string): Promise<ArrowData> => {
  return { tenantTheme: defaultTheme };
};

export const fetchArrowSSR = async (tenantId?: string): Promise<{ html: string; styles: string }> => {
  const data = await fetchArrowData(tenantId);
  return {
    html: `<div class="arrow"></div>`,
    styles: `.arrow { font-family: ${data.tenantTheme.fonts.primary}; }`,
  };
};
