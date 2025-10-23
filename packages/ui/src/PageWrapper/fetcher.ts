import { TenantTheme } from '../types';
import { defaultTheme } from '../theme';

export interface PageWrapperData {
  tenantTheme: TenantTheme;
  padding?: string;
  className?: string;
}

export const fetchPageWrapperData = async (
  tenantId?: string
): Promise<PageWrapperData> => {
  // In a real implementation, this would fetch tenant-specific theme data
  // For now, we'll return the default theme
  return {
    tenantTheme: defaultTheme,
    padding: '1rem',
    className: 'page-wrapper',
  };
};

export const fetchPageWrapperSSR = async (
  tenantId?: string
): Promise<{ html: string; styles: string }> => {
  const data = await fetchPageWrapperData(tenantId);
  
  // Generate SSR HTML and styles
  const html = `<div class="page-wrapper" style="padding: ${data.padding}; background-color: ${data.tenantTheme.colors.background}; color: ${data.tenantTheme.colors.text}; font-family: ${data.tenantTheme.fonts.primary};"></div>`;
  
  const styles = `
    .page-wrapper {
      min-height: 100vh;
      width: 100%;
    }
  `;
  
  return { html, styles };
};
