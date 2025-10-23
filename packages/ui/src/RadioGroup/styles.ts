import { css } from '@emotion/css';

export const radioGroupStyles = {
  base: css`
    .radio-group-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .radio-group {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    
    .radio-group.horizontal {
      flex-direction: row;
      gap: 1.5rem;
      flex-wrap: wrap;
    }
    
    .radio-option {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      font-family: var(--font-primary);
      font-size: 0.875rem;
      color: var(--color-text);
      transition: opacity 0.2s ease;
    }
    
    .radio-option.disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
    
    .radio-input {
      position: absolute;
      opacity: 0;
      cursor: pointer;
      width: 0;
      height: 0;
    }
    
    .radio-custom {
      position: relative;
      width: 1.25rem;
      height: 1.25rem;
      border: 2px solid var(--color-border);
      border-radius: 50%;
      background-color: var(--color-background);
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .radio-custom:hover {
      border-color: var(--color-primary);
    }
    
    .radio-custom.error {
      border-color: var(--color-error);
    }
    
    .radio-input:checked + .radio-custom {
      border-color: var(--color-primary);
    }
    
    .radio-input:checked + .radio-custom .radio-dot {
      display: block;
    }
    
    .radio-input:focus + .radio-custom {
      outline: none;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    .radio-dot {
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 50%;
      background-color: var(--color-primary);
      display: none;
    }
    
    .radio-text {
      flex: 1;
      line-height: 1.5;
    }
    
    .radio-group-label {
      font-weight: 500;
      color: var(--color-text);
      font-size: 0.875rem;
      margin-bottom: 0.25rem;
    }
    
    .radio-group-required {
      color: var(--color-error);
      margin-left: 0.25rem;
    }
    
    .radio-group-error {
      color: var(--color-error);
      font-size: 0.75rem;
      margin: 0;
      margin-top: 0.25rem;
    }
    
    .radio-group-helper {
      color: var(--color-text-secondary);
      font-size: 0.75rem;
      margin: 0;
      margin-top: 0.25rem;
    }
  `,
  
  sizes: {
    sm: css`
      .radio-custom.radio-sm {
        width: 1rem;
        height: 1rem;
      }
      
      .radio-dot.radio-sm {
        width: 0.375rem;
        height: 0.375rem;
      }
      
      .radio-option.radio-sm {
        font-size: 0.75rem;
      }
    `,
    md: css`
      .radio-custom.radio-md {
        width: 1.25rem;
        height: 1.25rem;
      }
      
      .radio-dot.radio-md {
        width: 0.5rem;
        height: 0.5rem;
      }
      
      .radio-option.radio-md {
        font-size: 0.875rem;
      }
    `,
    lg: css`
      .radio-custom.radio-lg {
        width: 1.5rem;
        height: 1.5rem;
      }
      
      .radio-dot.radio-lg {
        width: 0.625rem;
        height: 0.625rem;
      }
      
      .radio-option.radio-lg {
        font-size: 1rem;
      }
    `,
  },
  
  variants: {
    filled: css`
      .radio-custom.radio-filled {
        background-color: var(--color-surface);
        border: 2px solid transparent;
      }
      
      .radio-custom.radio-filled:hover {
        background-color: var(--color-primary);
        border-color: var(--color-primary);
      }
    `,
    outlined: css`
      .radio-custom.radio-outlined {
        background-color: transparent;
        border: 2px solid var(--color-border);
      }
    `,
  },
  
  states: {
    checked: css`
      .radio-input:checked + .radio-custom {
        border-color: var(--color-primary);
      }
      
      .radio-input:checked + .radio-custom .radio-dot {
        display: block;
      }
    `,
    unchecked: css`
      .radio-input:not(:checked) + .radio-custom {
        background-color: var(--color-background);
        border-color: var(--color-border);
      }
    `,
  },
  
  responsive: css`
    @media (max-width: 768px) {
      .radio-group.horizontal {
        flex-direction: column;
        gap: 0.75rem;
      }
      
      .radio-option {
        font-size: 0.75rem;
      }
      
      .radio-custom {
        width: 1.125rem;
        height: 1.125rem;
      }
      
      .radio-dot {
        width: 0.375rem;
        height: 0.375rem;
      }
    }
  `,
  
  darkMode: css`
    @media (prefers-color-scheme: dark) {
      .radio-custom {
        background-color: #1F2937;
        border-color: #374151;
      }
      
      .radio-custom:hover {
        border-color: var(--color-primary);
      }
      
      .radio-input:checked + .radio-custom {
        border-color: var(--color-primary);
      }
      
      .radio-input:checked + .radio-custom .radio-dot {
        background-color: var(--color-primary);
      }
    }
  `,
};
