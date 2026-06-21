import { defaultTheme } from '../theme';
import type { TenantTheme } from '../types';
import type { ToolkitItem } from './Toolkit';

export interface ToolkitData {
  tenantTheme: TenantTheme;
  items: ToolkitItem[];
}

export const defaultToolkitItems: ToolkitItem[] = [
  { id: 'add', label: 'Add' },
  { id: 'edit', label: 'Edit' },
  { id: 'delete', label: 'Delete', destructive: true },
];

export const fetchToolkitData = async (_tenantId?: string): Promise<ToolkitData> => {
  return {
    tenantTheme: defaultTheme,
    items: defaultToolkitItems,
  };
};

export const fetchToolkitSSR = async (tenantId?: string): Promise<{ html: string; styles: string }> => {
  const data = await fetchToolkitData(tenantId);
  const buttons = data.items
    .map((item) => `<button type="button" class="toolkit-item">${item.label}</button>`)
    .join('');
  return {
    html: `<div class="toolkit" role="toolbar">${buttons}</div>`,
    styles: `.toolkit { display: flex; gap: 4px; font-family: ${data.tenantTheme.fonts.primary}; }`,
  };
};
