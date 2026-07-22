import { DEFAULT_PRODUCT_EDIT_META } from '../../fetcher';
import type { OrganizationSectionProps } from './OrganizationSection';

export const organizationSectionFixtures = {
  default: {
    meta: {
      ...DEFAULT_PRODUCT_EDIT_META,
      vendor: 'Jane Smith',
      tags: ['digital', 'bundle'],
    },
    onMetaChange: () => {},
  } satisfies OrganizationSectionProps,
};
