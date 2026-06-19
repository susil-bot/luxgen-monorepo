import { DEFAULT_PRODUCT_EDIT_META } from '../../fetcher';
import type { ThemeTemplateSectionProps } from './ThemeTemplateSection';

export const themeTemplateFixtures = {
  default: {
    meta: { ...DEFAULT_PRODUCT_EDIT_META },
    onMetaChange: () => {},
  } satisfies ThemeTemplateSectionProps,
};
