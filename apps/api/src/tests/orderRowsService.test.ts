import { describe, it, expect } from '@jest/globals';
import { mapFulfillment, mapPayment } from '../services/orderRowsService';

describe('orderRowsService status mapping', () => {
  it('mapPayment prefers enrollment paymentStatus', () => {
    expect(mapPayment('PAID')).toBe('paid');
    expect(mapPayment('PENDING')).toBe('pending');
    expect(mapPayment('REFUNDED')).toBe('refunded');
    expect(mapPayment(undefined, 'DRAFT')).toBe('pending');
  });

  it('mapFulfillment uses learningStatus and progress', () => {
    expect(
      mapFulfillment({ learningStatus: 'COMPLETED', paymentStatus: 'PAID', courseStatus: 'PUBLISHED' }),
    ).toBe('fulfilled');
    expect(
      mapFulfillment({ learningStatus: 'ACTIVE', paymentStatus: 'PAID', courseStatus: 'PUBLISHED' }),
    ).toBe('partial');
    expect(mapFulfillment({ paymentStatus: 'REFUNDED', courseStatus: 'PUBLISHED' })).toBe('restocked');
    expect(mapFulfillment({ progressPercent: 100, courseStatus: 'PUBLISHED' })).toBe('fulfilled');
    expect(mapFulfillment({ courseStatus: 'DRAFT' })).toBe('unfulfilled');
  });
});
