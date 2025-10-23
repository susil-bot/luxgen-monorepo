import { TenantTheme } from '../types';
import { defaultTheme } from '../theme';

export interface CardData {
  tenantTheme: TenantTheme;
  title: string;
  description: string;
  content: string;
  variant: string;
  size: string;
  padding: string;
  shadow: string;
  hover: boolean;
  clickable: boolean;
  hasIcon: boolean;
  hasImage: boolean;
  hasHeader: boolean;
  hasFooter: boolean;
}

export const fetchCardData = async (
  tenantId?: string
): Promise<CardData> => {
  return {
    tenantTheme: defaultTheme,
    title: 'Card Title',
    description: 'Card description',
    content: 'Card content',
    variant: 'default',
    size: 'medium',
    padding: 'medium',
    shadow: 'medium',
    hover: false,
    clickable: false,
    hasIcon: false,
    hasImage: false,
    hasHeader: false,
    hasFooter: false,
  };
};

export const fetchCardSSR = async (
  tenantId?: string
): Promise<{ html: string; styles: string }> => {
  const data = await fetchCardData(tenantId);
  
  const html = `
    <div class="card card-${data.variant} card-${data.size}" style="font-family: ${data.tenantTheme.fonts.primary}; color: ${data.tenantTheme.colors.text}; background-color: ${data.tenantTheme.colors.background}; border: 1px solid ${data.tenantTheme.colors.border}; border-radius: 0.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); padding: 1rem; font-size: 1rem; min-height: 10rem; position: relative; overflow: hidden; display: flex; flex-direction: column;">
      ${data.hasHeader ? `
        <div class="card-header" style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; padding: 1rem; padding-bottom: 0;">
          ${data.hasIcon ? `<div class="card-icon" style="display: flex; align-items: center; justify-content: center; width: 2rem; height: 2rem; color: ${data.tenantTheme.colors.primary}; font-size: 1.25rem;">🔖</div>` : ''}
          <div style="flex: 1;">
            <h3 class="card-title" style="margin: 0; font-size: 1.125rem; font-weight: 600; color: ${data.tenantTheme.colors.text}; line-height: 1.4;">${data.title}</h3>
            <p class="card-description" style="margin: 0.25rem 0 0 0; font-size: 0.875rem; color: ${data.tenantTheme.colors.textSecondary}; line-height: 1.5;">${data.description}</p>
          </div>
        </div>
      ` : ''}
      
      <div class="card-content" style="flex: 1; padding: 1rem; padding-top: ${data.hasHeader ? '0' : '1rem'};">
        ${data.content}
      </div>
      
      ${data.hasFooter ? `
        <div class="card-footer" style="padding: 1rem; padding-top: 0; border-top: 1px solid ${data.tenantTheme.colors.border}; margin-top: auto;">
          Footer content
        </div>
      ` : ''}
    </div>
  `;
  
  const styles = `
    .card {
      font-family: var(--font-primary);
      color: var(--color-text);
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    
    .card-default {
      background-color: var(--color-background);
      border: 1px solid var(--color-border);
      border-radius: 0.5rem;
    }
    
    .card-elevated {
      background-color: var(--color-background);
      border: none;
      border-radius: 0.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    
    .card-outlined {
      background-color: transparent;
      border: 2px solid var(--color-border);
      border-radius: 0.5rem;
    }
    
    .card-filled {
      background-color: var(--color-background-secondary);
      border: none;
      border-radius: 0.5rem;
    }
    
    .card-small {
      font-size: 0.875rem;
      min-height: 8rem;
    }
    
    .card-medium {
      font-size: 1rem;
      min-height: 10rem;
    }
    
    .card-large {
      font-size: 1.125rem;
      min-height: 12rem;
    }
    
    .card-clickable {
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .card-clickable:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
    
    .card-hover:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 8px -1px rgba(0, 0, 0, 0.1), 0 3px 5px -1px rgba(0, 0, 0, 0.06);
    }
    
    .card-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .card-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2rem;
      height: 2rem;
      color: var(--color-primary);
      font-size: 1.25rem;
    }
    
    .card-title {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--color-text);
      line-height: 1.4;
    }
    
    .card-description {
      margin: 0.25rem 0 0 0;
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      line-height: 1.5;
    }
    
    .card-content {
      flex: 1;
    }
    
    .card-footer {
      border-top: 1px solid var(--color-border);
      margin-top: auto;
    }
  `;
  
  return { html, styles };
};
