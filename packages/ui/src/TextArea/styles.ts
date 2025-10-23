import { css } from '@emotion/css';

export const textAreaStyles = {
  base: css`
    .textarea-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-md);
      font-family: var(--font-primary);
      font-size: 0.875rem;
      line-height: 1.5;
      resize: vertical;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
      background-color: var(--color-background);
      color: var(--color-text);
    }
    
    .textarea:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    .textarea.error {
      border-color: var(--color-error);
    }
    
    .textarea.error:focus {
      border-color: var(--color-error);
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
    
    .textarea:disabled {
      background-color: var(--color-surface);
      color: var(--color-text-secondary);
      cursor: not-allowed;
      opacity: 0.6;
    }
    
    .textarea:read-only {
      background-color: var(--color-surface);
      cursor: default;
    }
    
    .textarea-label {
      font-weight: 500;
      color: var(--color-text);
      font-size: 0.875rem;
      margin-bottom: 0.25rem;
    }
    
    .textarea-required {
      color: var(--color-error);
      margin-left: 0.25rem;
    }
    
    .textarea-error {
      color: var(--color-error);
      font-size: 0.75rem;
      margin: 0;
      margin-top: 0.25rem;
    }
    
    .textarea-helper {
      color: var(--color-text-secondary);
      font-size: 0.75rem;
      margin: 0;
      margin-top: 0.25rem;
    }
  `,
  
  sizes: {
    sm: css`
      .textarea.textarea-sm {
        padding: 0.5rem;
        font-size: 0.75rem;
      }
    `,
    md: css`
      .textarea.textarea-md {
        padding: 0.75rem;
        font-size: 0.875rem;
      }
    `,
    lg: css`
      .textarea.textarea-lg {
        padding: 1rem;
        font-size: 1rem;
      }
    `,
  },
  
  variants: {
    filled: css`
      .textarea.textarea-filled {
        background-color: var(--color-surface);
        border: 1px solid transparent;
      }
      
      .textarea.textarea-filled:focus {
        background-color: var(--color-background);
        border-color: var(--color-primary);
      }
    `,
    outlined: css`
      .textarea.textarea-outlined {
        background-color: transparent;
        border: 2px solid var(--color-border);
      }
    `,
    underlined: css`
      .textarea.textarea-underlined {
        background-color: transparent;
        border: none;
        border-bottom: 2px solid var(--color-border);
        border-radius: 0;
      }
      
      .textarea.textarea-underlined:focus {
        border-bottom-color: var(--color-primary);
        box-shadow: none;
      }
    `,
  },
  
  responsive: css`
    @media (max-width: 768px) {
      .textarea {
        font-size: 16px; /* Prevents zoom on iOS */
      }
    }
  `,
  
  darkMode: css`
    @media (prefers-color-scheme: dark) {
      .textarea {
        background-color: #1F2937;
        border-color: #374151;
        color: #F9FAFB;
      }
      
      .textarea:focus {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
      }
      
      .textarea:disabled {
        background-color: #111827;
        color: #6B7280;
      }
      
      .textarea:read-only {
        background-color: #111827;
      }
    }
  `,
};
