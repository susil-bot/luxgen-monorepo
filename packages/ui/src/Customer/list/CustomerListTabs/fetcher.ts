import type { CustomerFilterTab } from './fetcher';

export const customerListTabs: { id: CustomerFilterTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'subscribed', label: 'Subscribed' },
  { id: 'active', label: 'Active' },
  { id: 'archived', label: 'Archived' },
];
