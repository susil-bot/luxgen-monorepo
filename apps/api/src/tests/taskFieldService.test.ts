import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.mock('@luxgen/db', () => ({
  Task: {
    findOne: jest.fn(),
  },
  TaskTemplate: {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn(),
  },
  TaskFieldValue: {
    find: jest.fn(),
    findOneAndUpdate: jest.fn(),
  },
  isTaskFieldValueFilled: (type: string, value: unknown) => {
    if (value === null || value === undefined) return false;
    if (type === 'checkbox') return value === true;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  },
  newFieldDefinitionId: () => 'field1',
}));

import { Task, TaskTemplate, TaskFieldValue } from '@luxgen/db';
import { TaskFieldService } from '../services/taskFieldService';

describe('TaskFieldService Phase 3', () => {
  let service: TaskFieldService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TaskFieldService();
  });

  it('assertCanComplete throws REQUIRED_FIELDS_INCOMPLETE when required empty', async () => {
    (Task.findOne as jest.Mock).mockResolvedValue({
      _id: { toString: () => 'task1' },
      templateId: 'tpl1',
    });
    (TaskTemplate.findOne as jest.Mock).mockResolvedValue({
      _id: { toString: () => 'tpl1' },
      fields: [{ id: 'f1', name: 'Outcome', type: 'text', required: true }],
    });
    (TaskFieldValue.find as jest.Mock).mockResolvedValue([]);

    await expect(service.assertCanComplete('task1', 'tenant1')).rejects.toMatchObject({
      extensions: { code: 'REQUIRED_FIELDS_INCOMPLETE', missing: ['Outcome'] },
    });
  });

  it('assertCanComplete passes when required values filled', async () => {
    (Task.findOne as jest.Mock).mockResolvedValue({
      _id: { toString: () => 'task1' },
      templateId: 'tpl1',
    });
    (TaskTemplate.findOne as jest.Mock).mockResolvedValue({
      _id: { toString: () => 'tpl1' },
      fields: [{ id: 'f1', name: 'Outcome', type: 'text', required: true }],
    });
    (TaskFieldValue.find as jest.Mock).mockResolvedValue([{ fieldDefinitionId: 'f1', value: 'Shipped' }]);

    await expect(service.assertCanComplete('task1', 'tenant1')).resolves.toBeUndefined();
  });

  it('createTemplate normalizes field ids', async () => {
    (TaskTemplate.create as jest.Mock).mockImplementation(async (doc: unknown) => doc);
    const created = await service.createTemplate({
      tenantId: 'tenant1',
      name: 'Sales close',
      fields: [{ name: 'Deal size', type: 'currency', required: true }],
    });
    expect(TaskTemplate.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Sales close',
        fields: [expect.objectContaining({ id: 'field1', name: 'Deal size', required: true })],
      }),
    );
    expect(created.name).toBe('Sales close');
  });
});
