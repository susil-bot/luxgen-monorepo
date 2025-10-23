import { TenantTheme } from '../types';
import { defaultTheme } from '../theme';

export interface InputWithLabelData {
  tenantTheme: TenantTheme;
  label: string;
  type: string;
  placeholder: string;
  disabled: boolean;
  required: boolean;
  size: 'sm' | 'md' | 'lg';
}

export const fetchInputWithLabelData = async (
  tenantId?: string
): Promise<InputWithLabelData> => {
  return {
    tenantTheme: defaultTheme,
    label: 'Input Label',
    type: 'text',
    placeholder: 'Enter text...',
    disabled: false,
    required: false,
    size: 'md',
  };
};

export const fetchInputWithLabelSSR = async (
  tenantId?: string
): Promise<{ html: string; styles: string }> => {
  const data = await fetchInputWithLabelData(tenantId);
  
  const html = `
    <div class="input-with-label-wrapper" style="font-family: ${data.tenantTheme.fonts.primary}; color: ${data.tenantTheme.colors.text};">
      <label class="input-with-label-label">
        ${data.label}
        ${data.required ? '<span class="input-with-label-required">*</span>' : ''}
      </label>
      <input 
        type="${data.type}"
        class="input-with-label-input ${data.size}"
        placeholder="${data.placeholder}"
        ${data.disabled ? 'disabled' : ''}
        ${data.required ? 'required' : ''}
        style="font-family: ${data.tenantTheme.fonts.primary}; color: ${data.tenantTheme.colors.text}; background-color: ${data.tenantTheme.colors.background}; border-color: ${data.tenantTheme.colors.border};"
      />
    </div>
  `;
  
  const styles = `
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
    
    .input-with-label-input.sm {
      padding: 0.5rem;
      font-size: 0.75rem;
    }
    
    .input-with-label-input.md {
      padding: 0.75rem;
      font-size: 0.875rem;
    }
    
    .input-with-label-input.lg {
      padding: 1rem;
      font-size: 1rem;
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
  `;
  
  return { html, styles };
};
