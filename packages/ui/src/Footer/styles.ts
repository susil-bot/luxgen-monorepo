import { css } from '@emotion/css';

export const footerStyles = {
  base: css`
    .footer {
      margin-top: auto;
      padding: 2rem 0;
      background-color: var(--color-surface);
      border-top: 1px solid var(--color-border);
      color: var(--color-text-secondary);
    }
    
    .footer-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }
    
    .footer-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      align-items: center;
      text-align: center;
    }
    
    .footer-nav {
      display: flex;
      gap: 2rem;
      flex-wrap: wrap;
      justify-content: center;
    }
    
    .footer-link {
      color: inherit;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      transition: color 0.2s ease;
    }
    
    .footer-link:hover {
      color: var(--color-primary);
    }
    
    .footer-copyright {
      margin-top: 0.5rem;
    }
    
    .footer-copyright p {
      margin: 0;
      font-size: 0.875rem;
      color: var(--color-text-secondary);
    }
  `,
  
  mobile: css`
    @media (max-width: 768px) {
      .footer {
        padding: 1.5rem 0;
      }
      
      .footer-container {
        padding: 0 0.5rem;
      }
      
      .footer-nav {
        gap: 1rem;
        flex-direction: column;
        align-items: center;
      }
      
      .footer-link {
        font-size: 0.75rem;
      }
    }
  `,
  
  tablet: css`
    @media (min-width: 769px) and (max-width: 1024px) {
      .footer-container {
        padding: 0 1.5rem;
      }
      
      .footer-nav {
        gap: 1.5rem;
      }
    }
  `,
  
  desktop: css`
    @media (min-width: 1025px) {
      .footer-container {
        padding: 0 2rem;
      }
      
      .footer-nav {
        gap: 2rem;
      }
    }
  `,
  
  darkMode: css`
    @media (prefers-color-scheme: dark) {
      .footer {
        background-color: #1F2937;
        border-top-color: #374151;
        color: #9CA3AF;
      }
      
      .footer-copyright p {
        color: #9CA3AF;
      }
    }
  `,
};
