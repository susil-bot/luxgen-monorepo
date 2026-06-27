import { defaultTheme } from '../theme';
import type { TenantTheme } from '../types';

export interface AIStudioData {
  tenantTheme: TenantTheme;
}

export const fetchAIStudioData = async (_tenantId?: string): Promise<AIStudioData> => {
  return { tenantTheme: defaultTheme };
};

export const fetchAIStudioSSR = async (tenantId?: string): Promise<{ html: string; styles: string }> => {
  const data = await fetchAIStudioData(tenantId);
  return {
    html: `<div class="aistudio"></div>`,
    styles: `.aistudio { font-family: ${data.tenantTheme.fonts.primary}; }`,
  };
};
