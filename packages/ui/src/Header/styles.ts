import { css } from '@emotion/css';

export const headerStyles = {
  base: css`
    .header {
      position: sticky;
      top: 0;
      z-index: 1000;
      padding: 1rem 0;
      background-color: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
    }
    
    .header-container {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1rem;
    }
    
    .header-logo {
      display: flex;
      align-items: center;
    }
    
    .header-logo-image {
      height: 2rem;
      width: auto;
    }
    
    .header-nav {
      display: flex;
      gap: 2rem;
      align-items: center;
    }
    
    .header-nav-item {
      text-decoration: none;
      color: var(--color-text);
      font-weight: 500;
      padding: 0.5rem 1rem;
      border-radius: var(--border-radius-md);
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .header-nav-item:hover {
      background-color: var(--color-primary);
      color: white;
    }
    
    .header-nav-icon {
      display: flex;
      align-items: center;
    }
    
    .header-nav-label {
      font-size: 0.875rem;
    }
  `,
  
  mobile: css`
    @media (max-width: 768px) {
      .header-container {
        padding: 0 0.5rem;
      }
      
      .header-nav {
        gap: 1rem;
      }
      
      .header-nav-item {
        padding: 0.25rem 0.5rem;
        font-size: 0.75rem;
      }
      
      .header-logo-image {
        height: 1.5rem;
      }
    }
  `,
  
  tablet: css`
    @media (min-width: 769px) and (max-width: 1024px) {
      .header-container {
        padding: 0 1.5rem;
      }
      
      .header-nav {
        gap: 1.5rem;
      }
    }
  `,
  
  desktop: css`
    @media (min-width: 1025px) {
      .header-container {
        padding: 0 2rem;
      }
      
      .header-nav {
        gap: 2rem;
      }
    }
  `,
  
  darkMode: css`
    @media (prefers-color-scheme: dark) {
      .header {
        background-color: #1F2937;
        border-bottom-color: #374151;
      }
      
      .header-nav-item {
        color: #F9FAFB;
      }
      
      .header-nav-item:hover {
        background-color: var(--color-primary);
        color: white;
      }
    }
  `,
};
