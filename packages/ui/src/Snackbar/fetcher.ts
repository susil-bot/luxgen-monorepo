import { defaultTheme } from '../theme';
import type { TenantTheme } from '../types';

export interface SnackbarData {
  tenantTheme: TenantTheme;
}

export const fetchSnackbarData = async (_tenantId?: string): Promise<SnackbarData> => {
  return { tenantTheme: defaultTheme };
};

export const fetchSnackbarSSR = async (tenantId?: string): Promise<{ html: string; styles: string }> => {
  const data = await fetchSnackbarData(tenantId);
  return {
    html: `<div class="snackbar"></div>`,
    styles: `.snackbar { font-family: ${data.tenantTheme.fonts.primary}; }`,
  };
};
