import { defaultTheme } from '../theme';
import type { TenantTheme } from '../types';

export interface ChipData {
  tenantTheme: TenantTheme;
}

export const fetchChipData = async (_tenantId?: string): Promise<ChipData> => {
  return { tenantTheme: defaultTheme };
};

export const fetchChipSSR = async (tenantId?: string): Promise<{ html: string; styles: string }> => {
  const data = await fetchChipData(tenantId);
  return {
    html: `<div class="chip"></div>`,
    styles: `.chip { font-family: ${data.tenantTheme.fonts.primary}; }`,
  };
};
