import { css } from '@emotion/css';

export const checkboxStyles = {
  base: css`
    .checkbox-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      font-family: var(--font-primary);
      font-size: 0.875rem;
      color: var(--color-text);
      transition: opacity 0.2s ease;
    }
    
    .checkbox-label.disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
    
    .checkbox-input {
      position: absolute;
      opacity: 0;
      cursor: pointer;
      width: 0;
      height: 0;
    }
    
    .checkbox-custom {
      position: relative;
      width: 1.25rem;
      height: 1.25rem;
      border: 2px solid var(--color-border);
      border-radius: var(--border-radius-sm);
      background-color: var(--color-background);
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .checkbox-custom:hover {
      border-color: var(--color-primary);
    }
    
    .checkbox-custom.error {
      border-color: var(--color-error);
    }
    
    .checkbox-input:checked + .checkbox-custom {
      background-color: var(--color-primary);
      border-color: var(--color-primary);
    }
    
    .checkbox-input:checked + .checkbox-custom .checkbox-check {
      display: block;
    }
    
    .checkbox-input:indeterminate + .checkbox-custom {
      background-color: var(--color-primary);
      border-color: var(--color-primary);
    }
    
    .checkbox-input:indeterminate + .checkbox-custom .checkbox-indeterminate {
      display: block;
    }
    
    .checkbox-input:focus + .checkbox-custom {
      outline: none;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    .checkbox-icon {
      width: 0.75rem;
      height: 0.75rem;
      color: white;
    }
    
    .checkbox-check {
      display: none;
    }
    
    .checkbox-indeterminate {
      display: none;
    }
    
    .checkbox-text {
      flex: 1;
      line-height: 1.5;
    }
    
    .checkbox-required {
      color: var(--color-error);
      margin-left: 0.25rem;
    }
    
    .checkbox-error {
      color: var(--color-error);
      font-size: 0.75rem;
      margin: 0;
      margin-top: 0.25rem;
    }
    
    .checkbox-helper {
      color: var(--color-text-secondary);
      font-size: 0.75rem;
      margin: 0;
      margin-top: 0.25rem;
    }
  `,
  
  sizes: {
    sm: css`
      .checkbox-custom.checkbox-sm {
        width: 1rem;
        height: 1rem;
      }
      
      .checkbox-icon.checkbox-sm {
        width: 0.625rem;
        height: 0.625rem;
      }
      
      .checkbox-label.checkbox-sm {
        font-size: 0.75rem;
      }
    `,
    md: css`
      .checkbox-custom.checkbox-md {
        width: 1.25rem;
        height: 1.25rem;
      }
      
      .checkbox-icon.checkbox-md {
        width: 0.75rem;
        height: 0.75rem;
      }
      
      .checkbox-label.checkbox-md {
        font-size: 0.875rem;
      }
    `,
    lg: css`
      .checkbox-custom.checkbox-lg {
        width: 1.5rem;
        height: 1.5rem;
      }
      
      .checkbox-icon.checkbox-lg {
        width: 0.875rem;
        height: 0.875rem;
      }
      
      .checkbox-label.checkbox-lg {
        font-size: 1rem;
      }
    `,
  },
  
  variants: {
    filled: css`
      .checkbox-custom.checkbox-filled {
        background-color: var(--color-surface);
        border: 2px solid transparent;
      }
      
      .checkbox-custom.checkbox-filled:hover {
        background-color: var(--color-primary);
        border-color: var(--color-primary);
      }
    `,
    outlined: css`
      .checkbox-custom.checkbox-outlined {
        background-color: transparent;
        border: 2px solid var(--color-border);
      }
    `,
    rounded: css`
      .checkbox-custom.checkbox-rounded {
        border-radius: 50%;
      }
    `,
  },
  
  states: {
    checked: css`
      .checkbox-input:checked + .checkbox-custom {
        background-color: var(--color-primary);
        border-color: var(--color-primary);
      }
    `,
    unchecked: css`
      .checkbox-input:not(:checked) + .checkbox-custom {
        background-color: var(--color-background);
        border-color: var(--color-border);
      }
    `,
    indeterminate: css`
      .checkbox-input:indeterminate + .checkbox-custom {
        background-color: var(--color-primary);
        border-color: var(--color-primary);
      }
    `,
  },
  
  responsive: css`
    @media (max-width: 768px) {
      .checkbox-label {
        font-size: 0.75rem;
      }
      
      .checkbox-custom {
        width: 1.125rem;
        height: 1.125rem;
      }
      
      .checkbox-icon {
        width: 0.625rem;
        height: 0.625rem;
      }
    }
  `,
  
  darkMode: css`
    @media (prefers-color-scheme: dark) {
      .checkbox-custom {
        background-color: #1F2937;
        border-color: #374151;
      }
      
      .checkbox-custom:hover {
        border-color: var(--color-primary);
      }
      
      .checkbox-input:checked + .checkbox-custom {
        background-color: var(--color-primary);
        border-color: var(--color-primary);
      }
      
      .checkbox-input:indeterminate + .checkbox-custom {
        background-color: var(--color-primary);
        border-color: var(--color-primary);
      }
    }
  `,
};
