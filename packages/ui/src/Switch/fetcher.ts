import { TenantTheme } from '../types';
import { defaultTheme } from '../theme';

export interface SwitchData {
  tenantTheme: TenantTheme;
  checked: boolean;
  disabled: boolean;
  required: boolean;
  size: 'sm' | 'md' | 'lg';
}

export const fetchSwitchData = async (
  tenantId?: string
): Promise<SwitchData> => {
  return {
    tenantTheme: defaultTheme,
    checked: false,
    disabled: false,
    required: false,
    size: 'md',
  };
};

export const fetchSwitchSSR = async (
  tenantId?: string
): Promise<{ html: string; styles: string }> => {
  const data = await fetchSwitchData(tenantId);
  
  const html = `
    <div class="switch-wrapper" style="font-family: ${data.tenantTheme.fonts.primary}; color: ${data.tenantTheme.colors.text};">
      <label class="switch-label">
        <input 
          type="checkbox" 
          class="switch-input"
          ${data.checked ? 'checked' : ''}
          ${data.disabled ? 'disabled' : ''}
          ${data.required ? 'required' : ''}
        />
        <span class="switch-custom ${data.size}">
          <span class="switch-thumb"></span>
        </span>
        <span class="switch-text">Switch Label</span>
      </label>
    </div>
  `;
  
  const styles = `
    .switch-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .switch-label {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      font-family: var(--font-primary);
      font-size: 0.875rem;
      color: var(--color-text);
      transition: opacity 0.2s ease;
    }
    
    .switch-label.disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
    
    .switch-input {
      position: absolute;
      opacity: 0;
      cursor: pointer;
      width: 0;
      height: 0;
    }
    
    .switch-custom {
      position: relative;
      background-color: var(--color-border);
      border-radius: 9999px;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }
    
    .switch-custom.sm {
      width: 2rem;
      height: 1rem;
    }
    
    .switch-custom.md {
      width: 2.5rem;
      height: 1.25rem;
    }
    
    .switch-custom.lg {
      width: 3rem;
      height: 1.5rem;
    }
    
    .switch-custom:hover {
      background-color: var(--color-text-secondary);
    }
    
    .switch-custom.error {
      background-color: var(--color-error);
    }
    
    .switch-input:checked + .switch-custom {
      background-color: var(--color-primary);
    }
    
    .switch-input:checked + .switch-custom .switch-thumb {
      transform: translateX(100%);
    }
    
    .switch-input:focus + .switch-custom {
      outline: none;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    .switch-thumb {
      position: absolute;
      top: 0.125rem;
      left: 0.125rem;
      background-color: white;
      border-radius: 50%;
      transition: transform 0.2s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .switch-custom.sm .switch-thumb {
      width: 0.75rem;
      height: 0.75rem;
    }
    
    .switch-custom.md .switch-thumb {
      width: 1rem;
      height: 1rem;
    }
    
    .switch-custom.lg .switch-thumb {
      width: 1.25rem;
      height: 1.25rem;
    }
    
    .switch-text {
      flex: 1;
      line-height: 1.5;
    }
    
    .switch-required {
      color: var(--color-error);
      margin-left: 0.25rem;
    }
    
    .switch-error {
      color: var(--color-error);
      font-size: 0.75rem;
      margin: 0;
      margin-top: 0.25rem;
    }
    
    .switch-helper {
      color: var(--color-text-secondary);
      font-size: 0.75rem;
      margin: 0;
      margin-top: 0.25rem;
    }
  `;
  
  return { html, styles };
};
