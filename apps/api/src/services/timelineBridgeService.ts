import {
  ActivityActorType,
  ActivityEventKind,
  ActivitySubjectType,
  type IAutomationAction,
  type AutomationTriggerType,
} from '@luxgen/db';
import { activityEventService } from './activityEventService';

function orderSubjectId(courseId: string, studentId: string): string {
  return `${courseId}:${studentId}`;
}

function subjectsFromPayload(payload: Record<string, unknown>): Array<{
  subjectType: ActivitySubjectType;
  subjectId: string;
}> {
  const subjects: Array<{ subjectType: ActivitySubjectType; subjectId: string }> = [];
  const courseId = payload.courseId as string | undefined;
  const studentId = (payload.studentId ?? payload.userId) as string | undefined;
  const orderId = payload.orderId as string | undefined;

  if (orderId) {
    subjects.push({ subjectType: ActivitySubjectType.ORDER, subjectId: orderId });
    const [, sid] = orderId.split(':');
    if (sid) subjects.push({ subjectType: ActivitySubjectType.CUSTOMER, subjectId: sid });
  } else if (courseId && studentId) {
    const oid = orderSubjectId(courseId, studentId);
    subjects.push({ subjectType: ActivitySubjectType.ORDER, subjectId: oid });
    subjects.push({ subjectType: ActivitySubjectType.CUSTOMER, subjectId: studentId });
  } else if (courseId) {
    subjects.push({ subjectType: ActivitySubjectType.PRODUCT, subjectId: courseId });
  } else if (studentId) {
    subjects.push({ subjectType: ActivitySubjectType.CUSTOMER, subjectId: studentId });
  }

  return subjects;
}

const ACTION_LABELS: Record<string, string> = {
  SEND_EMAIL: 'sent an email',
  ADD_TO_GROUP: 'added customer to a group',
  REMOVE_FROM_GROUP: 'removed customer from a group',
  ENROLL_IN_COURSE: 'enrolled customer in a course',
  ISSUE_CERTIFICATE: 'issued a certificate',
  CALL_WEBHOOK: 'called a webhook',
  NOTIFY_SLACK: 'sent a Slack notification',
  TAG_USER: 'tagged the customer',
  RUN_AGENT_TASK: 'ran an agent task',
};

export class TimelineBridgeService {
  async recordAutomationRun(params: {
    tenantId: string;
    automationId: string;
    automationName: string;
    triggerType: AutomationTriggerType;
    payload: Record<string, unknown>;
    status: 'success' | 'error';
    error?: string;
    actions?: IAutomationAction[];
  }): Promise<void> {
    const subjects = subjectsFromPayload(params.payload);
    if (subjects.length === 0) return;

    const actionSummary =
      params.actions?.map((a) => a.label || a.type).join(', ') || 'automation actions';
    const message =
      params.status === 'success'
        ? `${params.automationName} ran (${actionSummary})`
        : `${params.automationName} failed: ${params.error ?? 'unknown error'}`;

    const metadata = {
      automationId: params.automationId,
      automationName: params.automationName,
      triggerType: params.triggerType,
      status: params.status,
      actions: params.actions?.map((a) => ({ type: a.type, label: a.label })),
      ...params.payload,
    };

    for (const { subjectType, subjectId } of subjects) {
      await activityEventService.record({
        tenantId: params.tenantId,
        subjectType,
        subjectId,
        kind: ActivityEventKind.APP,
        eventType: params.status === 'success' ? 'automation.ran' : 'automation.failed',
        message,
        actorType: ActivityActorType.APP,
        actorName: params.automationName,
        metadata,
        criticalAlert: params.status === 'error',
      });
    }
  }

  async recordAutomationAction(params: {
    tenantId: string;
    automationName: string;
    automationId: string;
    action: IAutomationAction;
    payload: Record<string, unknown>;
    runId?: string;
  }): Promise<void> {
    const subjects = subjectsFromPayload(params.payload);
    if (subjects.length === 0) return;

    const verb = ACTION_LABELS[params.action.type] ?? `ran ${params.action.label}`;
    const message = `${params.automationName} ${verb}`;

    const metadata = {
      automationId: params.automationId,
      automationName: params.automationName,
      actionType: params.action.type,
      actionLabel: params.action.label,
      actionConfig: params.action.config ?? {},
      runId: params.runId,
      ...params.payload,
    };

    for (const { subjectType, subjectId } of subjects) {
      await activityEventService.record({
        tenantId: params.tenantId,
        subjectType,
        subjectId,
        kind: ActivityEventKind.APP,
        eventType:
          params.action.type === 'SEND_EMAIL'
            ? 'order.email_sent'
            : `automation.action.${params.action.type.toLowerCase()}`,
        message,
        actorType: ActivityActorType.APP,
        actorName: params.automationName,
        metadata,
      });
    }
  }

  async recordAgentAction(params: {
    tenantId: string;
    sessionId: string;
    userId: string;
    action: string;
    details?: Record<string, unknown>;
  }): Promise<void> {
    const details = params.details ?? {};
    const courseId = details.courseId as string | undefined;
    const orderId = details.orderId as string | undefined;
    const customerId = (details.customerId ?? details.userId ?? params.userId) as string | undefined;

    const subjects: Array<{ subjectType: ActivitySubjectType; subjectId: string }> = [];
    if (orderId) {
      subjects.push({ subjectType: ActivitySubjectType.ORDER, subjectId: orderId });
    }
    if (courseId) {
      subjects.push({ subjectType: ActivitySubjectType.PRODUCT, subjectId: courseId });
    }
    if (customerId && !orderId) {
      subjects.push({ subjectType: ActivitySubjectType.CUSTOMER, subjectId: customerId });
    }
    if (subjects.length === 0) return;

    const message = `Agent Studio: ${params.action.replace(/_/g, ' ')}`;
    const criticalAlert = params.action === 'failed';

    const metadata = {
      sessionId: params.sessionId,
      agentAction: params.action,
      userId: params.userId,
      ...details,
    };

    for (const { subjectType, subjectId } of subjects) {
      await activityEventService.record({
        tenantId: params.tenantId,
        subjectType,
        subjectId,
        kind: ActivityEventKind.APP,
        eventType: `agent.${params.action}`,
        message,
        actorType: ActivityActorType.APP,
        actorName: 'Agent Studio',
        metadata,
        criticalAlert,
      });
    }
  }
}

export const timelineBridgeService = new TimelineBridgeService();
