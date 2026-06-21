import type { ToolkitProps } from './Toolkit';
import { defaultToolkitItems } from './fetcher';

export const toolkitFixtures = {
  default: {
    items: defaultToolkitItems,
    ariaLabel: 'Page actions',
  } satisfies ToolkitProps,

  compact: {
    items: defaultToolkitItems,
    size: 'small' as const,
    ariaLabel: 'Compact toolkit',
  } satisfies ToolkitProps,

  withActive: {
    items: defaultToolkitItems.map((item) => ({
      ...item,
      active: item.id === 'edit',
    })),
    ariaLabel: 'Toolkit with active tool',
  } satisfies ToolkitProps,
};
