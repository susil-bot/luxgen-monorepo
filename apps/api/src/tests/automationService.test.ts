import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.mock('@luxgen/db', () => ({
  Automation: {
    countDocuments: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn(),
  },
  AutomationRun: {
    find: jest.fn(),
  },
}));

jest.mock('../utils/logger', () => ({
  logger: { warn: jest.fn(), info: jest.fn(), error: jest.fn() },
}));

import { Automation } from '@luxgen/db';
import { AutomationService } from '../services/automationService';

describe('AutomationService', () => {
  let service: AutomationService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AutomationService();
  });

  it('createAutomation persists tenant automation', async () => {
    const created = {
      _id: 'auto1',
      tenantId: 'tenant1',
      name: 'Welcome',
      enabled: false,
      runCount: 0,
    };
    (Automation.create as jest.Mock).mockResolvedValue(created);

    const result = await service.createAutomation({
      tenantId: 'tenant1',
      name: 'Welcome',
      triggerType: 'USER_ENROLLED',
      triggerLabel: 'User Enrolled',
      actions: [{ type: 'SEND_EMAIL', label: 'Send Email' }],
    });

    expect(Automation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 'tenant1',
        name: 'Welcome',
        enabled: false,
        runCount: 0,
      }),
    );
    expect(result).toBe(created);
  });
});
