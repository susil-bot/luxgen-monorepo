import { css } from '@emotion/css';

export const accordionStyles = {
  base: css`
    .accordion {
      font-family: var(--font-primary);
      color: var(--color-text);
    }
  `,
  
  item: css`
    .accordion-item {
      border-bottom: 1px solid var(--color-border);
    }
    
    .accordion-item:last-child {
      border-bottom: none;
    }
  `,
  
  trigger: css`
    .accordion-trigger {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: none;
      border: none;
      cursor: pointer;
      padding: 1rem 1.25rem;
      text-align: left;
      font-family: var(--font-primary);
      font-size: 1rem;
      color: var(--color-text);
      transition: all 0.2s ease;
    }
    
    .accordion-trigger:hover {
      background-color: var(--color-background-secondary);
    }
    
    .accordion-trigger:focus {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }
    
    .accordion-trigger:disabled {
      cursor: not-allowed;
      color: var(--color-text-secondary);
    }
  `,
  
  title: css`
    .accordion-title {
      flex: 1;
    }
  `,
  
  icon: css`
    .accordion-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 1.5rem;
      height: 1.5rem;
      font-size: 1rem;
      color: var(--color-text-secondary);
      transition: transform 0.2s ease;
    }
    
    .accordion-item.open .accordion-icon {
      transform: rotate(180deg);
    }
  `,
  
  content: css`
    .accordion-content {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease;
      background-color: var(--color-background);
    }
    
    .accordion-item.open .accordion-content {
      max-height: 1000px;
    }
  `,
  
  contentInner: css`
    .accordion-content-inner {
      padding: 1rem 1.25rem;
      border-top: 1px solid var(--color-border);
    }
    
    .accordion-item.open .accordion-content-inner {
      border-top: 1px solid var(--color-border);
    }
  `,
  
  variants: {
    default: css`
      .accordion-default {
        border: 1px solid var(--color-border);
        border-radius: 0.375rem;
        overflow: hidden;
      }
    `,
    bordered: css`
      .accordion-bordered {
        border: 2px solid var(--color-border);
        border-radius: 0.5rem;
        overflow: hidden;
      }
    `,
    filled: css`
      .accordion-filled {
        background-color: var(--color-background-secondary);
        border-radius: 0.375rem;
        overflow: hidden;
      }
    `,
    minimal: css`
      .accordion-minimal {
        border: none;
        border-radius: 0;
        overflow: visible;
      }
    `,
  },
  
  sizes: {
    small: css`
      .accordion-small {
        font-size: 0.875rem;
      }
      
      .accordion-small .accordion-trigger {
        padding: 0.75rem 1rem;
      }
      
      .accordion-small .accordion-content-inner {
        padding: 0.75rem 1rem;
      }
    `,
    medium: css`
      .accordion-medium {
        font-size: 1rem;
      }
      
      .accordion-medium .accordion-trigger {
        padding: 1rem 1.25rem;
      }
      
      .accordion-medium .accordion-content-inner {
        padding: 1rem 1.25rem;
      }
    `,
    large: css`
      .accordion-large {
        font-size: 1.125rem;
      }
      
      .accordion-large .accordion-trigger {
        padding: 1.25rem 1.5rem;
      }
      
      .accordion-large .accordion-content-inner {
        padding: 1.25rem 1.5rem;
      }
    `,
  },
  
  states: {
    open: css`
      .accordion-item.open .accordion-trigger {
        background-color: var(--color-background-secondary);
      }
    `,
    disabled: css`
      .accordion-item.disabled .accordion-trigger {
        cursor: not-allowed;
        color: var(--color-text-secondary);
      }
    `,
  },
  
  animations: css`
    .accordion-content {
      animation: slideDown 0.3s ease;
    }
    
    @keyframes slideDown {
      from {
        max-height: 0;
        opacity: 0;
      }
      to {
        max-height: 1000px;
        opacity: 1;
      }
    }
    
    .accordion-icon {
      animation: rotate 0.2s ease;
    }
    
    @keyframes rotate {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(180deg);
      }
    }
  `,
  
  responsive: css`
    @media (max-width: 768px) {
      .accordion-trigger {
        padding: 0.75rem 1rem;
      }
      
      .accordion-content-inner {
        padding: 0.75rem 1rem;
      }
      
      .accordion-icon {
        width: 1.25rem;
        height: 1.25rem;
        font-size: 0.875rem;
      }
    }
  `,
  
  darkMode: css`
    @media (prefers-color-scheme: dark) {
      .accordion-trigger:hover {
        background-color: var(--color-background-secondary-dark);
      }
      
      .accordion-item.open .accordion-trigger {
        background-color: var(--color-background-secondary-dark);
      }
      
      .accordion-content {
        background-color: var(--color-background-dark);
      }
    }
  `,
  
  accessibility: css`
    .accordion:focus {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }
    
    .accordion-trigger:focus {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }
    
    .accordion-trigger:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }
  `,
};
