import { defaultTheme } from '../theme';
import type { TenantTheme } from '../types';

export interface AssetsData {
  tenantTheme: TenantTheme;
}

export const fetchAssetsData = async (_tenantId?: string): Promise<AssetsData> => {
  return { tenantTheme: defaultTheme };
};

export const fetchAssetsSSR = async (tenantId?: string): Promise<{ html: string; styles: string }> => {
  const data = await fetchAssetsData(tenantId);
  return {
    html: `<div class="assets"></div>`,
    styles: `.assets { font-family: ${data.tenantTheme.fonts.primary}; }`,
  };
};
