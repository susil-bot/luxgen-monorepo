import { css } from '@emotion/css';

export const formStyles = {
  base: css`
    .form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      font-family: var(--font-primary);
      color: var(--color-text);
    }
    
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .form-row {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
    }
    
    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 1.5rem;
    }
    
    .form-error {
      color: var(--color-error);
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }
    
    .form-success {
      color: var(--color-success);
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }
    
    .form-help {
      color: var(--color-text-secondary);
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }
  `,
  
  layouts: {
    inline: css`
      .form.form-inline {
        flex-direction: row;
        align-items: flex-end;
        gap: 1rem;
      }
      
      .form.form-inline .form-group {
        flex: 1;
      }
    `,
    horizontal: css`
      .form.form-horizontal .form-group {
        flex-direction: row;
        align-items: center;
        gap: 1rem;
      }
      
      .form.form-horizontal .form-group label {
        min-width: 120px;
        text-align: right;
      }
    `,
    vertical: css`
      .form.form-vertical {
        flex-direction: column;
      }
    `,
  },
  
  sizes: {
    sm: css`
      .form.form-sm {
        gap: 0.75rem;
      }
      
      .form.form-sm .form-group {
        gap: 0.375rem;
      }
      
      .form.form-sm .form-actions {
        margin-top: 1rem;
      }
    `,
    md: css`
      .form.form-md {
        gap: 1rem;
      }
      
      .form.form-md .form-group {
        gap: 0.5rem;
      }
      
      .form.form-md .form-actions {
        margin-top: 1.5rem;
      }
    `,
    lg: css`
      .form.form-lg {
        gap: 1.5rem;
      }
      
      .form.form-lg .form-group {
        gap: 0.75rem;
      }
      
      .form.form-lg .form-actions {
        margin-top: 2rem;
      }
    `,
  },
  
  states: {
    loading: css`
      .form.form-loading {
        opacity: 0.6;
        pointer-events: none;
      }
    `,
    error: css`
      .form.form-error {
        border: 1px solid var(--color-error);
        border-radius: var(--border-radius-md);
        padding: 1rem;
      }
    `,
    success: css`
      .form.form-success {
        border: 1px solid var(--color-success);
        border-radius: var(--border-radius-md);
        padding: 1rem;
      }
    `,
  },
  
  responsive: css`
    @media (max-width: 768px) {
      .form-row {
        flex-direction: column;
        gap: 0.5rem;
      }
      
      .form-actions {
        flex-direction: column;
        gap: 0.5rem;
      }
      
      .form.form-horizontal .form-group {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }
      
      .form.form-horizontal .form-group label {
        min-width: auto;
        text-align: left;
      }
    }
  `,
  
  darkMode: css`
    @media (prefers-color-scheme: dark) {
      .form {
        color: #F9FAFB;
      }
      
      .form-help {
        color: #9CA3AF;
      }
    }
  `,
};
