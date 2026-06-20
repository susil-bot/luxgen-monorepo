export type ProjectStatus = 'BACKLOG' | 'READY' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';

export type ProjectIterationScope = 'current' | 'next';

export type ProjectPriority = 'P0' | 'P1' | 'P2' | 'P3';

export interface ProjectItem {
  id: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  iteration: ProjectIterationScope;
  priority: ProjectPriority;
  assignee?: string;
  assigneeName?: string;
  startDate?: string;
  endDate?: string;
  estimate?: number;
  labels: string[];
}

export interface ProjectWorkflowTemplate {
  id: string;
  name: string;
  persona: 'content_creator' | 'teacher' | 'trainer';
  description: string;
}

export const PROJECT_COLUMNS: {
  status: ProjectStatus;
  label: string;
  hint: string;
  dotClass: string;
}[] = [
  { status: 'BACKLOG', label: 'Backlog', hint: "This item hasn't been started", dotClass: 'lux-project-dot--green' },
  { status: 'READY', label: 'Ready', hint: 'This is ready to be picked up', dotClass: 'lux-project-dot--blue' },
  {
    status: 'IN_PROGRESS',
    label: 'In progress',
    hint: 'This is actively being worked on',
    dotClass: 'lux-project-dot--orange',
  },
  { status: 'IN_REVIEW', label: 'In review', hint: 'This item is in review', dotClass: 'lux-project-dot--purple' },
  { status: 'DONE', label: 'Done', hint: 'This item is complete', dotClass: 'lux-project-dot--red' },
];

export const PRIORITY_LABELS: Record<ProjectPriority, string> = {
  P0: 'Critical',
  P1: 'High',
  P2: 'Medium',
  P3: 'Low',
};
