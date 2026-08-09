import {
  Task,
  TaskFieldValue,
  TaskTemplate,
  isTaskFieldValueFilled,
  newFieldDefinitionId,
  type ITaskFieldDefinition,
  type ITaskFieldValue,
  type ITaskTemplate,
  type TaskFieldType,
} from '@luxgen/db';
import { GraphQLError } from 'graphql';

export interface CreateTemplateInput {
  tenantId: string;
  name: string;
  description?: string | null;
  teamId?: string | null;
  fields?: Array<{
    name: string;
    type: TaskFieldType;
    required?: boolean;
    options?: string[];
    helpText?: string | null;
  }>;
  createdById?: string | null;
}

export interface UpdateTemplateInput {
  name?: string;
  description?: string | null;
  teamId?: string | null;
  fields?: Array<{
    id?: string;
    name: string;
    type: TaskFieldType;
    required?: boolean;
    options?: string[];
    helpText?: string | null;
  }>;
}

function normalizeFields(
  fields: Array<{
    id?: string;
    name: string;
    type: TaskFieldType;
    required?: boolean;
    options?: string[];
    helpText?: string | null;
  }>,
): ITaskFieldDefinition[] {
  return fields.map((f) => ({
    id: f.id?.trim() || newFieldDefinitionId(),
    name: f.name.trim(),
    type: f.type,
    required: Boolean(f.required),
    options: f.options ?? [],
    helpText: f.helpText ?? null,
  }));
}

export class TaskFieldService {
  async listTemplates(tenantId: string, teamId?: string | null): Promise<ITaskTemplate[]> {
    const query: Record<string, unknown> = { tenantId };
    if (teamId) query.teamId = teamId;
    return TaskTemplate.find(query).sort({ name: 1 });
  }

  async getTemplate(id: string, tenantId: string): Promise<ITaskTemplate | null> {
    return TaskTemplate.findOne({ _id: id, tenantId });
  }

  async createTemplate(input: CreateTemplateInput): Promise<ITaskTemplate> {
    const name = input.name.trim();
    if (!name) {
      throw new GraphQLError('Template name is required', { extensions: { code: 'BAD_USER_INPUT' } });
    }
    return TaskTemplate.create({
      tenantId: input.tenantId,
      name,
      description: input.description ?? null,
      teamId: input.teamId ?? null,
      fields: normalizeFields(input.fields ?? []),
      createdById: input.createdById ?? null,
    });
  }

  async updateTemplate(id: string, tenantId: string, input: UpdateTemplateInput): Promise<ITaskTemplate | null> {
    const $set: Record<string, unknown> = {};
    if (input.name !== undefined) {
      const name = input.name.trim();
      if (!name) throw new GraphQLError('Template name cannot be empty', { extensions: { code: 'BAD_USER_INPUT' } });
      $set.name = name;
    }
    if (input.description !== undefined) $set.description = input.description;
    if (input.teamId !== undefined) $set.teamId = input.teamId;
    if (input.fields !== undefined) $set.fields = normalizeFields(input.fields);
    if (Object.keys($set).length === 0) return this.getTemplate(id, tenantId);
    return TaskTemplate.findOneAndUpdate({ _id: id, tenantId }, { $set }, { new: true });
  }

  async deleteTemplate(id: string, tenantId: string): Promise<boolean> {
    const result = await TaskTemplate.findOneAndDelete({ _id: id, tenantId });
    return Boolean(result);
  }

  async applyTemplateToTask(taskId: string, tenantId: string, templateId: string): Promise<ITaskTemplate> {
    const [task, template] = await Promise.all([
      Task.findOne({ _id: taskId, tenantId }),
      this.getTemplate(templateId, tenantId),
    ]);
    if (!task) throw new GraphQLError('Task not found', { extensions: { code: 'NOT_FOUND' } });
    if (!template) throw new GraphQLError('Template not found', { extensions: { code: 'NOT_FOUND' } });
    return template;
  }

  async listFieldValues(taskId: string, tenantId: string): Promise<ITaskFieldValue[]> {
    return TaskFieldValue.find({ tenantId, taskId });
  }

  async upsertFieldValue(
    taskId: string,
    tenantId: string,
    fieldDefinitionId: string,
    value: unknown,
    updatedById?: string | null,
  ): Promise<ITaskFieldValue> {
    const task = await Task.findOne({ _id: taskId, tenantId });
    if (!task) throw new GraphQLError('Task not found', { extensions: { code: 'NOT_FOUND' } });
    if (!task.templateId) {
      throw new GraphQLError('Task has no template; apply a template before setting fields', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }
    const template = await this.getTemplate(task.templateId, tenantId);
    if (!template?.fields.some((f) => f.id === fieldDefinitionId)) {
      throw new GraphQLError('Unknown field for this task template', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    const updated = await TaskFieldValue.findOneAndUpdate(
      { tenantId, taskId, fieldDefinitionId },
      {
        $set: { value, updatedById: updatedById ?? null },
        $setOnInsert: { tenantId, taskId, fieldDefinitionId },
      },
      { new: true, upsert: true },
    );
    if (!updated) {
      throw new GraphQLError('Failed to save field value', { extensions: { code: 'INTERNAL' } });
    }
    return updated;
  }

  /**
   * Returns missing required field names. Empty array ⇒ completion allowed.
   */
  async getMissingRequiredFields(taskId: string, tenantId: string): Promise<string[]> {
    const task = await Task.findOne({ _id: taskId, tenantId });
    if (!task?.templateId) return [];

    const template = await this.getTemplate(task.templateId, tenantId);
    if (!template) return [];

    const required = template.fields.filter((f) => f.required);
    if (required.length === 0) return [];

    const values = await this.listFieldValues(taskId, tenantId);
    const byId = new Map(values.map((v) => [v.fieldDefinitionId, v.value]));

    return required.filter((f) => !isTaskFieldValueFilled(f.type, byId.get(f.id))).map((f) => f.name);
  }

  async assertCanComplete(taskId: string, tenantId: string): Promise<void> {
    const missing = await this.getMissingRequiredFields(taskId, tenantId);
    if (missing.length === 0) return;
    throw new GraphQLError('Required fields are incomplete', {
      extensions: {
        code: 'REQUIRED_FIELDS_INCOMPLETE',
        missing,
        message: `Fill required fields before completing: ${missing.join(', ')}`,
      },
    });
  }

  templateToGraphQL(t: ITaskTemplate) {
    return {
      id: t._id.toString(),
      tenantId: t.tenantId,
      teamId: t.teamId ?? null,
      name: t.name,
      description: t.description ?? null,
      fields: (t.fields ?? []).map((f) => ({
        id: f.id,
        name: f.name,
        type: f.type,
        required: Boolean(f.required),
        options: f.options ?? [],
        helpText: f.helpText ?? null,
      })),
      createdById: t.createdById ?? null,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    };
  }

  valueToGraphQL(v: ITaskFieldValue) {
    return {
      id: v._id.toString(),
      taskId: v.taskId,
      fieldDefinitionId: v.fieldDefinitionId,
      value: v.value,
      updatedAt: v.updatedAt,
    };
  }
}

export const taskFieldService = new TaskFieldService();
