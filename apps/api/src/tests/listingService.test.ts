import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.mock('@luxgen/db', () => ({
  BusinessListing: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('../utils/logger', () => ({
  logger: { warn: jest.fn(), info: jest.fn(), error: jest.fn() },
}));

jest.mock('../services/listingNotificationService', () => ({
  listingNotificationService: { send: jest.fn().mockResolvedValue(undefined) },
}));

import { BusinessListing } from '@luxgen/db';
import { ListingService } from '../services/listingService';

describe('ListingService', () => {
  let service: ListingService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ListingService();
  });

  it('createDraft allocates slug and creates draft listing', async () => {
    (BusinessListing.findOne as jest.Mock).mockResolvedValue(null);
    const created = {
      _id: 'listing1',
      tenantId: 'tenant1',
      businessName: 'Acme Co',
      slug: 'acme-co',
      applicationStatus: 'draft',
    };
    (BusinessListing.create as jest.Mock).mockResolvedValue(created);

    const result = await service.createDraft({
      tenantId: 'tenant1',
      applicantEmail: 'owner@acme.test',
      businessName: 'Acme Co',
    });

    expect(BusinessListing.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 'tenant1',
        businessName: 'Acme Co',
        slug: 'acme-co',
        applicationStatus: 'draft',
      }),
    );
    expect(result).toBe(created);
  });
});
