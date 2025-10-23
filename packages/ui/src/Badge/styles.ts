import { css } from '@emotion/css';

export const badgeStyles = {
  base: css`
    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.25rem;
      font-family: var(--font-primary);
      font-weight: 500;
      border: 1px solid;
      transition: all 0.2s ease;
      white-space: nowrap;
    }
  `,
  
  sizes: {
    small: css`
      .badge-small {
        padding: 0.25rem 0.5rem;
        font-size: 0.75rem;
        min-height: 1.25rem;
      }
    `,
    medium: css`
      .badge-medium {
        padding: 0.375rem 0.75rem;
        font-size: 0.875rem;
        min-height: 1.5rem;
      }
    `,
    large: css`
      .badge-large {
        padding: 0.5rem 1rem;
        font-size: 1rem;
        min-height: 1.75rem;
      }
    `,
  },
  
  shapes: {
    rounded: css`
      .badge-rounded {
        border-radius: 0.375rem;
      }
    `,
    pill: css`
      .badge-pill {
        border-radius: 9999px;
      }
    `,
    square: css`
      .badge-square {
        border-radius: 0;
      }
    `,
  },
  
  variants: {
    primary: css`
      .badge-primary {
        color: var(--color-primary);
        background-color: var(--color-primary-20);
        border-color: var(--color-primary-40);
      }
    `,
    secondary: css`
      .badge-secondary {
        color: var(--color-text-secondary);
        background-color: var(--color-text-secondary-20);
        border-color: var(--color-text-secondary-40);
      }
    `,
    success: css`
      .badge-success {
        color: var(--color-success);
        background-color: var(--color-success-20);
        border-color: var(--color-success-40);
      }
    `,
    error: css`
      .badge-error {
        color: var(--color-error);
        background-color: var(--color-error-20);
        border-color: var(--color-error-40);
      }
    `,
    warning: css`
      .badge-warning {
        color: var(--color-warning);
        background-color: var(--color-warning-20);
        border-color: var(--color-warning-40);
      }
    `,
    info: css`
      .badge-info {
        color: var(--color-info);
        background-color: var(--color-info-20);
        border-color: var(--color-info-40);
      }
    `,
  },
  
  dot: css`
    .badge-dot {
      width: 0.5rem;
      height: 0.5rem;
      padding: 0;
      min-height: 0.5rem;
      border-radius: 50%;
    }
  `,
  
  close: css`
    .badge-close {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      margin-left: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: inherit;
      font-size: 0.75rem;
      transition: opacity 0.2s ease;
    }
    
    .badge-close:hover {
      opacity: 0.7;
    }
    
    .badge-close:focus {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }
  `,
  
  icon: css`
    .badge-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875em;
    }
  `,
  
  content: css`
    .badge-content {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 0;
    }
  `,
  
  hover: css`
    .badge:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  `,
  
  focus: css`
    .badge:focus {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }
  `,
  
  disabled: css`
    .badge-disabled {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }
  `,
  
  responsive: css`
    @media (max-width: 768px) {
      .badge-large {
        padding: 0.375rem 0.75rem;
        font-size: 0.875rem;
        min-height: 1.5rem;
      }
    }
  `,
  
  darkMode: css`
    @media (prefers-color-scheme: dark) {
      .badge-primary {
        color: var(--color-primary-light);
        background-color: var(--color-primary-30);
        border-color: var(--color-primary-50);
      }
      
      .badge-secondary {
        color: var(--color-text-light);
        background-color: var(--color-text-secondary-30);
        border-color: var(--color-text-secondary-50);
      }
    }
  `,
  
  animations: css`
    .badge {
      animation: fadeIn 0.2s ease-in-out;
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: scale(0.9);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    
    .badge-close {
      animation: slideIn 0.2s ease-in-out;
    }
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(-0.25rem);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `,
};
