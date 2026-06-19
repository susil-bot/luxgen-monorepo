import type { OrderFilterTab } from '../../fetcher';
import type { OrderListTabsProps } from './OrderListTabs';

export const orderListTabsFixtures = {
  default: {
    activeTab: 'all' as OrderFilterTab,
    onTabChange: () => {},
  } satisfies OrderListTabsProps,
};
