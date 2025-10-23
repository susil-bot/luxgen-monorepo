import { TenantTheme } from '../types';
import { defaultTheme } from '../theme';

export interface CheckboxData {
  tenantTheme: TenantTheme;
  checked: boolean;
  disabled: boolean;
  required: boolean;
  indeterminate: boolean;
}

export const fetchCheckboxData = async (
  tenantId?: string
): Promise<CheckboxData> => {
  return {
    tenantTheme: defaultTheme,
    checked: false,
    disabled: false,
    required: false,
    indeterminate: false,
  };
};

export const fetchCheckboxSSR = async (
  tenantId?: string
): Promise<{ html: string; styles: string }> => {
  const data = await fetchCheckboxData(tenantId);
  
  const html = `
    <div class="checkbox-wrapper" style="font-family: ${data.tenantTheme.fonts.primary}; color: ${data.tenantTheme.colors.text};">
      <label class="checkbox-label">
        <input 
          type="checkbox" 
          class="checkbox-input"
          ${data.checked ? 'checked' : ''}
          ${data.disabled ? 'disabled' : ''}
          ${data.required ? 'required' : ''}
        />
        <span class="checkbox-custom">
          <svg class="checkbox-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="checkbox-check" />
            <path d="M4 8H12" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="checkbox-indeterminate" />
          </svg>
        </span>
        <span class="checkbox-text">Checkbox Label</span>
      </label>
    </div>
  `;
  
  const styles = `
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
    }
    
    .checkbox-label.disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
    
    .checkbox-input {
      position: absolute;
      opacity: 0;
      cursor: pointer;
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
  `;
  
  return { html, styles };
};
