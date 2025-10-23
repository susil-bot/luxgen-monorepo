import { TenantTheme, SelectOption } from '../types';
import { defaultTheme } from '../theme';

export interface SelectData {
  tenantTheme: TenantTheme;
  options: SelectOption[];
  placeholder: string;
  disabled: boolean;
  required: boolean;
  multi: boolean;
}

export const fetchSelectData = async (
  tenantId?: string
): Promise<SelectData> => {
  const defaultOptions: SelectOption[] = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  return {
    tenantTheme: defaultTheme,
    options: defaultOptions,
    placeholder: 'Select an option...',
    disabled: false,
    required: false,
    multi: false,
  };
};

export const fetchSelectSSR = async (
  tenantId?: string
): Promise<{ html: string; styles: string }> => {
  const data = await fetchSelectData(tenantId);
  
  const optionsHtml = data.options
    .map(option => `
      <option value="${option.value}" ${option.disabled ? 'disabled' : ''}>
        ${option.label}
      </option>
    `)
    .join('');
  
  const html = `
    <div class="select-wrapper" style="font-family: ${data.tenantTheme.fonts.primary}; color: ${data.tenantTheme.colors.text};">
      <div class="select-container">
        <select 
          class="select-trigger"
          ${data.disabled ? 'disabled' : ''}
          ${data.required ? 'required' : ''}
          ${data.multi ? 'multiple' : ''}
          style="font-family: ${data.tenantTheme.fonts.primary}; color: ${data.tenantTheme.colors.text}; background-color: ${data.tenantTheme.colors.background}; border-color: ${data.tenantTheme.colors.border};"
        >
          <option value="" disabled>${data.placeholder}</option>
          ${optionsHtml}
        </select>
      </div>
    </div>
  `;
  
  const styles = `
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
      transition: border-color 0.2s ease;
    }
    
    .select-trigger:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    .select-trigger.error {
      border-color: var(--color-error);
    }
    
    .select-trigger.disabled {
      background-color: var(--color-surface);
      color: var(--color-text-secondary);
      cursor: not-allowed;
    }
    
    .select-label {
      font-weight: 500;
      color: var(--color-text);
      font-size: 0.875rem;
    }
    
    .select-required {
      color: var(--color-error);
      margin-left: 0.25rem;
    }
    
    .select-error {
      color: var(--color-error);
      font-size: 0.75rem;
      margin: 0;
    }
    
    .select-helper {
      color: var(--color-text-secondary);
      font-size: 0.75rem;
      margin: 0;
    }
  `;
  
  return { html, styles };
};
