import { filterOrdersByTab, type OrderRow } from './fetcher';

const base: OrderRow = {
  id: '1',
  subjectId: 'c:s',
  courseId: 'c',
  studentId: 's',
  orderNumber: '#1',
  date: new Date().toISOString(),
  customerId: 's',
  customerName: 'A',
  customerEmail: 'a@example.com',
  paymentStatus: 'paid',
  fulfillmentStatus: 'partial',
  learningStatus: 'ACTIVE',
  total: '$10.00',
  itemCount: 1,
  courseTitle: 'Course',
  archived: false,
};

describe('filterOrdersByTab', () => {
  const rows: OrderRow[] = [
    base,
    { ...base, id: '2', paymentStatus: 'pending', fulfillmentStatus: 'unfulfilled' },
    { ...base, id: '3', fulfillmentStatus: 'fulfilled' },
    { ...base, id: '4', archived: true, fulfillmentStatus: 'restocked' },
  ];

  it('filters unpaid', () => {
    expect(filterOrdersByTab(rows, 'unpaid').map((r) => r.id)).toEqual(['2']);
  });

  it('filters unfulfilled including partial', () => {
    expect(filterOrdersByTab(rows, 'unfulfilled').map((r) => r.id).sort()).toEqual(['1', '2']);
  });

  it('filters open excluding fulfilled and archived', () => {
    expect(filterOrdersByTab(rows, 'open').map((r) => r.id).sort()).toEqual(['1', '2']);
  });

  it('filters archived', () => {
    expect(filterOrdersByTab(rows, 'archived').map((r) => r.id)).toEqual(['4']);
  });
});
