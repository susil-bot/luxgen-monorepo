import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.mock('@luxgen/db', () => ({
  ProjectItem: {
    countDocuments: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn(),
  },
}));

jest.mock('../utils/logger', () => ({
  logger: { warn: jest.fn(), info: jest.fn(), error: jest.fn() },
}));

import { ProjectItem } from '@luxgen/db';
import { ProjectItemService } from '../services/projectItemService';

describe('ProjectItemService', () => {
  let service: ProjectItemService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ProjectItemService();
  });

  describe('listByTenant', () => {
    it('seeds demo items when tenant has none', async () => {
      (ProjectItem.countDocuments as jest.Mock).mockResolvedValue(0);
      (ProjectItem.create as jest.Mock).mockResolvedValue({});
      (ProjectItem.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      });

      await service.listByTenant('tenant1');

      expect(ProjectItem.create).toHaveBeenCalled();
      expect(ProjectItem.find).toHaveBeenCalledWith({ tenantId: 'tenant1' });
    });

    it('filters by iteration and search', async () => {
      (ProjectItem.countDocuments as jest.Mock).mockResolvedValue(2);
      const items = [
        { title: 'Record video', assigneeName: 'You', labels: ['video'], sortOrder: 0, createdAt: new Date() },
        { title: 'Quiz bank', assigneeName: 'Alex', labels: ['assessment'], sortOrder: 1, createdAt: new Date() },
      ];
      (ProjectItem.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(items),
      });

      const result = await service.listByTenant('tenant1', {
        iteration: 'CURRENT',
        search: 'video',
      });

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Record video');
    });
  });

  describe('moveStatus', () => {
    it('updates status and appends sort order in target column', async () => {
      (ProjectItem.findOne as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({ sortOrder: 3 }),
        }),
      });
      const moved = { _id: 'item1', tenantId: 'tenant1', status: 'IN_PROGRESS', sortOrder: 4 };
      (ProjectItem.findOneAndUpdate as jest.Mock).mockResolvedValue(moved);

      const result = await service.moveStatus('item1', 'tenant1', 'IN_PROGRESS');

      expect(ProjectItem.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'item1', tenantId: 'tenant1' },
        { $set: { status: 'IN_PROGRESS', sortOrder: 4 } },
        { new: true },
      );
      expect(result?.status).toBe('IN_PROGRESS');
    });
  });

  describe('toGraphQL', () => {
    it('maps mongoose document to GraphQL shape', () => {
      const mapped = service.toGraphQL({
        _id: { toString: () => 'abc123' },
        tenantId: 'tenant1',
        title: 'Outline module',
        description: '',
        status: 'BACKLOG',
        iteration: 'CURRENT',
        priority: 'P2',
        labels: ['course'],
        sortOrder: 0,
        createdAt: new Date('2026-06-01'),
        updatedAt: new Date('2026-06-02'),
      } as never);

      expect(mapped).toMatchObject({
        id: 'abc123',
        tenantId: 'tenant1',
        title: 'Outline module',
        status: 'BACKLOG',
        iteration: 'CURRENT',
        labels: ['course'],
      });
    });
  });
});
