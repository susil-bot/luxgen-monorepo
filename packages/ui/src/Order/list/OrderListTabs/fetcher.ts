import type { OrderFilterTab } from './fetcher';

export const orderListTabs: { id: OrderFilterTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'unpaid', label: 'Unpaid' },
  { id: 'unfulfilled', label: 'Unfulfilled' },
  { id: 'open', label: 'Open' },
  { id: 'archived', label: 'Archived' },
];
