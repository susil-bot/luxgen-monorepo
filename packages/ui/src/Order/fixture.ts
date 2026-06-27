import type { OrderDetail, OrderRow } from './fetcher';
import { buildOrderDetail } from './fetcher';

const sampleOrder: OrderRow = {
  id: '674a1b2c3d4e5f6789012345',
  subjectId: 'course-1:student-1',
  courseId: 'course-1',
  studentId: 'student-1',
  orderNumber: '#1042',
  date: new Date().toISOString(),
  customerId: 'student-1',
  customerName: 'Jane Smith',
  customerEmail: 'jane@example.com',
  paymentStatus: 'paid',
  fulfillmentStatus: 'partial',
  total: '99.00',
  itemCount: 1,
  courseTitle: 'Introduction to Product Design',
  archived: false,
};

export const orderFixtures = {
  listRows: [sampleOrder],
  detail: buildOrderDetail(sampleOrder, {
    id: 'course-1',
    title: 'Introduction to Product Design',
    status: 'PUBLISHED',
  }) satisfies OrderDetail,
  default: {
    orders: [sampleOrder],
    activeTab: 'all' as const,
    onTabChange: () => undefined,
    search: '',
    onSearchChange: () => undefined,
  },
};
