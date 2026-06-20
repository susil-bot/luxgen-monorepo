import {
  Automation,
  AutomationRun,
  Tenant,
  TenantSubscription,
  TenantUsageMonthly,
  currentUsagePeriod,
  ActivityEventKind,
  ActivityActorType,
  type AutomationTriggerType,
  type IAutomation,
  type IAutomationAction,
} from '@luxgen/db';
import { assertWithinLimit, normalizePlan } from '@luxgen/billing';
import { randomUUID } from 'crypto';
import { enqueueHeadlessTask } from '../queue/redis-queue';
import { ensureMongoConnection } from '../persistence/mongo';
import { getRedisClient } from '../queue/redis-queue';
import { getOllamaUrl } from '@luxgen/config';
import { AUTOMATION_EVENTS_CHANNEL, type AutomationEventPayload } from './events';
import { recordTimelineEvent, subjectsFromAutomationPayload } from '../timeline/record';

export interface EmitAutomationEventOptions {
  tenantId: string;
  triggerType: AutomationTriggerType;
  payload?: Record<string, unknown>;
  source?: AutomationEventPayload['source'];
}

export async function emitAutomationEvent(options: EmitAutomationEventOptions): Promise<number> {
  const { tenantId, triggerType, payload = {}, source = 'system' } = options;

  const event: AutomationEventPayload = {
    tenantId,
    triggerType,
    payload,
    source,
    timestamp: new Date().toISOString(),
  };

  await publishAutomationEvent(event);

  const connected = await ensureMongoConnection();
  if (!connected) {
    console.warn('[automation-bridge] MongoDB unavailable — event logged only:', triggerType);
    return 0;
  }

  try {
    await assertMonthlyAutomationRunsAllowed(tenantId);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    console.warn(`[automation-bridge] Usage limit blocked run for ${tenantId}:`, message);
    return 0;
  }

  const automations = await Automation.find({
    tenantId,
    enabled: true,
    triggerType,
  }).lean<IAutomation[]>();

  let executed = 0;
  for (const automation of automations) {
    const started = Date.now();
    const run = await AutomationRun.create({
      automationId: String(automation._id),
      automationName: automation.name,
      tenantId,
      triggerType,
      status: 'running',
      durationMs: 0,
      payload,
      triggeredAt: new Date(),
    });

    try {
      await executeAutomationActions(automation, event, String(run._id));
      const durationMs = Date.now() - started;
      await AutomationRun.updateOne({ _id: run._id }, { status: 'success', durationMs });
      await Automation.updateOne({ _id: automation._id }, { $inc: { runCount: 1 }, lastRunAt: new Date() });
      await incrementAutomationRuns(tenantId);
      await recordAutomationTimeline({
        tenantId,
        automation,
        event,
        runId: String(run._id),
        status: 'success',
      });
      executed += 1;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      const durationMs = Date.now() - started;
      await AutomationRun.updateOne({ _id: run._id }, { status: 'error', durationMs, error: message });
      await Automation.updateOne({ _id: automation._id }, { $inc: { runCount: 1 }, lastRunAt: new Date() });
      await recordAutomationTimeline({
        tenantId,
        automation,
        event,
        runId: String(run._id),
        status: 'error',
        error: message,
      });
      console.error(`[automation-bridge] Run failed for "${automation.name}":`, message);
    }
  }

  return executed;
}

async function publishAutomationEvent(event: AutomationEventPayload): Promise<void> {
  const client = getRedisClient();
  if (!client) return;
  try {
    if (client.status !== 'ready') await client.connect();
    await client.publish(AUTOMATION_EVENTS_CHANNEL, JSON.stringify(event));
  } catch {
    // Pub/sub is optional — Mongo execution is primary
  }
}

async function executeAutomationActions(
  automation: IAutomation,
  event: AutomationEventPayload,
  runId: string,
): Promise<void> {
  for (const action of automation.actions) {
    await executeAction(action, automation, event, runId);
  }
}

async function executeAction(
  action: IAutomationAction,
  automation: IAutomation,
  event: AutomationEventPayload,
  runId: string,
): Promise<void> {
  switch (action.type) {
    case 'RUN_AGENT_TASK': {
      const prompt =
        (action.config?.prompt as string) || `Automation "${automation.name}" triggered by ${event.triggerType}`;
      const sessionId = randomUUID();
      const userId = (event.payload.userId as string) || 'system';
      const ollamaHost = getOllamaUrl();

      const job = await enqueueHeadlessTask({
        sessionId,
        tenantId: event.tenantId,
        userId,
        messages: [{ role: 'user', content: prompt }],
        ollamaHost,
        model: action.config?.model as string | undefined,
      });

      if (!job) {
        console.warn('[automation-bridge] RUN_AGENT_TASK skipped — queue disabled');
      }
      break;
    }
    case 'NOTIFY_SLACK':
    case 'SEND_EMAIL':
    case 'CALL_WEBHOOK':
    case 'TAG_USER':
    case 'ADD_TO_GROUP':
    case 'REMOVE_FROM_GROUP':
    case 'ENROLL_IN_COURSE':
    case 'ISSUE_CERTIFICATE':
      console.log(
        `[automation-bridge] ${action.type} for "${automation.name}" (tenant=${event.tenantId})`,
        action.config ?? {},
      );
      await recordAutomationActionTimeline({
        tenantId: event.tenantId,
        automation,
        action,
        payload: event.payload,
        runId,
      });
      break;
    default:
      console.warn(`[automation-bridge] Unknown action type: ${action.type}`);
  }
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

async function recordAutomationTimeline(params: {
  tenantId: string;
  automation: IAutomation;
  event: AutomationEventPayload;
  runId: string;
  status: 'success' | 'error';
  error?: string;
}): Promise<void> {
  const subjects = subjectsFromAutomationPayload(params.event.payload);
  if (subjects.length === 0) return;

  const actionSummary = params.automation.actions.map((a) => a.label || a.type).join(', ');
  const message =
    params.status === 'success'
      ? `${params.automation.name} ran (${actionSummary})`
      : `${params.automation.name} failed: ${params.error ?? 'unknown error'}`;

  const metadata = {
    automationId: String(params.automation._id),
    automationName: params.automation.name,
    triggerType: params.event.triggerType,
    status: params.status,
    runId: params.runId,
    ...params.event.payload,
  };

  for (const { subjectType, subjectId } of subjects) {
    await recordTimelineEvent({
      tenantId: params.tenantId,
      subjectType,
      subjectId,
      kind: ActivityEventKind.APP,
      eventType: params.status === 'success' ? 'automation.ran' : 'automation.failed',
      message,
      actorType: ActivityActorType.APP,
      actorName: params.automation.name,
      metadata,
      criticalAlert: params.status === 'error',
    });
  }
}

async function recordAutomationActionTimeline(params: {
  tenantId: string;
  automation: IAutomation;
  action: IAutomationAction;
  payload: Record<string, unknown>;
  runId: string;
}): Promise<void> {
  const subjects = subjectsFromAutomationPayload(params.payload);
  if (subjects.length === 0) return;

  const verb = ACTION_LABELS[params.action.type] ?? `ran ${params.action.label}`;
  const message = `${params.automation.name} ${verb}`;
  const metadata = {
    automationId: String(params.automation._id),
    automationName: params.automation.name,
    actionType: params.action.type,
    actionLabel: params.action.label,
    actionConfig: params.action.config ?? {},
    runId: params.runId,
    ...params.payload,
  };

  for (const { subjectType, subjectId } of subjects) {
    await recordTimelineEvent({
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
      actorName: params.automation.name,
      metadata,
    });
  }
}

/** Map agent lifecycle events to automation triggers. */
export async function emitAgentAutomationEvent(
  tenantId: string,
  kind: 'staged' | 'committed' | 'merged' | 'failed',
  details: Record<string, unknown>,
): Promise<number> {
  const map: Record<typeof kind, AutomationTriggerType> = {
    staged: 'CODE_CHANGE_STAGED',
    committed: 'CODE_CHANGE_COMMITTED',
    merged: 'CODE_CHANGE_MERGED',
    failed: 'CODE_CHANGE_FAILED',
  };

  return emitAutomationEvent({
    tenantId,
    triggerType: map[kind],
    payload: details,
    source: 'agent',
  });
}

async function resolveTenantPlan(tenantId: string) {
  const sub = await TenantSubscription.findOne({ tenantId }).lean();
  if (sub && ['active', 'trialing'].includes(sub.status)) {
    return normalizePlan(sub.plan);
  }
  const tenant = await Tenant.findOne({ subdomain: tenantId }).lean();
  return normalizePlan(tenant?.metadata?.plan as string | undefined);
}

async function assertMonthlyAutomationRunsAllowed(tenantId: string): Promise<void> {
  const plan = await resolveTenantPlan(tenantId);
  const period = currentUsagePeriod();
  const usage = await TenantUsageMonthly.findOne({ tenantId, period }).lean();
  const runs = usage?.automationRuns ?? 0;
  assertWithinLimit(plan, 'automationRuns', runs);
}

async function incrementAutomationRuns(tenantId: string): Promise<void> {
  const period = currentUsagePeriod();
  await TenantUsageMonthly.findOneAndUpdate({ tenantId, period }, { $inc: { automationRuns: 1 } }, { upsert: true });
}
