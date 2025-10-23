import { TenantTheme } from '../types';
import { defaultTheme } from '../theme';

export interface TextData {
  tenantTheme: TenantTheme;
  text: string;
  variant: string;
  weight: string;
  align: string;
  color: string;
  as: string;
}

export const fetchTextData = async (
  tenantId?: string
): Promise<TextData> => {
  return {
    tenantTheme: defaultTheme,
    text: 'Text content',
    variant: 'normal',
    weight: 'normal',
    align: 'left',
    color: defaultTheme.colors.text,
    as: 'p',
  };
};

export const fetchTextSSR = async (
  tenantId?: string
): Promise<{ html: string; styles: string }> => {
  const data = await fetchTextData(tenantId);
  
  const html = `
    <${data.as} 
      class="text text-${data.variant}" 
      style="font-family: ${data.tenantTheme.fonts.primary}; color: ${data.color}; text-align: ${data.align}; font-weight: ${data.weight};"
    >
      ${data.text}
    </${data.as}>
  `;
  
  const styles = `
    .text {
      font-family: var(--font-primary);
      color: var(--color-text);
      margin: 0;
      line-height: 1.5;
    }
    
    .text-caption {
      font-size: 0.75rem;
      line-height: 1.4;
    }
    
    .text-small {
      font-size: 0.875rem;
      line-height: 1.4;
    }
    
    .text-normal {
      font-size: 1rem;
      line-height: 1.5;
    }
    
    .text-large {
      font-size: 1.125rem;
      line-height: 1.5;
    }
    
    .text-lead {
      font-size: 1.25rem;
      line-height: 1.4;
    }
    
    .text-muted {
      font-size: 1rem;
      color: var(--color-text-secondary);
    }
    
    .text-primary {
      color: var(--color-text);
    }
    
    .text-secondary {
      color: var(--color-text-secondary);
    }
    
    .text-success {
      color: var(--color-success);
    }
    
    .text-error {
      color: var(--color-error);
    }
    
    .text-warning {
      color: var(--color-warning);
    }
    
    .text-info {
      color: var(--color-info);
    }
  `;
  
  return { html, styles };
};
