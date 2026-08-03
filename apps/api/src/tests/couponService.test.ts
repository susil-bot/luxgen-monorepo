import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.mock('@luxgen/db', () => ({
  Coupon: {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn(),
  },
}));

import { Coupon } from '@luxgen/db';
import { CouponService } from '../services/couponService';

describe('CouponService', () => {
  let service: CouponService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CouponService();
  });

  it('create persists discount fields for tenant', async () => {
    const created = {
      _id: { toString: () => 'c1' },
      tenantId: 'tenant1',
      code: 'WELCOME20',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      appliesTo: 'ALL',
      oneUsePerCustomer: false,
      redemptionCount: 0,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (Coupon.create as jest.Mock).mockResolvedValue(created);

    const result = await service.create({
      tenantId: 'tenant1',
      code: 'welcome20',
      discountType: 'PERCENTAGE',
      discountValue: 20,
    });

    expect(Coupon.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 'tenant1',
        code: 'WELCOME20',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        appliesTo: 'ALL',
        status: 'ACTIVE',
      }),
    );
    expect(service.toGraphQL(result as never).discountValue).toBe(20);
  });

  it('update persists changed discount type and value', async () => {
    const existing = {
      _id: { toString: () => 'c1' },
      tenantId: 'tenant1',
      code: 'SAVE10',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      appliesTo: 'ALL',
      oneUsePerCustomer: false,
      redemptionCount: 0,
      status: 'ACTIVE',
    };
    const updated = { ...existing, discountType: 'FIXED_AMOUNT', discountValue: 1000 };
    (Coupon.findOne as jest.Mock).mockResolvedValue(existing);
    (Coupon.findOneAndUpdate as jest.Mock).mockResolvedValue(updated);

    const result = await service.update('c1', 'tenant1', {
      discountType: 'FIXED_AMOUNT',
      discountValue: 1000,
    });

    expect(Coupon.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'c1', tenantId: 'tenant1' },
      { $set: expect.objectContaining({ discountType: 'FIXED_AMOUNT', discountValue: 1000 }) },
      { new: true },
    );
    expect(result?.discountValue).toBe(1000);
  });

  it('listByTenant filters by search code', async () => {
    (Coupon.find as jest.Mock).mockReturnValue({
      sort: jest.fn().mockResolvedValue([
        { code: 'WELCOME20', discountType: 'PERCENTAGE' },
        { code: 'SAVE100', discountType: 'FIXED_AMOUNT' },
      ]),
    });

    const result = await service.listByTenant('tenant1', { search: 'save' });
    expect(result).toHaveLength(1);
    expect(result[0].code).toBe('SAVE100');
  });

  it('rejects percentage over 100', async () => {
    await expect(
      service.create({
        tenantId: 'tenant1',
        code: 'BAD',
        discountType: 'PERCENTAGE',
        discountValue: 150,
      }),
    ).rejects.toThrow(/100/);
    expect(Coupon.create).not.toHaveBeenCalled();
  });
});
