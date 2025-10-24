import { TenantTheme } from '../types';
import { MenuItem } from '../Menu';
import { defaultTheme } from '../theme';

export interface SidebarData {
  tenantTheme: TenantTheme;
  menuItems: MenuItem[];
  collapsed: boolean;
}

export const fetchSidebarData = async (
  tenantId?: string
): Promise<SidebarData> => {
  const defaultMenuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { id: 'courses', label: 'Courses', href: '/courses' },
    { id: 'students', label: 'Students', href: '/students' },
    { id: 'instructors', label: 'Instructors', href: '/instructors' },
    { id: 'analytics', label: 'Analytics', href: '/analytics' },
    { id: 'settings', label: 'Settings', href: '/settings' },
  ];

  return {
    tenantTheme: defaultTheme,
    menuItems: defaultMenuItems,
    collapsed: false,
  };
};

export const fetchSidebarSSR = async (
  tenantId?: string
): Promise<{ html: string; styles: string }> => {
  const data = await fetchSidebarData(tenantId);
  
  const menuItemsHtml = data.menuItems
    .map(item => `
      <a href="${item.href}" class="sidebar-nav-item" title="${item.label}">
        <span class="sidebar-nav-icon">📊</span>
        <span class="sidebar-nav-label">${item.label}</span>
      </a>
    `)
    .join('');
  
  const html = `
    <aside class="sidebar" style="background-color: ${data.tenantTheme.colors.surface}; border-right: 1px solid ${data.tenantTheme.colors.border}; color: ${data.tenantTheme.colors.text}; font-family: ${data.tenantTheme.fonts.primary}; width: 16rem;">
      <div class="sidebar-header">
        <h2 class="sidebar-title">Navigation</h2>
        <button class="sidebar-toggle" aria-label="Collapse sidebar">←</button>
      </div>
      <nav class="sidebar-nav">${menuItemsHtml}</nav>
    </aside>
  `;
  
  const styles = `
    .sidebar {
      height: 100vh;
      position: fixed;
      left: 0;
      top: 0;
      z-index: 100;
      transition: width 0.3s ease;
    }
    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      border-bottom: 1px solid var(--color-border);
    }
    .sidebar-title {
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0;
    }
    .sidebar-toggle {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: var(--border-radius-md);
    }
    .sidebar-nav {
      padding: 1rem 0;
    }
    .sidebar-nav-item {
      display: flex;
      align-items: center;
      padding: 0.75rem 1rem;
      text-decoration: none;
      color: var(--color-text);
      transition: all 0.2s ease;
    }
    .sidebar-nav-item:hover {
      background-color: var(--color-primary);
      color: white;
    }
    .sidebar-nav-icon {
      margin-right: 0.75rem;
    }
  `;
  
  return { html, styles };
};
