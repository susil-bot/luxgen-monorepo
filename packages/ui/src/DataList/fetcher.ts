import { defaultTheme } from '../theme';
import type { TenantTheme } from '../types';

export interface DataListData {
  tenantTheme: TenantTheme;
}

export const fetchDataListData = async (_tenantId?: string): Promise<DataListData> => {
  return { tenantTheme: defaultTheme };
};

export const fetchDataListSSR = async (tenantId?: string): Promise<{ html: string; styles: string }> => {
  const data = await fetchDataListData(tenantId);
  return {
    html: `<div class="data-list"></div>`,
    styles: `.data-list { font-family: ${data.tenantTheme.fonts.primary}; }`,
  };
};
