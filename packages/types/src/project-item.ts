export type ProjectItemStatus = 'BACKLOG' | 'READY' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';

export type ProjectItemIteration = 'CURRENT' | 'NEXT';

export type ProjectItemPriority = 'P0' | 'P1' | 'P2' | 'P3';

export interface ProjectItemDTO {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  status: ProjectItemStatus;
  iteration: ProjectItemIteration;
  priority: ProjectItemPriority;
  assigneeName?: string;
  assigneeId?: string;
  startDate?: string;
  endDate?: string;
  estimate?: number;
  labels: string[];
  courseId?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
