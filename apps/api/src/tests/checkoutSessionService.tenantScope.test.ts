import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.mock('@luxgen/db', () => ({
  CheckoutSession: { find: jest.fn(), findOne: jest.fn(), findOneAndUpdate: jest.fn(), updateMany: jest.fn() },
  CheckoutSessionStatus: { OPEN: 'OPEN', COMPLETED: 'COMPLETED', ABANDONED: 'ABANDONED', EXPIRED: 'EXPIRED' },
}));

import { CheckoutSession } from '@luxgen/db';
import { checkoutSessionService } from '../services/checkoutSessionService';

describe('checkoutSessionService tenant scoping', () => {
  const tenantA = '507f1f77bcf86cd799439011';

  beforeEach(() => jest.clearAllMocks());

  it('listAbandoned queries by tenant', async () => {
    (CheckoutSession.updateMany as jest.Mock).mockResolvedValue({});
    (CheckoutSession.find as jest.Mock).mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
    await checkoutSessionService.listAbandoned(tenantA);
    expect(CheckoutSession.find).toHaveBeenCalledWith(expect.objectContaining({ tenant: tenantA }));
  });

  it('refreshStaleSessions scopes updateMany to tenant', async () => {
    (CheckoutSession.updateMany as jest.Mock).mockResolvedValue({});
    await checkoutSessionService.listAbandoned(tenantA);
    expect(CheckoutSession.updateMany).toHaveBeenCalledWith(expect.objectContaining({ tenant: tenantA }), expect.any(Object));
  });
});
