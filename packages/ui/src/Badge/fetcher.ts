import { TenantTheme } from '../types';
import { defaultTheme } from '../theme';

export interface BadgeData {
  tenantTheme: TenantTheme;
  content: string;
  variant: string;
  size: string;
  shape: string;
  dot: boolean;
  closable: boolean;
  hasIcon: boolean;
}

export const fetchBadgeData = async (
  tenantId?: string
): Promise<BadgeData> => {
  return {
    tenantTheme: defaultTheme,
    content: 'Badge content',
    variant: 'primary',
    size: 'medium',
    shape: 'rounded',
    dot: false,
    closable: false,
    hasIcon: false,
  };
};

export const fetchBadgeSSR = async (
  tenantId?: string
): Promise<{ html: string; styles: string }> => {
  const data = await fetchBadgeData(tenantId);
  
  const html = `
    <span 
      class="badge badge-${data.variant} badge-${data.size} badge-${data.shape}" 
      style="display: inline-flex; align-items: center; justify-content: center; gap: 0.25rem; font-family: ${data.tenantTheme.fonts.primary}; font-weight: 500; color: ${data.tenantTheme.colors.primary}; background-color: ${data.tenantTheme.colors.primary}20; border: 1px solid ${data.tenantTheme.colors.primary}40; border-radius: 0.375rem; padding: 0.375rem 0.75rem; font-size: 0.875rem; min-height: 1.5rem;"
    >
      ${data.hasIcon ? '<span class="badge-icon">🔖</span>' : ''}
      <span class="badge-content">${data.content}</span>
      ${data.closable ? '<button type="button" class="badge-close" aria-label="Close badge">×</button>' : ''}
    </span>
  `;
  
  const styles = `
    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.25rem;
      font-family: var(--font-primary);
      font-weight: 500;
      border: 1px solid;
      transition: all 0.2s ease;
    }
    
    .badge-small {
      padding: 0.25rem 0.5rem;
      font-size: 0.75rem;
      min-height: 1.25rem;
    }
    
    .badge-medium {
      padding: 0.375rem 0.75rem;
      font-size: 0.875rem;
      min-height: 1.5rem;
    }
    
    .badge-large {
      padding: 0.5rem 1rem;
      font-size: 1rem;
      min-height: 1.75rem;
    }
    
    .badge-rounded {
      border-radius: 0.375rem;
    }
    
    .badge-pill {
      border-radius: 9999px;
    }
    
    .badge-square {
      border-radius: 0;
    }
    
    .badge-primary {
      color: var(--color-primary);
      background-color: var(--color-primary-20);
      border-color: var(--color-primary-40);
    }
    
    .badge-secondary {
      color: var(--color-text-secondary);
      background-color: var(--color-text-secondary-20);
      border-color: var(--color-text-secondary-40);
    }
    
    .badge-success {
      color: var(--color-success);
      background-color: var(--color-success-20);
      border-color: var(--color-success-40);
    }
    
    .badge-error {
      color: var(--color-error);
      background-color: var(--color-error-20);
      border-color: var(--color-error-40);
    }
    
    .badge-warning {
      color: var(--color-warning);
      background-color: var(--color-warning-20);
      border-color: var(--color-warning-40);
    }
    
    .badge-info {
      color: var(--color-info);
      background-color: var(--color-info-20);
      border-color: var(--color-info-40);
    }
    
    .badge-close {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      margin-left: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: inherit;
      font-size: 0.75rem;
    }
    
    .badge-close:hover {
      opacity: 0.7;
    }
    
    .badge-icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `;
  
  return { html, styles };
};
