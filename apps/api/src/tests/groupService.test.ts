import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.mock('@luxgen/db', () => ({
  Group: jest.fn(),
  GroupMember: {
    countDocuments: jest.fn(),
    find: jest.fn(),
  },
}));

jest.mock('mongoose', () => ({
  startSession: jest.fn(),
}));

import { Group } from '@luxgen/db';
import { GroupService } from '../services/groupService';
import type { GraphQLContext } from '../context';

describe('GroupService', () => {
  const context = {
    tenantId: '507f1f77bcf86cd799439011',
    user: { _id: { toString: () => '507f1f77bcf86cd799439012' } },
  } as GraphQLContext;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('createGroup saves group for tenant and maps GraphQL fields', async () => {
    const now = new Date('2026-06-01');
    const groupDoc = {
      _id: { toString: () => '507f1f77bcf86cd799439013' },
      name: 'Learners',
      description: 'Core cohort',
      color: '#336699',
      icon: 'users',
      isActive: true,
      settings: {
        allowSelfJoin: false,
        requireApproval: true,
        allowFileSharing: true,
        allowComments: true,
        allowNudges: true,
        canSendNudges: false,
      },
      createdAt: now,
      updatedAt: now,
      save: jest.fn().mockResolvedValue(undefined),
    };
    (Group as unknown as jest.Mock).mockImplementation(() => groupDoc);

    const result = await GroupService.createGroup(context, {
      name: 'Learners',
      description: 'Core cohort',
      color: '#336699',
      icon: 'users',
    });

    expect(Group).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Learners',
        tenant: context.tenantId,
        createdBy: '507f1f77bcf86cd799439012',
        isActive: true,
      }),
    );
    expect(groupDoc.save).toHaveBeenCalled();
    expect(result).toMatchObject({
      id: '507f1f77bcf86cd799439013',
      name: 'Learners',
      description: 'Core cohort',
      isActive: true,
    });
  });
});
