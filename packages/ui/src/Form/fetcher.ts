import { TenantTheme } from '../types';
import { defaultTheme } from '../theme';

export interface FormData {
  tenantTheme: TenantTheme;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  action: string;
  encType: string;
  noValidate: boolean;
}

export const fetchFormData = async (
  tenantId?: string
): Promise<FormData> => {
  return {
    tenantTheme: defaultTheme,
    method: 'POST',
    action: '',
    encType: 'application/x-www-form-urlencoded',
    noValidate: false,
  };
};

export const fetchFormSSR = async (
  tenantId?: string
): Promise<{ html: string; styles: string }> => {
  const data = await fetchFormData(tenantId);
  
  const html = `
    <form 
      class="form" 
      method="${data.method}"
      action="${data.action}"
      enctype="${data.encType}"
      ${data.noValidate ? 'novalidate' : ''}
      style="font-family: ${data.tenantTheme.fonts.primary}; color: ${data.tenantTheme.colors.text};"
    >
      <!-- Form content will be inserted here -->
    </form>
  `;
  
  const styles = `
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
    
    @media (max-width: 768px) {
      .form-row {
        flex-direction: column;
        gap: 0.5rem;
      }
      
      .form-actions {
        flex-direction: column;
        gap: 0.5rem;
      }
    }
  `;
  
  return { html, styles };
};
