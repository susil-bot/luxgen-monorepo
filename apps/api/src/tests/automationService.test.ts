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
  resolveAutomationStatus: (automation: { status?: string | null; enabled?: boolean }) =>
    automation.status ?? (automation.enabled ? 'live' : 'draft'),
  enabledFromAutomationStatus: (status: string) => status === 'live',
  liveAutomationFilter: (extra: Record<string, unknown> = {}) => ({
    ...extra,
    $or: [{ status: 'live' }, { status: { $exists: false }, enabled: true }],
  }),
}));

jest.mock('../utils/logger', () => ({
  logger: { warn: jest.fn(), info: jest.fn(), error: jest.fn() },
}));

import { Automation } from '@luxgen/db';
import { AutomationPublishError, AutomationService } from '../services/automationService';

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
        status: 'draft',
        runCount: 0,
      }),
    );
    expect(result).toBe(created);
  });

  it('duplicateAutomation clones config as disabled copy for same tenant', async () => {
    const source = {
      _id: 'auto1',
      tenantId: 'tenant1',
      name: 'Welcome',
      enabled: true,
      triggerType: 'USER_ENROLLED',
      triggerLabel: 'User Enrolled',
      actions: [{ type: 'SEND_EMAIL', label: 'Send Email', config: { template: 'welcome' } }],
      flowDefinition: {
        version: 1,
        meta: { name: 'Welcome', enabled: true },
        entryNodeId: 't1',
        nodes: [],
        edges: [],
      },
      runCount: 42,
    };
    const created = {
      _id: 'auto2',
      tenantId: 'tenant1',
      name: 'Welcome (copy)',
      enabled: false,
      runCount: 0,
    };
    (Automation.findOne as jest.Mock).mockResolvedValue(source);
    (Automation.create as jest.Mock).mockResolvedValue(created);

    const result = await service.duplicateAutomation('auto1', 'tenant1');

    expect(Automation.findOne).toHaveBeenCalledWith({ _id: 'auto1', tenantId: 'tenant1' });
    expect(Automation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 'tenant1',
        name: 'Welcome (copy)',
        enabled: false,
        status: 'draft',
        triggerType: 'USER_ENROLLED',
        runCount: 0,
        flowDefinition: expect.objectContaining({
          meta: expect.objectContaining({ name: 'Welcome (copy)', enabled: false }),
        }),
      }),
    );
    expect(result).toBe(created);
  });

  it('publishAutomation sets live + enabled and stamps publishedAt', async () => {
    const existing = {
      _id: 'auto1',
      tenantId: 'tenant1',
      name: 'Welcome',
      enabled: false,
      status: 'draft',
      triggerType: 'USER_ENROLLED',
      actions: [{ type: 'SEND_EMAIL', label: 'Send Email' }],
      flowDefinition: null,
    };
    const updated = { ...existing, enabled: true, status: 'live', publishedAt: new Date('2026-01-01') };
    (Automation.findOne as jest.Mock).mockResolvedValue(existing);
    (Automation.findOneAndUpdate as jest.Mock).mockResolvedValue(updated);

    const result = await service.publishAutomation('auto1', 'tenant1');

    expect(Automation.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'auto1', tenantId: 'tenant1' },
      {
        $set: expect.objectContaining({
          status: 'live',
          enabled: true,
          publishedAt: expect.any(Date),
        }),
      },
      { new: true },
    );
    expect(result).toBe(updated);
  });

  it('publishAutomation rejects empty action workflow with clear errors', async () => {
    const existing = {
      _id: 'auto1',
      tenantId: 'tenant1',
      name: 'Empty',
      enabled: false,
      status: 'draft',
      triggerType: 'USER_ENROLLED',
      actions: [],
      flowDefinition: null,
    };
    (Automation.findOne as jest.Mock).mockResolvedValue(existing);

    await expect(service.publishAutomation('auto1', 'tenant1')).rejects.toEqual(
      expect.objectContaining({
        name: 'AutomationPublishError',
        code: 'AUTOMATION_PUBLISH_INVALID',
        errors: expect.arrayContaining([expect.stringMatching(/action/i)]),
      }),
    );
    expect(Automation.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('publishAutomation rejects missing trigger on flat automation', async () => {
    const existing = {
      _id: 'auto1',
      tenantId: 'tenant1',
      name: 'No trigger',
      enabled: false,
      status: 'draft',
      triggerType: '',
      actions: [{ type: 'SEND_EMAIL', label: 'Email' }],
      flowDefinition: null,
    };
    (Automation.findOne as jest.Mock).mockResolvedValue(existing);

    await expect(service.publishAutomation('auto1', 'tenant1')).rejects.toMatchObject({
      code: 'AUTOMATION_PUBLISH_INVALID',
      errors: expect.arrayContaining([expect.stringMatching(/trigger/i)]),
    });
  });

  it('pauseAutomation sets paused and disables', async () => {
    const existing = {
      _id: 'auto1',
      tenantId: 'tenant1',
      enabled: true,
      status: 'live',
      flowDefinition: { version: 1, meta: { enabled: true }, entryNodeId: 't1', nodes: [], edges: [] },
    };
    const updated = { ...existing, enabled: false, status: 'paused' };
    (Automation.findOne as jest.Mock).mockResolvedValue(existing);
    (Automation.findOneAndUpdate as jest.Mock).mockResolvedValue(updated);

    const result = await service.pauseAutomation('auto1', 'tenant1');

    expect(Automation.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'auto1', tenantId: 'tenant1' },
      {
        $set: expect.objectContaining({
          status: 'paused',
          enabled: false,
        }),
      },
      { new: true },
    );
    expect(result).toBe(updated);
  });

  it('archiveAutomation soft-archives and refuses further publish', async () => {
    const existing = {
      _id: 'auto1',
      tenantId: 'tenant1',
      enabled: true,
      status: 'live',
      flowDefinition: { version: 1, meta: { enabled: true }, entryNodeId: 't1', nodes: [], edges: [] },
    };
    const archived = { ...existing, enabled: false, status: 'archived', archivedAt: new Date('2026-02-01') };
    (Automation.findOne as jest.Mock).mockResolvedValueOnce(existing).mockResolvedValueOnce(archived);
    (Automation.findOneAndUpdate as jest.Mock).mockResolvedValue(archived);

    const result = await service.archiveAutomation('auto1', 'tenant1');
    expect(result?.status).toBe('archived');

    const publishBlocked = await service.publishAutomation('auto1', 'tenant1');
    expect(publishBlocked).toBeNull();
  });
});
