import { TenantTheme } from '../types';
import { defaultTheme } from '../theme';

export interface HeadingData {
  tenantTheme: TenantTheme;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
  size: string;
  weight: string;
  align: string;
  color: string;
  variant: string;
}

export const fetchHeadingData = async (
  tenantId?: string
): Promise<HeadingData> => {
  return {
    tenantTheme: defaultTheme,
    level: 1,
    text: 'Heading Text',
    size: '6xl',
    weight: 'semibold',
    align: 'left',
    color: defaultTheme.colors.text,
    variant: 'primary',
  };
};

export const fetchHeadingSSR = async (
  tenantId?: string
): Promise<{ html: string; styles: string }> => {
  const data = await fetchHeadingData(tenantId);
  
  const html = `
    <h${data.level} 
      class="heading heading-${data.size}" 
      style="font-family: ${data.tenantTheme.fonts.primary}; color: ${data.color}; text-align: ${data.align}; font-weight: ${data.weight};"
    >
      ${data.text}
    </h${data.level}>
  `;
  
  const styles = `
    .heading {
      font-family: var(--font-primary);
      color: var(--color-text);
      margin: 0;
      line-height: 1.2;
    }
    
    .heading-6xl {
      font-size: 3.75rem;
      line-height: 1;
    }
    
    .heading-5xl {
      font-size: 3rem;
      line-height: 1;
    }
    
    .heading-4xl {
      font-size: 2.25rem;
      line-height: 1.1;
    }
    
    .heading-3xl {
      font-size: 1.875rem;
      line-height: 1.2;
    }
    
    .heading-2xl {
      font-size: 1.5rem;
      line-height: 1.3;
    }
    
    .heading-xl {
      font-size: 1.25rem;
      line-height: 1.4;
    }
    
    .heading-lg {
      font-size: 1.125rem;
      line-height: 1.4;
    }
    
    .heading-md {
      font-size: 1rem;
      line-height: 1.5;
    }
    
    .heading-sm {
      font-size: 0.875rem;
      line-height: 1.5;
    }
    
    .heading-primary {
      color: var(--color-text);
    }
    
    .heading-secondary {
      color: var(--color-text-secondary);
    }
    
    .heading-success {
      color: var(--color-success);
    }
    
    .heading-error {
      color: var(--color-error);
    }
    
    .heading-warning {
      color: var(--color-warning);
    }
    
    .heading-info {
      color: var(--color-info);
    }
  `;
  
  return { html, styles };
};
