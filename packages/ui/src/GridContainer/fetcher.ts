import { TenantTheme } from '../types';
import { defaultTheme } from '../theme';

export interface GridContainerData {
  tenantTheme: TenantTheme;
  columns: number;
  gap: string;
}

export const fetchGridContainerData = async (
  tenantId?: string
): Promise<GridContainerData> => {
  return {
    tenantTheme: defaultTheme,
    columns: 3,
    gap: '1rem',
  };
};

export const fetchGridContainerSSR = async (
  tenantId?: string
): Promise<{ html: string; styles: string }> => {
  const data = await fetchGridContainerData(tenantId);
  
  const html = `
    <div class="grid-container" style="display: grid; grid-template-columns: repeat(${data.columns}, 1fr); gap: ${data.gap}; font-family: ${data.tenantTheme.fonts.primary};">
      <!-- Grid items will be inserted here -->
    </div>
  `;
  
  const styles = `
    .grid-container {
      display: grid;
      grid-template-columns: repeat(${data.columns}, 1fr);
      gap: ${data.gap};
    }
    
    @media (max-width: 768px) {
      .grid-container {
        grid-template-columns: 1fr;
      }
    }
    
    @media (min-width: 769px) and (max-width: 1024px) {
      .grid-container {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `;
  
  return { html, styles };
};
