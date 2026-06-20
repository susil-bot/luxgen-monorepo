import { defaultTheme } from '../theme';
import type { TenantTheme } from '../types';

export interface LastSurveyData {
  tenantTheme: TenantTheme;
}

export const fetchLastSurveyData = async (_tenantId?: string): Promise<LastSurveyData> => {
  return { tenantTheme: defaultTheme };
};

export const fetchLastSurveySSR = async (tenantId?: string): Promise<{ html: string; styles: string }> => {
  const data = await fetchLastSurveyData(tenantId);
  return {
    html: `<div class="last-survey"></div>`,
    styles: `.last-survey { font-family: ${data.tenantTheme.fonts.primary}; }`,
  };
};
