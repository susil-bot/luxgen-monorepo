import type { AutomationTriggerType } from '@luxgen/db';

/** Redis pub/sub channel for cross-process automation events (optional). */
export const AUTOMATION_EVENTS_CHANNEL = 'luxgen:automation:events';

export interface AutomationEventPayload {
  tenantId: string;
  triggerType: AutomationTriggerType;
  payload: Record<string, unknown>;
  source?: 'agent' | 'lms' | 'webhook' | 'system';
  timestamp: string;
}

export const AGENT_TRIGGER_TYPES: AutomationTriggerType[] = [
  'CODE_CHANGE_STAGED',
  'CODE_CHANGE_COMMITTED',
  'CODE_CHANGE_MERGED',
  'CODE_CHANGE_FAILED',
];

export const AUTOMATION_SCHEMA_DOC = {
  triggers: [
    { type: 'COURSE_COMPLETED', label: 'Course Completed', domain: 'lms' },
    { type: 'USER_ENROLLED', label: 'User Enrolled', domain: 'lms' },
    { type: 'GROUP_JOINED', label: 'Group Joined', domain: 'lms' },
    { type: 'CERTIFICATE_ISSUED', label: 'Certificate Issued', domain: 'lms' },
    { type: 'SCHEDULE', label: 'Scheduled', domain: 'system' },
    { type: 'WEBHOOK', label: 'Webhook', domain: 'integration' },
    { type: 'CODE_CHANGE_STAGED', label: 'Code Change Staged', domain: 'agent' },
    { type: 'CODE_CHANGE_COMMITTED', label: 'Code Change Committed', domain: 'agent' },
    { type: 'CODE_CHANGE_MERGED', label: 'Code Change Merged', domain: 'agent' },
    { type: 'CODE_CHANGE_FAILED', label: 'Code Change Failed', domain: 'agent' },
  ],
  actions: [
    { type: 'SEND_EMAIL', label: 'Send Email' },
    { type: 'ADD_TO_GROUP', label: 'Add to Group' },
    { type: 'REMOVE_FROM_GROUP', label: 'Remove from Group' },
    { type: 'ENROLL_IN_COURSE', label: 'Enroll in Course' },
    { type: 'ISSUE_CERTIFICATE', label: 'Issue Certificate' },
    { type: 'CALL_WEBHOOK', label: 'Call Webhook' },
    { type: 'NOTIFY_SLACK', label: 'Notify Slack' },
    { type: 'TAG_USER', label: 'Tag User' },
    { type: 'RUN_AGENT_TASK', label: 'Run Agent Task', config: { prompt: 'string', autoMerge: 'boolean?' } },
  ],
};
