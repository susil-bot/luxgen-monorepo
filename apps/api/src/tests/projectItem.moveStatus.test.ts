import { ProjectItem } from '@luxgen/db';
import { projectItemService } from '../../src/services/projectItemService';

jest.mock('@luxgen/db', () => ({
  ProjectItem: {
    countDocuments: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    create: jest.fn(),
    findOneAndDelete: jest.fn(),
  },
}));

describe('projectItemService.moveStatus', () => {
  const tenantId = 'tenant-demo';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('persists status change to MongoDB via findOneAndUpdate', async () => {
    const updated = { _id: 'item-1', tenantId, title: 'Task', status: 'DONE', sortOrder: 2 };
    (ProjectItem.findOne as jest.Mock).mockResolvedValue({ sortOrder: 1 });
    (ProjectItem.findOneAndUpdate as jest.Mock).mockResolvedValue(updated);

    const result = await projectItemService.moveStatus('item-1', tenantId, 'DONE');

    expect(ProjectItem.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'item-1', tenantId },
      { $set: { status: 'DONE', sortOrder: 2 } },
      { new: true },
    );
    expect(result).toBe(updated);
  });
});
