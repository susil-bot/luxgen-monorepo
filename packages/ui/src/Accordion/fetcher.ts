import { TenantTheme } from '../types';
import { defaultTheme } from '../theme';

export interface AccordionData {
  tenantTheme: TenantTheme;
  items: Array<{
    id: string;
    title: string;
    content: string;
    disabled: boolean;
    defaultOpen: boolean;
  }>;
  allowMultiple: boolean;
  allowNone: boolean;
  variant: string;
  size: string;
  iconPosition: string;
  showIcon: boolean;
}

export const fetchAccordionData = async (
  tenantId?: string
): Promise<AccordionData> => {
  return {
    tenantTheme: defaultTheme,
    items: [
      {
        id: '1',
        title: 'Accordion Item 1',
        content: 'Content for accordion item 1',
        disabled: false,
        defaultOpen: false,
      },
      {
        id: '2',
        title: 'Accordion Item 2',
        content: 'Content for accordion item 2',
        disabled: false,
        defaultOpen: true,
      },
      {
        id: '3',
        title: 'Accordion Item 3',
        content: 'Content for accordion item 3',
        disabled: true,
        defaultOpen: false,
      },
    ],
    allowMultiple: false,
    allowNone: true,
    variant: 'default',
    size: 'medium',
    iconPosition: 'right',
    showIcon: true,
  };
};

export const fetchAccordionSSR = async (
  tenantId?: string
): Promise<{ html: string; styles: string }> => {
  const data = await fetchAccordionData(tenantId);
  
  const html = `
    <div class="accordion accordion-${data.variant} accordion-${data.size}" style="font-family: ${data.tenantTheme.fonts.primary}; color: ${data.tenantTheme.colors.text}; border: 1px solid ${data.tenantTheme.colors.border}; border-radius: 0.375rem; overflow: hidden;">
      ${data.items.map((item, index) => `
        <div class="accordion-item ${item.defaultOpen ? 'open' : ''} ${item.disabled ? 'disabled' : ''}" style="border-bottom: ${index < data.items.length - 1 ? `1px solid ${data.tenantTheme.colors.border}` : 'none'};">
          <button class="accordion-trigger" ${item.disabled ? 'disabled' : ''} style="width: 100%; display: flex; align-items: center; justify-content: space-between; background: none; border: none; cursor: ${item.disabled ? 'not-allowed' : 'pointer'}; padding: 1rem 1.25rem; text-align: left; font-family: ${data.tenantTheme.fonts.primary}; font-size: 1rem; color: ${item.disabled ? data.tenantTheme.colors.textSecondary : data.tenantTheme.colors.text}; transition: all 0.2s ease;">
            <span class="accordion-title" style="flex: 1;">${item.title}</span>
            ${data.showIcon ? `
              <span class="accordion-icon" style="display: flex; align-items: center; justify-content: center; width: 1.5rem; height: 1.5rem; font-size: 1rem; color: ${data.tenantTheme.colors.textSecondary}; transform: ${item.defaultOpen ? 'rotate(180deg)' : 'rotate(0deg)'}; transition: transform 0.2s ease; order: ${data.iconPosition === 'left' ? -1 : 1}; margin-left: ${data.iconPosition === 'left' ? 0 : '0.5rem'}; margin-right: ${data.iconPosition === 'right' ? 0 : '0.5rem'};">
                ▼
              </span>
            ` : ''}
          </button>
          <div class="accordion-content" style="max-height: ${item.defaultOpen ? '1000px' : '0'}; overflow: hidden; transition: max-height 0.3s ease; background-color: ${data.tenantTheme.colors.background};">
            <div class="accordion-content-inner" style="padding: 1rem 1.25rem; border-top: ${item.defaultOpen ? `1px solid ${data.tenantTheme.colors.border}` : 'none'};">
              ${item.content}
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
  
  const styles = `
    .accordion {
      font-family: var(--font-primary);
      color: var(--color-text);
    }
    
    .accordion-item {
      border-bottom: 1px solid var(--color-border);
    }
    
    .accordion-item:last-child {
      border-bottom: none;
    }
    
    .accordion-trigger {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: none;
      border: none;
      cursor: pointer;
      padding: 1rem 1.25rem;
      text-align: left;
      font-family: var(--font-primary);
      font-size: 1rem;
      color: var(--color-text);
      transition: all 0.2s ease;
    }
    
    .accordion-trigger:hover {
      background-color: var(--color-background-secondary);
    }
    
    .accordion-trigger:focus {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }
    
    .accordion-trigger:disabled {
      cursor: not-allowed;
      color: var(--color-text-secondary);
    }
    
    .accordion-title {
      flex: 1;
    }
    
    .accordion-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 1.5rem;
      height: 1.5rem;
      font-size: 1rem;
      color: var(--color-text-secondary);
      transition: transform 0.2s ease;
    }
    
    .accordion-item.open .accordion-icon {
      transform: rotate(180deg);
    }
    
    .accordion-content {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease;
      background-color: var(--color-background);
    }
    
    .accordion-item.open .accordion-content {
      max-height: 1000px;
    }
    
    .accordion-content-inner {
      padding: 1rem 1.25rem;
      border-top: 1px solid var(--color-border);
    }
    
    .accordion-item.open .accordion-content-inner {
      border-top: 1px solid var(--color-border);
    }
    
    .accordion-default {
      border: 1px solid var(--color-border);
      border-radius: 0.375rem;
      overflow: hidden;
    }
    
    .accordion-bordered {
      border: 2px solid var(--color-border);
      border-radius: 0.5rem;
      overflow: hidden;
    }
    
    .accordion-filled {
      background-color: var(--color-background-secondary);
      border-radius: 0.375rem;
      overflow: hidden;
    }
    
    .accordion-minimal {
      border: none;
      border-radius: 0;
      overflow: visible;
    }
    
    .accordion-small {
      font-size: 0.875rem;
    }
    
    .accordion-small .accordion-trigger {
      padding: 0.75rem 1rem;
    }
    
    .accordion-small .accordion-content-inner {
      padding: 0.75rem 1rem;
    }
    
    .accordion-medium {
      font-size: 1rem;
    }
    
    .accordion-medium .accordion-trigger {
      padding: 1rem 1.25rem;
    }
    
    .accordion-medium .accordion-content-inner {
      padding: 1rem 1.25rem;
    }
    
    .accordion-large {
      font-size: 1.125rem;
    }
    
    .accordion-large .accordion-trigger {
      padding: 1.25rem 1.5rem;
    }
    
    .accordion-large .accordion-content-inner {
      padding: 1.25rem 1.5rem;
    }
  `;
  
  return { html, styles };
};
