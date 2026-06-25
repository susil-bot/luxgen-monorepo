/** Map between GraphQL SCREAMING_SNAKE enums and automations page snake_case types. */

/** Canonical types should mirror @luxgen/automation-flow */
export type UiTriggerType =
  | 'course_completed'
  | 'user_enrolled'
  | 'group_joined'
  | 'certificate_issued'
  | 'schedule'
  | 'webhook'
  | 'code_change_staged'
  | 'code_change_committed'
  | 'code_change_merged'
  | 'code_change_failed';

/** Canonical types should mirror @luxgen/automation-flow */
export type UiActionType =
  | 'send_email'
  | 'add_to_group'
  | 'remove_from_group'
  | 'enroll_in_course'
  | 'issue_certificate'
  | 'call_webhook'
  | 'notify_slack'
  | 'tag_user'
  | 'run_agent_task';

const TRIGGER_TO_GQL: Record<UiTriggerType, string> = {
  course_completed: 'COURSE_COMPLETED',
  user_enrolled: 'USER_ENROLLED',
  group_joined: 'GROUP_JOINED',
  certificate_issued: 'CERTIFICATE_ISSUED',
  schedule: 'SCHEDULE',
  webhook: 'WEBHOOK',
  code_change_staged: 'CODE_CHANGE_STAGED',
  code_change_committed: 'CODE_CHANGE_COMMITTED',
  code_change_merged: 'CODE_CHANGE_MERGED',
  code_change_failed: 'CODE_CHANGE_FAILED',
};

const TRIGGER_FROM_GQL: Record<string, UiTriggerType> = Object.fromEntries(
  Object.entries(TRIGGER_TO_GQL).map(([ui, gql]) => [gql, ui as UiTriggerType]),
);

const ACTION_TO_GQL: Record<UiActionType, string> = {
  send_email: 'SEND_EMAIL',
  add_to_group: 'ADD_TO_GROUP',
  remove_from_group: 'REMOVE_FROM_GROUP',
  enroll_in_course: 'ENROLL_IN_COURSE',
  issue_certificate: 'ISSUE_CERTIFICATE',
  call_webhook: 'CALL_WEBHOOK',
  notify_slack: 'NOTIFY_SLACK',
  tag_user: 'TAG_USER',
  run_agent_task: 'RUN_AGENT_TASK',
};

const ACTION_FROM_GQL: Record<string, UiActionType> = Object.fromEntries(
  Object.entries(ACTION_TO_GQL).map(([ui, gql]) => [gql, ui as UiActionType]),
);

export function triggerToGql(type: UiTriggerType): string {
  return TRIGGER_TO_GQL[type];
}

export function triggerFromGql(type: string): UiTriggerType {
  return TRIGGER_FROM_GQL[type] ?? 'webhook';
}

export function actionToGql(type: UiActionType): string {
  return ACTION_TO_GQL[type];
}

export function actionFromGql(type: string): UiActionType {
  return ACTION_FROM_GQL[type] ?? 'call_webhook';
}

export function formatRelativeTime(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatRunTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toISOString().slice(0, 16).replace('T', ' ');
}
