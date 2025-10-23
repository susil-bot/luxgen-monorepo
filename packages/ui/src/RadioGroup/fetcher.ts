import { TenantTheme, RadioOption } from '../types';
import { defaultTheme } from '../theme';

export interface RadioGroupData {
  tenantTheme: TenantTheme;
  options: RadioOption[];
  name: string;
  disabled: boolean;
  required: boolean;
  orientation: 'horizontal' | 'vertical';
}

export const fetchRadioGroupData = async (
  tenantId?: string
): Promise<RadioGroupData> => {
  const defaultOptions: RadioOption[] = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  return {
    tenantTheme: defaultTheme,
    options: defaultOptions,
    name: 'radio-group',
    disabled: false,
    required: false,
    orientation: 'vertical',
  };
};

export const fetchRadioGroupSSR = async (
  tenantId?: string
): Promise<{ html: string; styles: string }> => {
  const data = await fetchRadioGroupData(tenantId);
  
  const optionsHtml = data.options
    .map(option => `
      <label class="radio-option">
        <input 
          type="radio" 
          name="${data.name}" 
          value="${option.value}"
          ${option.disabled ? 'disabled' : ''}
        />
        <span class="radio-custom">
          <span class="radio-dot"></span>
        </span>
        <span class="radio-text">${option.label}</span>
      </label>
    `)
    .join('');
  
  const html = `
    <div class="radio-group-wrapper" style="font-family: ${data.tenantTheme.fonts.primary}; color: ${data.tenantTheme.colors.text};">
      <div class="radio-group ${data.orientation}">
        ${optionsHtml}
      </div>
    </div>
  `;
  
  const styles = `
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
    }
    
    .radio-option {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      font-family: var(--font-primary);
      font-size: 0.875rem;
      color: var(--color-text);
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
  `;
  
  return { html, styles };
};
