import { css } from '@emotion/css';

export const switchStyles = {
  base: css`
    .switch-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .switch-label {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      font-family: var(--font-primary);
      font-size: 0.875rem;
      color: var(--color-text);
      transition: opacity 0.2s ease;
    }
    
    .switch-label.disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
    
    .switch-input {
      position: absolute;
      opacity: 0;
      cursor: pointer;
      width: 0;
      height: 0;
    }
    
    .switch-custom {
      position: relative;
      background-color: var(--color-border);
      border-radius: 9999px;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }
    
    .switch-custom:hover {
      background-color: var(--color-text-secondary);
    }
    
    .switch-custom.error {
      background-color: var(--color-error);
    }
    
    .switch-input:checked + .switch-custom {
      background-color: var(--color-primary);
    }
    
    .switch-input:checked + .switch-custom .switch-thumb {
      transform: translateX(100%);
    }
    
    .switch-input:focus + .switch-custom {
      outline: none;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    .switch-thumb {
      position: absolute;
      top: 0.125rem;
      left: 0.125rem;
      background-color: white;
      border-radius: 50%;
      transition: transform 0.2s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .switch-text {
      flex: 1;
      line-height: 1.5;
    }
    
    .switch-required {
      color: var(--color-error);
      margin-left: 0.25rem;
    }
    
    .switch-error {
      color: var(--color-error);
      font-size: 0.75rem;
      margin: 0;
      margin-top: 0.25rem;
    }
    
    .switch-helper {
      color: var(--color-text-secondary);
      font-size: 0.75rem;
      margin: 0;
      margin-top: 0.25rem;
    }
  `,
  
  sizes: {
    sm: css`
      .switch-custom.sm {
        width: 2rem;
        height: 1rem;
      }
      
      .switch-custom.sm .switch-thumb {
        width: 0.75rem;
        height: 0.75rem;
      }
      
      .switch-label.sm {
        font-size: 0.75rem;
      }
    `,
    md: css`
      .switch-custom.md {
        width: 2.5rem;
        height: 1.25rem;
      }
      
      .switch-custom.md .switch-thumb {
        width: 1rem;
        height: 1rem;
      }
      
      .switch-label.md {
        font-size: 0.875rem;
      }
    `,
    lg: css`
      .switch-custom.lg {
        width: 3rem;
        height: 1.5rem;
      }
      
      .switch-custom.lg .switch-thumb {
        width: 1.25rem;
        height: 1.25rem;
      }
      
      .switch-label.lg {
        font-size: 1rem;
      }
    `,
  },
  
  variants: {
    filled: css`
      .switch-custom.switch-filled {
        background-color: var(--color-surface);
        border: 2px solid transparent;
      }
      
      .switch-custom.switch-filled:hover {
        background-color: var(--color-primary);
        border-color: var(--color-primary);
      }
    `,
    outlined: css`
      .switch-custom.switch-outlined {
        background-color: transparent;
        border: 2px solid var(--color-border);
      }
    `,
    rounded: css`
      .switch-custom.switch-rounded {
        border-radius: var(--border-radius-lg);
      }
    `,
  },
  
  states: {
    checked: css`
      .switch-input:checked + .switch-custom {
        background-color: var(--color-primary);
      }
      
      .switch-input:checked + .switch-custom .switch-thumb {
        transform: translateX(100%);
      }
    `,
    unchecked: css`
      .switch-input:not(:checked) + .switch-custom {
        background-color: var(--color-border);
      }
      
      .switch-input:not(:checked) + .switch-custom .switch-thumb {
        transform: translateX(0);
      }
    `,
  },
  
  responsive: css`
    @media (max-width: 768px) {
      .switch-label {
        font-size: 0.75rem;
      }
      
      .switch-custom {
        width: 2rem;
        height: 1rem;
      }
      
      .switch-thumb {
        width: 0.75rem;
        height: 0.75rem;
      }
    }
  `,
  
  darkMode: css`
    @media (prefers-color-scheme: dark) {
      .switch-custom {
        background-color: #374151;
      }
      
      .switch-custom:hover {
        background-color: #4B5563;
      }
      
      .switch-input:checked + .switch-custom {
        background-color: var(--color-primary);
      }
      
      .switch-thumb {
        background-color: #F9FAFB;
      }
    }
  `,
};
