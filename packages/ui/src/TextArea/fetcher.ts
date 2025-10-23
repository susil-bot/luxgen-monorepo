import { TenantTheme } from '../types';
import { defaultTheme } from '../theme';

export interface TextAreaData {
  tenantTheme: TenantTheme;
  value: string;
  placeholder: string;
  rows: number;
  disabled: boolean;
  required: boolean;
}

export const fetchTextAreaData = async (
  tenantId?: string
): Promise<TextAreaData> => {
  return {
    tenantTheme: defaultTheme,
    value: '',
    placeholder: 'Enter your text here...',
    rows: 4,
    disabled: false,
    required: false,
  };
};

export const fetchTextAreaSSR = async (
  tenantId?: string
): Promise<{ html: string; styles: string }> => {
  const data = await fetchTextAreaData(tenantId);
  
  const html = `
    <div class="textarea-wrapper">
      <textarea 
        class="textarea" 
        rows="${data.rows}"
        placeholder="${data.placeholder}"
        ${data.disabled ? 'disabled' : ''}
        ${data.required ? 'required' : ''}
        style="font-family: ${data.tenantTheme.fonts.primary}; color: ${data.tenantTheme.colors.text}; background-color: ${data.tenantTheme.colors.background}; border-color: ${data.tenantTheme.colors.border};"
      >${data.value}</textarea>
    </div>
  `;
  
  const styles = `
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
      transition: border-color 0.2s ease;
    }
    
    .textarea:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    .textarea.error {
      border-color: var(--color-error);
    }
    
    .textarea:disabled {
      background-color: var(--color-surface);
      color: var(--color-text-secondary);
      cursor: not-allowed;
    }
    
    .textarea-label {
      font-weight: 500;
      color: var(--color-text);
      font-size: 0.875rem;
    }
    
    .textarea-required {
      color: var(--color-error);
      margin-left: 0.25rem;
    }
    
    .textarea-error {
      color: var(--color-error);
      font-size: 0.75rem;
      margin: 0;
    }
    
    .textarea-helper {
      color: var(--color-text-secondary);
      font-size: 0.75rem;
      margin: 0;
    }
  `;
  
  return { html, styles };
};
