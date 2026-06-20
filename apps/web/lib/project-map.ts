import type { ProjectItemIteration, ProjectItemPriority, ProjectItemStatus } from '@luxgen/db';

export type UiProjectIteration = 'current' | 'next';

export type UiProjectStatus = 'BACKLOG' | 'READY' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';

export type UiProjectPriority = 'P0' | 'P1' | 'P2' | 'P3';

export interface UiProjectItem {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  status: UiProjectStatus;
  iteration: UiProjectIteration;
  priority: UiProjectPriority;
  assigneeName?: string;
  assigneeId?: string;
  startDate?: string;
  endDate?: string;
  estimate?: number;
  labels: string[];
  courseId?: string;
  sortOrder: number;
}

export function iterationToGql(scope: UiProjectIteration): ProjectItemIteration {
  return scope === 'current' ? 'CURRENT' : 'NEXT';
}

export function iterationFromGql(iteration: ProjectItemIteration): UiProjectIteration {
  return iteration === 'CURRENT' ? 'current' : 'next';
}

export function itemFromGql(raw: {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  status: ProjectItemStatus;
  iteration: ProjectItemIteration;
  priority: ProjectItemPriority;
  assigneeName?: string | null;
  assigneeId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  estimate?: number | null;
  labels: string[];
  courseId?: string | null;
  sortOrder: number;
}): UiProjectItem {
  return {
    id: raw.id,
    tenantId: raw.tenantId,
    title: raw.title,
    description: raw.description,
    status: raw.status,
    iteration: iterationFromGql(raw.iteration),
    priority: raw.priority,
    assigneeName: raw.assigneeName ?? undefined,
    assigneeId: raw.assigneeId ?? undefined,
    startDate: raw.startDate ?? undefined,
    endDate: raw.endDate ?? undefined,
    estimate: raw.estimate ?? undefined,
    labels: raw.labels,
    courseId: raw.courseId ?? undefined,
    sortOrder: raw.sortOrder,
  };
}

export function dateInputToIso(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return value.includes('T') ? value : `${value}T00:00:00.000Z`;
}
