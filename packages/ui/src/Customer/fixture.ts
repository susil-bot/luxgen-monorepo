import type { CustomerRow } from './fetcher';
import { buildCustomerDetail } from './fetcher';

const sample: CustomerRow = {
  id: 'user-1',
  name: 'Jane Smith',
  email: 'jane@example.com',
  location: 'India',
  orderCount: 2,
  amountSpent: '—',
  customerSince: 'Mar 2025',
  rfmGroup: 'Loyal',
  tags: ['Active learner'],
};

export const customerFixtures = {
  listRows: [sample],
  detail: buildCustomerDetail(sample, []),
  default: {
    customers: [sample],
    activeTab: 'all' as const,
    onTabChange: () => undefined,
    search: '',
    onSearchChange: () => undefined,
  },
};
