import { css } from '@emotion/css';

export const selectStyles = {
  base: css`
    .select-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .select-container {
      position: relative;
    }
    
    .select-trigger {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-md);
      font-family: var(--font-primary);
      font-size: 0.875rem;
      background-color: var(--color-background);
      color: var(--color-text);
      cursor: pointer;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: 2.5rem;
    }
    
    .select-trigger:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    .select-trigger.error {
      border-color: var(--color-error);
    }
    
    .select-trigger.error:focus {
      border-color: var(--color-error);
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
    
    .select-trigger.disabled {
      background-color: var(--color-surface);
      color: var(--color-text-secondary);
      cursor: not-allowed;
      opacity: 0.6;
    }
    
    .select-value {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .select-placeholder {
      color: var(--color-text-secondary);
    }
    
    .select-single-value {
      color: var(--color-text);
    }
    
    .select-multi-value {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
    }
    
    .select-multi-tag {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      background-color: var(--color-primary);
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: var(--border-radius-sm);
      font-size: 0.75rem;
    }
    
    .select-multi-remove {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      font-size: 0.875rem;
      padding: 0;
      margin-left: 0.25rem;
    }
    
    .select-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .select-clear {
      background: none;
      border: none;
      color: var(--color-text-secondary);
      cursor: pointer;
      font-size: 1.25rem;
      padding: 0;
      width: 1.25rem;
      height: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .select-arrow {
      color: var(--color-text-secondary);
      font-size: 0.75rem;
      transition: transform 0.2s ease;
    }
    
    .select-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background-color: var(--color-background);
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-md);
      box-shadow: var(--shadow-lg);
      z-index: 1000;
      max-height: 200px;
      overflow-y: auto;
    }
    
    .select-search {
      padding: 0.5rem;
      border-bottom: 1px solid var(--color-border);
    }
    
    .select-search-input {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-sm);
      font-size: 0.875rem;
    }
    
    .select-options {
      padding: 0.25rem 0;
    }
    
    .select-option {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }
    
    .select-option:hover {
      background-color: var(--color-surface);
    }
    
    .select-option.selected {
      background-color: var(--color-primary);
      color: white;
    }
    
    .select-option.disabled {
      color: var(--color-text-secondary);
      cursor: not-allowed;
      opacity: 0.6;
    }
    
    .select-checkbox {
      margin: 0;
    }
    
    .select-option-label {
      flex: 1;
    }
    
    .select-label {
      font-weight: 500;
      color: var(--color-text);
      font-size: 0.875rem;
      margin-bottom: 0.25rem;
    }
    
    .select-required {
      color: var(--color-error);
      margin-left: 0.25rem;
    }
    
    .select-error {
      color: var(--color-error);
      font-size: 0.75rem;
      margin: 0;
      margin-top: 0.25rem;
    }
    
    .select-helper {
      color: var(--color-text-secondary);
      font-size: 0.75rem;
      margin: 0;
      margin-top: 0.25rem;
    }
  `,
  
  sizes: {
    sm: css`
      .select-trigger.select-sm {
        padding: 0.5rem;
        font-size: 0.75rem;
        min-height: 2rem;
      }
    `,
    md: css`
      .select-trigger.select-md {
        padding: 0.75rem;
        font-size: 0.875rem;
        min-height: 2.5rem;
      }
    `,
    lg: css`
      .select-trigger.select-lg {
        padding: 1rem;
        font-size: 1rem;
        min-height: 3rem;
      }
    `,
  },
  
  variants: {
    filled: css`
      .select-trigger.select-filled {
        background-color: var(--color-surface);
        border: 1px solid transparent;
      }
      
      .select-trigger.select-filled:focus {
        background-color: var(--color-background);
        border-color: var(--color-primary);
      }
    `,
    outlined: css`
      .select-trigger.select-outlined {
        background-color: transparent;
        border: 2px solid var(--color-border);
      }
    `,
  },
  
  responsive: css`
    @media (max-width: 768px) {
      .select-dropdown {
        max-height: 150px;
      }
      
      .select-option {
        padding: 1rem 0.75rem;
      }
    }
  `,
  
  darkMode: css`
    @media (prefers-color-scheme: dark) {
      .select-trigger {
        background-color: #1F2937;
        border-color: #374151;
        color: #F9FAFB;
      }
      
      .select-trigger:focus {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
      }
      
      .select-trigger.disabled {
        background-color: #111827;
        color: #6B7280;
      }
      
      .select-dropdown {
        background-color: #1F2937;
        border-color: #374151;
      }
      
      .select-option:hover {
        background-color: #374151;
      }
    }
  `,
};
