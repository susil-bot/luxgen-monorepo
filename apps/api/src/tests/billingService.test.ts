import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.mock('@luxgen/db', () => ({
  TenantSubscription: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
  Tenant: {
    findById: jest.fn(),
    findOne: jest.fn(),
  },
}));

jest.mock('../services/listingSubscriptionService', () => ({
  listingSubscriptionService: {},
}));

jest.mock('../services/enrollmentService', () => ({
  enrollmentService: {},
}));

jest.mock('../lib/redis', () => ({
  getRedisClient: jest.fn(),
}));

jest.mock('../utils/logger', () => ({
  logger: { warn: jest.fn(), info: jest.fn(), error: jest.fn() },
}));

import { TenantSubscription } from '@luxgen/db';
import { BillingService } from '../services/billingService';

describe('BillingService', () => {
  let service: BillingService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new BillingService();
  });

  it('getEffectivePlan returns active subscription plan', async () => {
    (TenantSubscription.findOne as jest.Mock).mockResolvedValue({
      tenantId: 'tenant1',
      plan: 'pro',
      status: 'active',
    });

    const plan = await service.getEffectivePlan('tenant1');

    expect(TenantSubscription.findOne).toHaveBeenCalledWith({ tenantId: 'tenant1' });
    expect(plan).toBe('pro');
  });
});
