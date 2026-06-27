import {
  ProjectItem,
  type IProjectItem,
  type ProjectItemIteration,
  type ProjectItemPriority,
  type ProjectItemStatus,
} from '@luxgen/db';
import { logger } from '../utils/logger';

export interface CreateProjectItemInput {
  tenantId: string;
  title: string;
  description?: string;
  status?: ProjectItemStatus;
  iteration?: ProjectItemIteration;
  priority?: ProjectItemPriority;
  assigneeName?: string;
  assigneeId?: string;
  startDate?: Date;
  endDate?: Date;
  estimate?: number;
  labels?: string[];
  courseId?: string;
  createdById?: string;
}

export interface UpdateProjectItemInput {
  title?: string;
  description?: string;
  status?: ProjectItemStatus;
  iteration?: ProjectItemIteration;
  priority?: ProjectItemPriority;
  assigneeName?: string;
  assigneeId?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  estimate?: number | null;
  labels?: string[];
  courseId?: string | null;
  sortOrder?: number;
}

export interface ListProjectItemsFilter {
  iteration?: ProjectItemIteration;
  status?: ProjectItemStatus;
  priority?: ProjectItemPriority;
  assigneeId?: string;
  search?: string;
}

const DEMO_SEED: Omit<CreateProjectItemInput, 'tenantId'>[] = [
  {
    title: 'Outline Module 3 — Mindset fundamentals',
    status: 'IN_PROGRESS',
    iteration: 'CURRENT',
    priority: 'P1',
    assigneeName: 'You',
    startDate: new Date('2026-06-01'),
    endDate: new Date('2026-06-22'),
    estimate: 5,
    labels: ['course'],
  },
  {
    title: 'Record welcome video for cohort',
    status: 'READY',
    iteration: 'CURRENT',
    priority: 'P2',
    assigneeName: 'You',
    startDate: new Date('2026-06-10'),
    endDate: new Date('2026-06-25'),
    estimate: 3,
    labels: ['video'],
  },
  {
    title: 'Quiz bank — Week 5 assessment',
    status: 'BACKLOG',
    iteration: 'CURRENT',
    priority: 'P2',
    assigneeName: 'Alex',
    endDate: new Date('2026-06-28'),
    estimate: 2,
    labels: ['assessment'],
  },
  {
    title: 'Certificate template refresh',
    status: 'IN_REVIEW',
    iteration: 'CURRENT',
    priority: 'P1',
    assigneeName: 'You',
    startDate: new Date('2026-06-05'),
    endDate: new Date('2026-06-20'),
    estimate: 2,
    labels: ['design'],
  },
  {
    title: 'Launch cohort 4 landing copy',
    status: 'DONE',
    iteration: 'CURRENT',
    priority: 'P0',
    assigneeName: 'You',
    startDate: new Date('2026-05-20'),
    endDate: new Date('2026-06-15'),
    estimate: 3,
    labels: ['marketing'],
  },
  {
    title: 'Plan Module 4 — Habits & routines',
    status: 'BACKLOG',
    iteration: 'NEXT',
    priority: 'P1',
    assigneeName: 'You',
    endDate: new Date('2026-07-10'),
    estimate: 5,
    labels: ['course'],
  },
  {
    title: 'Live Q&A session runbook',
    status: 'READY',
    iteration: 'NEXT',
    priority: 'P2',
    assigneeName: 'Alex',
    endDate: new Date('2026-07-05'),
    estimate: 2,
    labels: ['cohort'],
  },
];

export class ProjectItemService {
  async ensureSeedForTenant(tenantId: string): Promise<void> {
    const count = await ProjectItem.countDocuments({ tenantId });
    if (count > 0) return;

    for (const [index, item] of DEMO_SEED.entries()) {
      await ProjectItem.create({
        tenantId,
        ...item,
        sortOrder: index,
      });
    }
    logger.info(`Seeded ${DEMO_SEED.length} project items for tenant ${tenantId}`);
  }

  async listByTenant(tenantId: string, filter: ListProjectItemsFilter = {}): Promise<IProjectItem[]> {
    await this.ensureSeedForTenant(tenantId);

    const query: Record<string, unknown> = { tenantId };
    if (filter.iteration) query.iteration = filter.iteration;
    if (filter.status) query.status = filter.status;
    if (filter.priority) query.priority = filter.priority;
    if (filter.assigneeId) query.assigneeId = filter.assigneeId;

    let items = await ProjectItem.find(query).sort({ sortOrder: 1, createdAt: -1 });

    if (filter.search?.trim()) {
      const q = filter.search.trim().toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.assigneeName?.toLowerCase().includes(q) ||
          item.labels.some((label) => label.toLowerCase().includes(q)),
      );
    }

    return items;
  }

  async getById(id: string, tenantId: string): Promise<IProjectItem | null> {
    return ProjectItem.findOne({ _id: id, tenantId });
  }

  async create(input: CreateProjectItemInput): Promise<IProjectItem> {
    const maxSort = await ProjectItem.findOne({ tenantId: input.tenantId, status: input.status ?? 'BACKLOG' })
      .sort({ sortOrder: -1 })
      .select('sortOrder');

    const item = await ProjectItem.create({
      tenantId: input.tenantId,
      title: input.title.trim(),
      description: input.description ?? '',
      status: input.status ?? 'BACKLOG',
      iteration: input.iteration ?? 'CURRENT',
      priority: input.priority ?? 'P2',
      assigneeName: input.assigneeName,
      assigneeId: input.assigneeId,
      startDate: input.startDate,
      endDate: input.endDate,
      estimate: input.estimate,
      labels: input.labels ?? [],
      courseId: input.courseId,
      createdById: input.createdById,
      sortOrder: (maxSort?.sortOrder ?? -1) + 1,
    });

    logger.info(`Project item created: ${item.title} (${item.tenantId})`);
    return item;
  }

  async update(id: string, tenantId: string, input: UpdateProjectItemInput): Promise<IProjectItem | null> {
    const patch: Record<string, unknown> = { ...input };
    if (input.title != null) patch.title = input.title.trim();
    if (input.assigneeId === null) patch.assigneeId = undefined;
    if (input.courseId === null) patch.courseId = undefined;
    if (input.startDate === null) patch.startDate = undefined;
    if (input.endDate === null) patch.endDate = undefined;
    if (input.estimate === null) patch.estimate = undefined;

    return ProjectItem.findOneAndUpdate({ _id: id, tenantId }, { $set: patch }, { new: true });
  }

  async moveStatus(id: string, tenantId: string, status: ProjectItemStatus): Promise<IProjectItem | null> {
    const maxSort = await ProjectItem.findOne({ tenantId, status }).sort({ sortOrder: -1 }).select('sortOrder');

    return ProjectItem.findOneAndUpdate(
      { _id: id, tenantId },
      { $set: { status, sortOrder: (maxSort?.sortOrder ?? -1) + 1 } },
      { new: true },
    );
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    const result = await ProjectItem.findOneAndDelete({ _id: id, tenantId });
    return Boolean(result);
  }

  toGraphQL(item: IProjectItem) {
    return {
      id: String(item._id),
      tenantId: item.tenantId,
      title: item.title,
      description: item.description ?? '',
      status: item.status,
      iteration: item.iteration,
      priority: item.priority,
      assigneeName: item.assigneeName ?? null,
      assigneeId: item.assigneeId?.toString() ?? null,
      startDate: item.startDate ?? null,
      endDate: item.endDate ?? null,
      estimate: item.estimate ?? null,
      labels: item.labels ?? [],
      courseId: item.courseId?.toString() ?? null,
      sortOrder: item.sortOrder ?? 0,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
}

export const projectItemService = new ProjectItemService();
