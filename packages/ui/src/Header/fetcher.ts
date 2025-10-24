import { TenantTheme } from '../types';
import { MenuItem } from '../Menu';
import { defaultTheme } from '../theme';

export interface HeaderData {
  tenantTheme: TenantTheme;
  logoUrl?: string;
  menuItems: MenuItem[];
}

export const fetchHeaderData = async (
  tenantId?: string
): Promise<HeaderData> => {
  // In a real implementation, this would fetch tenant-specific header data
  const defaultMenuItems: MenuItem[] = [
    { id: 'home', label: 'Home', href: '/' },
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { id: 'courses', label: 'Courses', href: '/courses' },
    { id: 'profile', label: 'Profile', href: '/profile' },
  ];

  return {
    tenantTheme: defaultTheme,
    logoUrl: '/logo.png',
    menuItems: defaultMenuItems,
  };
};

export const fetchHeaderSSR = async (
  tenantId?: string
): Promise<{ html: string; styles: string }> => {
  const data = await fetchHeaderData(tenantId);
  
  const menuItemsHtml = data.menuItems
    .map(item => `<a href="${item.href}" class="header-nav-item">${item.label}</a>`)
    .join('');
  
  const html = `
    <header class="header" style="background-color: ${data.tenantTheme.colors.surface}; border-bottom: 1px solid ${data.tenantTheme.colors.border}; color: ${data.tenantTheme.colors.text}; font-family: ${data.tenantTheme.fonts.primary};">
      <div class="header-container">
        ${data.logoUrl ? `<div class="header-logo"><img src="${data.logoUrl}" alt="Logo" class="header-logo-image" /></div>` : ''}
        <nav class="header-nav">${menuItemsHtml}</nav>
      </div>
    </header>
  `;
  
  const styles = `
    .header {
      position: sticky;
      top: 0;
      z-index: 1000;
      padding: 1rem 0;
    }
    .header-container {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1rem;
    }
    .header-logo-image {
      height: 2rem;
    }
    .header-nav {
      display: flex;
      gap: 2rem;
    }
    .header-nav-item {
      text-decoration: none;
      color: inherit;
      font-weight: 500;
    }
  `;
  
  return { html, styles };
};
