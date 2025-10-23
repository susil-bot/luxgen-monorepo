import { TenantTheme } from '../types';
import { defaultTheme } from '../theme';

export interface KickerData {
  tenantTheme: TenantTheme;
  content: string;
  variant: string;
  size: string;
  weight: string;
  align: string;
  uppercase: boolean;
  underline: boolean;
  hasIcon: boolean;
  iconPosition: string;
}

export const fetchKickerData = async (
  tenantId?: string
): Promise<KickerData> => {
  return {
    tenantTheme: defaultTheme,
    content: 'Kicker content',
    variant: 'primary',
    size: 'medium',
    weight: 'medium',
    align: 'left',
    uppercase: true,
    underline: false,
    hasIcon: false,
    iconPosition: 'left',
  };
};

export const fetchKickerSSR = async (
  tenantId?: string
): Promise<{ html: string; styles: string }> => {
  const data = await fetchKickerData(tenantId);
  
  const html = `
    <div 
      class="kicker kicker-${data.variant} kicker-${data.size}" 
      style="font-family: ${data.tenantTheme.fonts.primary}; font-weight: ${data.weight}; color: ${data.tenantTheme.colors.primary}; text-align: ${data.align}; text-transform: ${data.uppercase ? 'uppercase' : 'none'}; text-decoration: ${data.underline ? 'underline' : 'none'}; display: flex; align-items: center; gap: 0.5rem;"
    >
      ${data.hasIcon ? '<span class="kicker-icon">🔖</span>' : ''}
      <span class="kicker-content">${data.content}</span>
    </div>
  `;
  
  const styles = `
    .kicker {
      font-family: var(--font-primary);
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
    }
    
    .kicker-small {
      font-size: 0.75rem;
      letter-spacing: 0.05em;
      line-height: 1.2;
    }
    
    .kicker-medium {
      font-size: 0.875rem;
      letter-spacing: 0.1em;
      line-height: 1.3;
    }
    
    .kicker-large {
      font-size: 1rem;
      letter-spacing: 0.15em;
      line-height: 1.4;
    }
    
    .kicker-primary {
      color: var(--color-primary);
    }
    
    .kicker-secondary {
      color: var(--color-text-secondary);
    }
    
    .kicker-success {
      color: var(--color-success);
    }
    
    .kicker-error {
      color: var(--color-error);
    }
    
    .kicker-warning {
      color: var(--color-warning);
    }
    
    .kicker-info {
      color: var(--color-info);
    }
    
    .kicker-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875em;
    }
    
    .kicker-content {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `;
  
  return { html, styles };
};
