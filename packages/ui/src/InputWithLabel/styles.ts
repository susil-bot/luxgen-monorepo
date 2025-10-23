import { css } from '@emotion/css';

export const inputWithLabelStyles = {
  base: css`
    .input-with-label-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .input-with-label-label {
      font-weight: 500;
      color: var(--color-text);
      font-size: 0.875rem;
      margin-bottom: 0.25rem;
    }
    
    .input-with-label-required {
      color: var(--color-error);
      margin-left: 0.25rem;
    }
    
    .input-with-label-input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-md);
      font-family: var(--font-primary);
      font-size: 0.875rem;
      background-color: var(--color-background);
      color: var(--color-text);
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }
    
    .input-with-label-input:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    .input-with-label-input.error {
      border-color: var(--color-error);
    }
    
    .input-with-label-input.error:focus {
      border-color: var(--color-error);
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
    
    .input-with-label-input:disabled {
      background-color: var(--color-surface);
      color: var(--color-text-secondary);
      cursor: not-allowed;
      opacity: 0.6;
    }
    
    .input-with-label-error {
      color: var(--color-error);
      font-size: 0.75rem;
      margin: 0;
      margin-top: 0.25rem;
    }
    
    .input-with-label-helper {
      color: var(--color-text-secondary);
      font-size: 0.75rem;
      margin: 0;
      margin-top: 0.25rem;
    }
  `,
  
  sizes: {
    sm: css`
      .input-with-label-input.sm {
        padding: 0.5rem;
        font-size: 0.75rem;
      }
      
      .input-with-label-label.sm {
        font-size: 0.75rem;
      }
    `,
    md: css`
      .input-with-label-input.md {
        padding: 0.75rem;
        font-size: 0.875rem;
      }
      
      .input-with-label-label.md {
        font-size: 0.875rem;
      }
    `,
    lg: css`
      .input-with-label-input.lg {
        padding: 1rem;
        font-size: 1rem;
      }
      
      .input-with-label-label.lg {
        font-size: 1rem;
      }
    `,
  },
  
  variants: {
    filled: css`
      .input-with-label-input.input-filled {
        background-color: var(--color-surface);
        border: 1px solid transparent;
      }
      
      .input-with-label-input.input-filled:focus {
        background-color: var(--color-background);
        border-color: var(--color-primary);
      }
    `,
    outlined: css`
      .input-with-label-input.input-outlined {
        background-color: transparent;
        border: 2px solid var(--color-border);
      }
    `,
    underlined: css`
      .input-with-label-input.input-underlined {
        background-color: transparent;
        border: none;
        border-bottom: 2px solid var(--color-border);
        border-radius: 0;
      }
      
      .input-with-label-input.input-underlined:focus {
        border-bottom-color: var(--color-primary);
        box-shadow: none;
      }
    `,
  },
  
  states: {
    error: css`
      .input-with-label-input.error {
        border-color: var(--color-error);
      }
      
      .input-with-label-input.error:focus {
        border-color: var(--color-error);
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
      }
    `,
    success: css`
      .input-with-label-input.success {
        border-color: var(--color-success);
      }
      
      .input-with-label-input.success:focus {
        border-color: var(--color-success);
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
      }
    `,
  },
  
  responsive: css`
    @media (max-width: 768px) {
      .input-with-label-input {
        font-size: 16px; /* Prevents zoom on iOS */
      }
      
      .input-with-label-label {
        font-size: 0.75rem;
      }
    }
  `,
  
  darkMode: css`
    @media (prefers-color-scheme: dark) {
      .input-with-label-input {
        background-color: #1F2937;
        border-color: #374151;
        color: #F9FAFB;
      }
      
      .input-with-label-input:focus {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
      }
      
      .input-with-label-input:disabled {
        background-color: #111827;
        color: #6B7280;
      }
    }
  `,
};
