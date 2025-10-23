import { css } from '@emotion/css';

export const sidebarStyles = {
  base: css`
    .sidebar {
      height: 100vh;
      position: fixed;
      left: 0;
      top: 0;
      z-index: 100;
      background-color: var(--color-surface);
      border-right: 1px solid var(--color-border);
      transition: width 0.3s ease;
      overflow: hidden;
    }
    
    .sidebar.collapsed {
      width: 4rem;
    }
    
    .sidebar:not(.collapsed) {
      width: 16rem;
    }
    
    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      border-bottom: 1px solid var(--color-border);
      min-height: 4rem;
    }
    
    .sidebar-title {
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0;
      color: var(--color-text);
    }
    
    .sidebar-toggle {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: var(--border-radius-md);
      color: var(--color-text);
      font-size: 1rem;
      transition: all 0.2s ease;
      min-width: 2rem;
      min-height: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .sidebar-toggle:hover {
      background-color: var(--color-primary);
      color: white;
    }
    
    .sidebar-nav {
      padding: 1rem 0;
      overflow-y: auto;
      height: calc(100vh - 4rem);
    }
    
    .sidebar-nav-item {
      display: flex;
      align-items: center;
      padding: 0.75rem 1rem;
      text-decoration: none;
      color: var(--color-text);
      transition: all 0.2s ease;
      border-radius: 0;
      margin: 0 0.5rem;
      border-radius: var(--border-radius-md);
    }
    
    .sidebar-nav-item:hover {
      background-color: var(--color-primary);
      color: white;
    }
    
    .sidebar-nav-icon {
      margin-right: 0.75rem;
      min-width: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .sidebar-nav-label {
      font-size: 0.875rem;
      font-weight: 500;
    }
    
    .sidebar.collapsed .sidebar-nav-label {
      display: none;
    }
    
    .sidebar.collapsed .sidebar-nav-icon {
      margin-right: 0;
    }
    
    .sidebar.collapsed .sidebar-nav-item {
      justify-content: center;
      padding: 0.75rem 0.5rem;
    }
  `,
  
  mobile: css`
    @media (max-width: 768px) {
      .sidebar {
        width: 100vw;
        transform: translateX(-100%);
        transition: transform 0.3s ease;
      }
      
      .sidebar.open {
        transform: translateX(0);
      }
      
      .sidebar.collapsed {
        width: 100vw;
      }
    }
  `,
  
  tablet: css`
    @media (min-width: 769px) and (max-width: 1024px) {
      .sidebar:not(.collapsed) {
        width: 14rem;
      }
    }
  `,
  
  desktop: css`
    @media (min-width: 1025px) {
      .sidebar:not(.collapsed) {
        width: 16rem;
      }
    }
  `,
  
  darkMode: css`
    @media (prefers-color-scheme: dark) {
      .sidebar {
        background-color: #1F2937;
        border-right-color: #374151;
      }
      
      .sidebar-title {
        color: #F9FAFB;
      }
      
      .sidebar-nav-item {
        color: #F9FAFB;
      }
      
      .sidebar-toggle {
        color: #F9FAFB;
      }
    }
  `,
};
