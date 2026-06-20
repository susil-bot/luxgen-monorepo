import type { ProjectItemIteration, ProjectItemPriority, ProjectItemStatus } from '@luxgen/db';

import type { UiProjectIteration, UiProjectPriority, UiProjectStatus } from './project-map';

export interface ProjectWorkflowSeedItem {
  title: string;
  description?: string;
  status: UiProjectStatus;
  priority: UiProjectPriority;
  assigneeName?: string;
  estimate?: number;
  labels: string[];
}

export interface ProjectWorkflowTemplate {
  id: string;
  name: string;
  persona: 'content_creator' | 'teacher' | 'trainer';
  description: string;
  items: ProjectWorkflowSeedItem[];
}

export const PROJECT_WORKFLOW_TEMPLATES: ProjectWorkflowTemplate[] = [
  {
    id: 'content-creator',
    name: 'Digital content creator',
    persona: 'content_creator',
    description: 'Outline → record → edit → publish modules or videos',
    items: [
      {
        title: 'Plan content calendar (4 weeks)',
        status: 'BACKLOG',
        priority: 'P1',
        assigneeName: 'You',
        estimate: 2,
        labels: ['planning'],
      },
      {
        title: 'Outline next module',
        status: 'READY',
        priority: 'P1',
        assigneeName: 'You',
        estimate: 3,
        labels: ['course'],
      },
      {
        title: 'Record primary lesson video',
        status: 'BACKLOG',
        priority: 'P2',
        assigneeName: 'You',
        estimate: 4,
        labels: ['video'],
      },
      {
        title: 'Edit and upload to course',
        status: 'BACKLOG',
        priority: 'P2',
        assigneeName: 'You',
        estimate: 3,
        labels: ['video', 'course'],
      },
      {
        title: 'Thumbnail, title, and SEO copy',
        status: 'BACKLOG',
        priority: 'P3',
        assigneeName: 'You',
        estimate: 1,
        labels: ['marketing'],
      },
    ],
  },
  {
    id: 'teacher',
    name: 'Teacher / instructor',
    persona: 'teacher',
    description: 'Lesson plans, assessments, and term delivery',
    items: [
      {
        title: 'Week syllabus and learning objectives',
        status: 'READY',
        priority: 'P1',
        assigneeName: 'You',
        estimate: 2,
        labels: ['lesson-plan'],
      },
      {
        title: 'Build slide deck for next week',
        status: 'BACKLOG',
        priority: 'P1',
        assigneeName: 'You',
        estimate: 4,
        labels: ['slides'],
      },
      {
        title: 'Quiz / assessment bank',
        status: 'BACKLOG',
        priority: 'P2',
        assigneeName: 'You',
        estimate: 3,
        labels: ['assessment'],
      },
      {
        title: 'Grade batch and feedback',
        status: 'BACKLOG',
        priority: 'P2',
        assigneeName: 'You',
        estimate: 2,
        labels: ['grading'],
      },
      {
        title: 'Parent / admin communication draft',
        status: 'BACKLOG',
        priority: 'P3',
        assigneeName: 'You',
        estimate: 1,
        labels: ['comms'],
      },
    ],
  },
  {
    id: 'trainer',
    name: 'Personal development trainer',
    persona: 'trainer',
    description: 'Cohort materials, live sessions, and certificates',
    items: [
      {
        title: 'Cohort kickoff runbook',
        status: 'READY',
        priority: 'P0',
        assigneeName: 'You',
        estimate: 2,
        labels: ['cohort'],
      },
      {
        title: 'Workbook / worksheet PDF',
        status: 'BACKLOG',
        priority: 'P1',
        assigneeName: 'You',
        estimate: 4,
        labels: ['materials'],
      },
      {
        title: 'Schedule live Q&A sessions',
        status: 'BACKLOG',
        priority: 'P1',
        assigneeName: 'You',
        estimate: 1,
        labels: ['live'],
      },
      {
        title: 'Certificate template update',
        status: 'BACKLOG',
        priority: 'P2',
        assigneeName: 'You',
        estimate: 2,
        labels: ['certificates'],
      },
      {
        title: 'Cohort retrospective notes',
        status: 'BACKLOG',
        priority: 'P3',
        assigneeName: 'You',
        estimate: 1,
        labels: ['retrospective'],
      },
    ],
  },
];

export function getWorkflowTemplate(id: string): ProjectWorkflowTemplate | undefined {
  return PROJECT_WORKFLOW_TEMPLATES.find((template) => template.id === id);
}

export function workflowItemToCreateInput(
  tenantId: string,
  iteration: UiProjectIteration,
  item: ProjectWorkflowSeedItem,
): {
  tenantId: string;
  title: string;
  description?: string;
  status: ProjectItemStatus;
  iteration: ProjectItemIteration;
  priority: ProjectItemPriority;
  assigneeName?: string;
  estimate?: number;
  labels: string[];
} {
  return {
    tenantId,
    title: item.title,
    description: item.description,
    status: item.status,
    iteration: iteration === 'current' ? 'CURRENT' : 'NEXT',
    priority: item.priority,
    assigneeName: item.assigneeName,
    estimate: item.estimate,
    labels: item.labels,
  };
}
