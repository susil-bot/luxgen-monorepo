import { defaultTheme } from '../theme';
import type { TenantTheme } from '../types';

export interface BannerCarouselData {
  tenantTheme: TenantTheme;
}

export const fetchBannerCarouselData = async (_tenantId?: string): Promise<BannerCarouselData> => {
  return { tenantTheme: defaultTheme };
};

export const fetchBannerCarouselSSR = async (tenantId?: string): Promise<{ html: string; styles: string }> => {
  const data = await fetchBannerCarouselData(tenantId);
  return {
    html: `<div class="banner-carousel"></div>`,
    styles: `.banner-carousel { font-family: ${data.tenantTheme.fonts.primary}; }`,
  };
};
