import { defaultTheme } from '../theme';
import type { TenantTheme } from '../types';
import type { ToolkitItem } from './Toolkit';
import { getToolkitItemClassName, getToolkitSSRStyles, toolkitClasses } from './styles';
import { ToolkitTranslations } from './translations';

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
    .map((item) => {
      const className = getToolkitItemClassName(item);
      const pressed = item.active ? ' aria-pressed="true"' : ' aria-pressed="false"';
      const disabled = item.disabled ? ' disabled' : '';
      return `<button type="button" class="${className}" aria-label="${item.label}" title="${item.label}"${pressed}${disabled}>${item.label}</button>`;
    })
    .join('');
  return {
    html: `<div class="${toolkitClasses.root}" role="toolbar" aria-label="${ToolkitTranslations.en.defaultAriaLabel}">${buttons}</div>`,
    styles: getToolkitSSRStyles(),
  };
};
