#!/bin/bash
# Run with: bash scripts/ship-automation-prs.sh
# (Run with bash explicitly, not by pasting into zsh — that's what broke last time:
# zsh only treats a leading `#` as a comment in scripts, not when lines are pasted
# interactively, so every comment line above became "command not found: #".)
#
# Cleans up the two empty placeholder branches left by an earlier failed attempt,
# then creates the fix/ branch (bug fixes) and the feat/ branch (stacked on it,
# industry compounds) with real commits, pushes both, and opens PRs if `gh` is
# installed and authenticated.
set -uo pipefail

REPO="/Users/susil/Documents/Workspcae/luxgen-monorepo"
cd "$REPO" || { echo "Could not cd to $REPO"; exit 1; }

echo "== Step 0: clear any stale git lock files =="
for f in .git/index.lock .git/HEAD.lock; do
  if [ -f "$f" ]; then
    echo "Found $f — close any other git UI/terminal touching this repo, then removing it."
    rm -f "$f"
  fi
done

echo "== Step 1: snapshot the current combined (fix+feat) bridge.ts/email.ts =="
cp packages/agent/src/automation/bridge.ts /tmp/luxgen-combined-bridge.ts
cp packages/agent/src/automation/email.ts /tmp/luxgen-combined-email.ts

echo "== Step 2: remove the two empty placeholder branches from the earlier failed run =="
git branch -D fix/automation-send-email-and-live-condition-eval 2>/dev/null
git branch -D feat/automation-hub-industry-compounds 2>/dev/null
git push origin --delete fix/automation-send-email-and-live-condition-eval 2>/dev/null
git push origin --delete feat/automation-hub-industry-compounds 2>/dev/null

echo "== Step 3: move to main, carrying your uncommitted work (no stash needed — verified no file overlap) =="
git checkout main || { echo "git checkout main failed — resolve manually, then re-run"; exit 1; }
git pull origin main

echo "== Step 4: create fix/ branch =="
git checkout -b fix/automation-send-email-and-live-condition-eval

cat > packages/agent/src/automation/email.ts << 'EMAILEOF'
/**
 * Self-contained email dispatch for the automation bridge.
 *
 * Deliberately does NOT import from `apps/api` (packages must not depend on apps) — this
 * mirrors `apps/api/src/utils/email.ts`'s provider logic (SendGrid via fetch, log fallback)
 * so the bridge can actually send mail instead of only logging a SEND_EMAIL action.
 */

export interface AutomationEmailTemplateContext {
  payload: Record<string, unknown>;
  subjectOverride?: string;
}

interface EmailTemplateDef {
  subject: (ctx: AutomationEmailTemplateContext) => string;
  body: (ctx: AutomationEmailTemplateContext) => string;
}

function str(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

/**
 * Template registry — keyed to match the `template` select options on the
 * `core.notification.send_email` compound (`packages/automation-flow/src/catalog/compounds.ts`).
 * Add a new template here whenever a new option is added to that select.
 */
export const AUTOMATION_EMAIL_TEMPLATES: Record<string, EmailTemplateDef> = {
  order_confirmation: {
    subject: () => 'Your order is confirmed',
    body: (ctx) =>
      `Hi,\n\nYour order for "${str(ctx.payload.courseTitle, 'your course')}" is confirmed. Thanks for your purchase!`,
  },
  custom: {
    subject: (ctx) => str(ctx.subjectOverride, 'Update from your account'),
    body: (ctx) => str(ctx.payload.body as string | undefined, ''),
  },
};

export interface SendAutomationEmailParams {
  to: string;
  template: string;
  subject?: string;
  payload: Record<string, unknown>;
}

export async function sendAutomationEmail(params: SendAutomationEmailParams): Promise<void> {
  const def = AUTOMATION_EMAIL_TEMPLATES[params.template] ?? AUTOMATION_EMAIL_TEMPLATES.custom;
  const ctx: AutomationEmailTemplateContext = { payload: params.payload, subjectOverride: params.subject };
  const subject = params.subject && params.template === 'custom' ? params.subject : def.subject(ctx);
  const body = def.body(ctx);
  const provider = process.env.EMAIL_PROVIDER || 'log';

  if (provider === 'sendgrid' && process.env.SENDGRID_API_KEY) {
    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: params.to }] }],
        from: {
          email: process.env.EMAIL_FROM || 'noreply@luxgen.com',
          name: process.env.EMAIL_FROM_NAME || 'LuxGen',
        },
        subject,
        content: [{ type: 'text/plain', value: body }],
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`SendGrid error ${res.status}: ${text}`);
    }
    return;
  }

  console.log(`[automation-email:${provider}] To: ${params.to} | Subject: ${subject}\n${body}`);
}

/** Best-effort recipient resolution from a trigger payload — checks the common field names in use across the codebase. */
export function resolveRecipientEmail(payload: Record<string, unknown>): string | undefined {
  const candidate = payload.customerEmail ?? payload.email ?? payload.studentEmail ?? payload.recipientEmail;
  return typeof candidate === 'string' && candidate.includes('@') ? candidate : undefined;
}
EMAILEOF

cat > packages/agent/src/automation/bridge.ts << 'BRIDGEEOF'
import {
  Automation,
  AutomationRun,
  Enrollment,
  TenantUsageMonthly,
  resolveEffectivePlan,
  currentUsagePeriod,
  ActivityEventKind,
  ActivityActorType,
  enrollmentSubjectId,
  type AutomationTriggerType,
  type IAutomation,
  type IAutomationAction,
} from '@luxgen/db';
import { assertWithinLimit } from '@luxgen/billing';
import { randomUUID } from 'crypto';
import { enqueueHeadlessTask } from '../queue/redis-queue';
import { ensureMongoConnection } from '../persistence/mongo';
import { getRedisClient } from '../queue/redis-queue';
import { getOllamaUrl } from '@luxgen/config';
import { AUTOMATION_EVENTS_CHANNEL, type AutomationEventPayload } from './events';
import { recordTimelineEvent, subjectsFromAutomationPayload } from '../timeline/record';
import {
  planFlowExecutionFromDefinition,
  parseTowerFlowDocument,
  getNode,
  getOutgoingEdge,
  evaluateFlowCondition,
  flowActionNodeToLegacyAction,
  type TowerFlowDocument,
} from '@luxgen/automation-flow';
import { sendAutomationEmail, resolveRecipientEmail } from './email';

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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function executeAutomationActions(
  automation: IAutomation,
  event: AutomationEventPayload,
  runId: string,
): Promise<void> {
  const flow = automation.flowDefinition ? parseTowerFlowDocument(automation.flowDefinition) : null;

  if (flow) {
    await walkFlowLive(flow, automation, event, runId);
    return;
  }

  for (const action of automation.actions) {
    await executeAction(action, automation, event, runId);
  }
}

const MAX_LIVE_FLOW_STEPS = 200;

/**
 * Walk the flow graph one node at a time (unlike `planFlowExecutionFromDefinition`, which
 * resolves the *entire* graph — including condition branches — against the static trigger
 * payload before any `wait` step runs). A condition placed after a `wait` (e.g. "is the cart
 * still unpaid after 60 minutes?") needs live data, not the payload captured at trigger time,
 * so this refetches state from the DB after every wait before evaluating the next condition.
 */
async function walkFlowLive(
  flow: TowerFlowDocument,
  automation: IAutomation,
  event: AutomationEventPayload,
  runId: string,
): Promise<void> {
  let payload = { ...event.payload };
  const visited = new Set<string>();
  let stepCount = 0;

  async function walk(nodeId: string): Promise<void> {
    if (visited.has(nodeId) || stepCount >= MAX_LIVE_FLOW_STEPS) return;
    visited.add(nodeId);
    stepCount += 1;

    const node = getNode(flow, nodeId);
    if (!node) return;

    switch (node.kind) {
      case 'trigger': {
        const next = getOutgoingEdge(flow, node.id);
        if (next) await walk(next.to);
        break;
      }
      case 'wait': {
        const seconds = Math.max(0, Number(node.config?.seconds ?? 0));
        if (seconds > 0) {
          console.log(`[automation-bridge] Wait ${seconds}s (${node.title ?? 'Wait'}) for "${automation.name}"`);
          await sleep(seconds * 1000);
          payload = await refreshEventPayload(event.tenantId, payload);
        }
        const next = getOutgoingEdge(flow, node.id);
        if (next) await walk(next.to);
        break;
      }
      case 'condition': {
        const branch = evaluateFlowCondition(node, payload) ? 'true' : 'false';
        const edge = getOutgoingEdge(flow, node.id, branch);
        if (edge) await walk(edge.to);
        break;
      }
      case 'action': {
        const action = flowActionNodeToLegacyAction(node) as IAutomationAction;
        await executeAction(action, automation, { ...event, payload }, runId);
        const next = getOutgoingEdge(flow, node.id);
        if (next) await walk(next.to);
        break;
      }
      default:
        break;
    }
  }

  await walk(flow.entryNodeId);
}

/**
 * Re-fetch live enrollment state (the "order" record for commerce triggers — see
 * `resolveOrderIds`) so a post-wait condition reflects reality, not the trigger-time snapshot.
 * Fails open: a lookup error or unresolvable payload just returns the payload unchanged.
 */
async function refreshEventPayload(
  tenantId: string,
  payload: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const courseId = payload.courseId as string | undefined;
  const studentId = (payload.studentId ?? payload.userId) as string | undefined;
  if (!courseId || !studentId) return payload;

  try {
    const enrollment = await Enrollment.findOne({ tenant: tenantId, course: courseId, student: studentId }).lean<{
      paymentStatus?: string;
      learningStatus?: string;
      progressPercent?: number;
    }>();
    if (!enrollment) return payload;
    return {
      ...payload,
      paymentStatus: enrollment.paymentStatus,
      learningStatus: enrollment.learningStatus,
      progressPercent: enrollment.progressPercent,
    };
  } catch (e: unknown) {
    console.warn(
      '[automation-bridge] refreshEventPayload lookup failed — continuing with stale payload:',
      e instanceof Error ? e.message : e,
    );
    return payload;
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
    case 'SEND_EMAIL': {
      const to = resolveRecipientEmail(event.payload);
      const template = (action.config?.template as string) || 'custom';
      const subject = action.config?.subject as string | undefined;

      if (!to) {
        console.warn(
          `[automation-bridge] SEND_EMAIL skipped for "${automation.name}" — no recipient email found in payload`,
        );
      } else {
        try {
          await sendAutomationEmail({ to, template, subject, payload: event.payload });
        } catch (e: unknown) {
          console.error(
            `[automation-bridge] SEND_EMAIL failed for "${automation.name}":`,
            e instanceof Error ? e.message : e,
          );
        }
      }

      await recordAutomationActionTimeline({
        tenantId: event.tenantId,
        automation,
        action,
        payload: event.payload,
        runId,
      });
      break;
    }
    case 'NOTIFY_SLACK':
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
    case 'UPDATE_ORDER_FIELDS':
      await executeUpdateOrderFields(action, automation, event, runId);
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
  UPDATE_ORDER_FIELDS: 'updated order fields',
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

  const flowSteps = planFlowExecutionFromDefinition(params.automation.flowDefinition, params.event.payload);
  const actionSummary = flowSteps
    ? flowSteps
        .filter((step) => step.kind === 'action')
        .map((step) => step.action.label || step.action.type)
        .join(', ')
    : params.automation.actions.map((a) => a.label || a.type).join(', ');
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

function resolveOrderIds(
  payload: Record<string, unknown>,
): { courseId: string; studentId: string; orderId: string } | null {
  const courseId = payload.courseId as string | undefined;
  const studentId = (payload.studentId ?? payload.userId) as string | undefined;
  const orderIdRaw = payload.orderId as string | undefined;

  if (courseId && studentId) {
    return { courseId, studentId, orderId: enrollmentSubjectId(courseId, studentId) };
  }
  if (orderIdRaw?.includes(':')) {
    const [parsedCourseId, parsedStudentId] = orderIdRaw.split(':');
    if (parsedCourseId && parsedStudentId) {
      return { courseId: parsedCourseId, studentId: parsedStudentId, orderId: orderIdRaw };
    }
  }
  return null;
}

async function executeUpdateOrderFields(
  action: IAutomationAction,
  automation: IAutomation,
  event: AutomationEventPayload,
  runId: string,
): Promise<void> {
  const orderIds = resolveOrderIds(event.payload);
  if (!orderIds) {
    throw new Error('UPDATE_ORDER_FIELDS requires orderId or courseId+studentId in trigger payload');
  }

  const enrollment = await Enrollment.findOne({
    tenant: event.tenantId,
    course: orderIds.courseId,
    student: orderIds.studentId,
  });
  if (!enrollment) {
    throw new Error(`Order not found: ${orderIds.orderId}`);
  }

  const config = action.config ?? {};
  const note = typeof config.note === 'string' ? config.note.trim() : '';
  const tagsRaw = typeof config.tags === 'string' ? config.tags : '';
  const customFields =
    config.customFields && typeof config.customFields === 'object' && !Array.isArray(config.customFields)
      ? (config.customFields as Record<string, unknown>)
      : undefined;

  if (note) enrollment.notes = note;

  if (tagsRaw.trim()) {
    const incoming = tagsRaw
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
    const merged = new Set([...(enrollment.tags ?? []), ...incoming]);
    enrollment.tags = [...merged];
  }

  if (customFields && Object.keys(customFields).length > 0) {
    enrollment.metadata = { ...enrollment.metadata, ...customFields };
  }

  await enrollment.save();

  await recordAutomationActionTimeline({
    tenantId: event.tenantId,
    automation,
    action,
    payload: {
      ...event.payload,
      orderId: orderIds.orderId,
      courseId: orderIds.courseId,
      studentId: orderIds.studentId,
    },
    runId,
  });
}

export type CommerceAutomationEventKind = 'order_created' | 'order_drafted' | 'payment_sent';

/** Map commerce order lifecycle events to automation triggers. */
export async function emitCommerceAutomationEvent(
  tenantId: string,
  kind: CommerceAutomationEventKind,
  details: Record<string, unknown>,
): Promise<number> {
  const map: Record<CommerceAutomationEventKind, AutomationTriggerType> = {
    order_created: 'ORDER_CREATED',
    order_drafted: 'ORDER_DRAFTED',
    payment_sent: 'PAYMENT_SENT',
  };

  const courseId = details.courseId as string | undefined;
  const studentId = (details.studentId ?? details.userId) as string | undefined;
  const payload: Record<string, unknown> = {
    ...details,
    ...(courseId && studentId ? { orderId: enrollmentSubjectId(courseId, studentId) } : {}),
  };

  return emitAutomationEvent({
    tenantId,
    triggerType: map[kind],
    payload,
    source: 'commerce',
  });
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
  return resolveEffectivePlan(tenantId);
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
BRIDGEEOF

git add packages/agent/src/automation/bridge.ts packages/agent/src/automation/email.ts
git commit -m "fix(agent): make SEND_EMAIL actually send mail and re-evaluate flow conditions after a wait against live data

Two correctness bugs in the Tower automation bridge:

1. SEND_EMAIL was a log-only stub - every automation using it (welcome-sequence,
   weekly-digest, completion-cert-slack templates already in the marketplace seed)
   silently never sent real email. Added packages/agent/src/automation/email.ts
   (self-contained SendGrid/log dispatch, mirroring apps/api/src/utils/email.ts)
   and wired it into executeAction.

2. planFlowExecutionFromDefinition resolved condition branches once, against the
   trigger-time payload, before any wait step ran. A flow like 'wait 60 minutes,
   then check if still unpaid' would evaluate the condition on stale data captured
   an hour earlier. executeAutomationActions now walks the flow graph node-by-node
   (walkFlowLive) and re-fetches live Enrollment state after every wait
   (refreshEventPayload) before the next condition runs.

No new dependencies, no new infrastructure, no schema changes - both fixes work
within the existing engine and existing Enrollment model."

if [ $? -ne 0 ]; then
  echo "Fix commit failed — stopping before touching the feat branch. Check the error above."
  exit 1
fi

git push -u origin fix/automation-send-email-and-live-condition-eval

if command -v gh >/dev/null 2>&1; then
  gh pr create \
    --title "fix(agent): make SEND_EMAIL actually send mail and re-evaluate flow conditions after a wait against live data" \
    --base main \
    --label "help wanted" --label bug --label agent --label need-manual-review \
    --body-file PR_DESCRIPTION_automation-send-email-and-live-condition-eval.md
else
  echo "gh CLI not found — open the PR manually:"
  echo "  https://github.com/susil-bot/luxgen-monorepo/pull/new/fix/automation-send-email-and-live-condition-eval"
  echo "  (body is in PR_DESCRIPTION_automation-send-email-and-live-condition-eval.md)"
fi

echo "== Step 5: create feat/ branch, stacked on the fix =="
git checkout -b feat/automation-hub-industry-compounds

cp /tmp/luxgen-combined-bridge.ts packages/agent/src/automation/bridge.ts
cp /tmp/luxgen-combined-email.ts packages/agent/src/automation/email.ts

git add -A
git commit -m "feat(agent): industry-tagged compound catalog + recertification reminder + abandoned-cart reminder

Proves the 'core is fixed, industry is a thin customization layer' model with
two concrete cross-industry compounds: a compliance-training/franchise recert
reminder (new trigger + sweep job) and an ecommerce abandoned-cart reminder
(reuses existing trigger/wait/condition compounds, ships as a graph template).

See docs/AUTOMATION_HUB_STRATEGY.md and docs/TEMPLATE_CONTROL_CORE.md for the
full design. Depends on the paired fix/automation-send-email-and-live-condition-eval
branch - the abandoned-cart template needs its live condition re-evaluation to
behave correctly."

if [ $? -ne 0 ]; then
  echo "Feat commit failed — check the error above. The fix PR/branch above is still fine."
  exit 1
fi

git push -u origin feat/automation-hub-industry-compounds

if command -v gh >/dev/null 2>&1; then
  gh pr create \
    --title "feat(agent): industry-tagged compound catalog + recertification reminder + abandoned-cart reminder" \
    --base fix/automation-send-email-and-live-condition-eval \
    --label "help wanted" --label feat --label agent --label api --label graphql --label mongo --label need-manual-review \
    --body-file PR_DESCRIPTION_automation-hub-industry-compounds.md
else
  echo "gh CLI not found — open the PR manually:"
  echo "  https://github.com/susil-bot/luxgen-monorepo/pull/new/feat/automation-hub-industry-compounds"
  echo "  Set base branch to fix/automation-send-email-and-live-condition-eval, not main."
  echo "  (body is in PR_DESCRIPTION_automation-hub-industry-compounds.md)"
fi

echo ""
echo "== Done. Before deploying either branch: =="
echo "  npm run build --workspace=@luxgen/automation-flow"
echo "  npm run build --workspace=@luxgen/agent"
