import {
  Automation,
  AutomationRun,
  Tenant,
  TenantSubscription,
  TenantUsageMonthly,
  currentUsagePeriod,
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
      await executeAutomationActions(automation, event);
      const durationMs = Date.now() - started;
      await AutomationRun.updateOne({ _id: run._id }, { status: 'success', durationMs });
      await Automation.updateOne({ _id: automation._id }, { $inc: { runCount: 1 }, lastRunAt: new Date() });
      await incrementAutomationRuns(tenantId);
      executed += 1;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      const durationMs = Date.now() - started;
      await AutomationRun.updateOne({ _id: run._id }, { status: 'error', durationMs, error: message });
      await Automation.updateOne({ _id: automation._id }, { $inc: { runCount: 1 }, lastRunAt: new Date() });
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

async function executeAutomationActions(automation: IAutomation, event: AutomationEventPayload): Promise<void> {
  for (const action of automation.actions) {
    await executeAction(action, automation, event);
  }
}

async function executeAction(
  action: IAutomationAction,
  automation: IAutomation,
  event: AutomationEventPayload,
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
      break;
    default:
      console.warn(`[automation-bridge] Unknown action type: ${action.type}`);
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
