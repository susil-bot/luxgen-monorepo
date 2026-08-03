import {
  Automation,
  AutomationRun,
  enabledFromAutomationStatus,
  liveAutomationFilter,
  resolveAutomationStatus,
  type AutomationActionType,
  type AutomationStatus,
  type AutomationTriggerType,
  type IAutomation,
  type IAutomationAction,
  type IAutomationRun,
} from '@luxgen/db';
import { emitAutomationEvent, runAutomationTest } from '@luxgen/agent';
import {
  collectTowerFlowGraphWarnings,
  flowToLegacyAutomation,
  parseTowerFlowDocument,
  validateTowerFlowDocument,
} from '@luxgen/automation-flow';
import { logger } from '../utils/logger';

/** Thrown when publish rules fail — mapped to GraphQL AUTOMATION_PUBLISH_INVALID. */
export class AutomationPublishError extends Error {
  readonly code = 'AUTOMATION_PUBLISH_INVALID';
  readonly errors: string[];

  constructor(errors: string[]) {
    super(errors.join('; '));
    this.name = 'AutomationPublishError';
    this.errors = errors;
  }
}

export interface AutomationActionInput {
  type: AutomationActionType;
  label: string;
  config?: Record<string, unknown>;
}

export interface CreateAutomationInput {
  tenantId: string;
  name: string;
  triggerType: AutomationTriggerType;
  triggerLabel: string;
  actions: AutomationActionInput[];
  enabled?: boolean;
  status?: AutomationStatus;
  flowDefinition?: Record<string, unknown>;
}

export interface UpdateAutomationInput {
  name?: string;
  triggerType?: AutomationTriggerType;
  triggerLabel?: string;
  actions?: AutomationActionInput[];
  enabled?: boolean;
  status?: AutomationStatus;
  flowDefinition?: Record<string, unknown>;
}

function enabledFromStatus(status: AutomationStatus): boolean {
  return enabledFromAutomationStatus(status);
}

function statusFromEnabled(enabled: boolean, previous?: AutomationStatus | null): AutomationStatus {
  if (previous === 'archived') return 'archived';
  if (enabled) return 'live';
  if (previous === 'draft' || previous == null) return 'draft';
  return 'paused';
}

function patchFlowMetaEnabled(
  flowDefinition: Record<string, unknown> | undefined,
  enabled: boolean,
): Record<string, unknown> | undefined {
  if (!flowDefinition || typeof flowDefinition !== 'object') return flowDefinition;
  const next = JSON.parse(JSON.stringify(flowDefinition)) as Record<string, unknown>;
  if (next.meta && typeof next.meta === 'object') {
    (next.meta as Record<string, unknown>).enabled = enabled;
  }
  return next;
}

/**
 * When `flowDefinition` is present and valid, derive legacy flat fields so list/bridge
 * queries stay aligned with Tower graph (TODO §11 Workflow.steps ↔ Automation dual write).
 * Invalid/missing flow left unchanged — callers may still use flat-only automations.
 */
function applyFlowDefinitionSync<T extends { flowDefinition?: Record<string, unknown>; status?: AutomationStatus }>(
  input: T,
): T &
  Partial<{
    name: string;
    enabled: boolean;
    status: AutomationStatus;
    triggerType: AutomationTriggerType;
    triggerLabel: string;
    actions: AutomationActionInput[];
    flowDefinition: Record<string, unknown>;
  }> {
  if (input.flowDefinition == null) return input;
  const flow = parseTowerFlowDocument(input.flowDefinition);
  if (!flow) return input;
  const legacy = flowToLegacyAutomation(flow);
  return {
    ...input,
    name: legacy.name,
    triggerType: legacy.triggerType as AutomationTriggerType,
    triggerLabel: legacy.triggerLabel,
    actions: legacy.actions.map((a) => ({
      type: a.type as AutomationActionType,
      label: a.label,
      config: a.config,
    })),
    flowDefinition: flow as unknown as Record<string, unknown>,
    // Lifecycle (`status` / `enabled`) is owned by publish/pause/archive — not flow.meta
  };
}

/** TODO §13 Publishing Rules — structural checks before going live (tenant-scoped caller). */
export function collectAutomationPublishErrors(automation: {
  name?: string | null;
  triggerType?: string | null;
  actions?: Array<{ type?: string }> | null;
  flowDefinition?: unknown;
}): string[] {
  const errors: string[] = [];
  const name = (automation.name ?? '').trim();
  if (!name) {
    errors.push('Workflow name is required');
  } else if (name.length > 100) {
    errors.push('Workflow name must be at most 100 characters');
  }

  const flowRaw = automation.flowDefinition;
  if (flowRaw != null && typeof flowRaw === 'object') {
    const validated = validateTowerFlowDocument(flowRaw);
    if (!validated.ok) {
      for (const err of validated.errors) {
        errors.push(`${err.path}: ${err.message}`);
      }
      return errors;
    }
    const actionCount = validated.data.nodes.filter((n) => n.kind === 'action').length;
    if (actionCount < 1) {
      errors.push('Must have at least one action step before publishing');
    }
    for (const warning of collectTowerFlowGraphWarnings(validated.data)) {
      if (
        warning.message.includes('unreachable') ||
        warning.message.includes('missing outgoing') ||
        warning.message.includes('multiple outgoing')
      ) {
        errors.push(`${warning.path}: ${warning.message}`);
      }
    }
    return errors;
  }

  if (!automation.triggerType) {
    errors.push('Exactly one trigger is required');
  }
  if (!automation.actions?.length) {
    errors.push('Must have at least one action step before publishing');
  }
  return errors;
}

const DEMO_SEED: Omit<CreateAutomationInput, 'tenantId'>[] = [
  {
    name: 'Welcome new learners',
    enabled: true,
    status: 'live',
    triggerType: 'USER_ENROLLED',
    triggerLabel: 'User Enrolled',
    actions: [
      { type: 'SEND_EMAIL', label: 'Send Email' },
      { type: 'ADD_TO_GROUP', label: 'Add to Group' },
    ],
  },
  {
    name: 'Course completion certificate',
    enabled: true,
    status: 'live',
    triggerType: 'COURSE_COMPLETED',
    triggerLabel: 'Course Completed',
    actions: [
      { type: 'ISSUE_CERTIFICATE', label: 'Issue Certificate' },
      { type: 'SEND_EMAIL', label: 'Send Email' },
      { type: 'NOTIFY_SLACK', label: 'Notify Slack' },
    ],
  },
  {
    name: 'Weekly progress report',
    enabled: false,
    status: 'paused',
    triggerType: 'SCHEDULE',
    triggerLabel: 'Scheduled',
    actions: [{ type: 'SEND_EMAIL', label: 'Send Email' }],
  },
  {
    name: 'Tag power learners',
    enabled: true,
    status: 'live',
    triggerType: 'CERTIFICATE_ISSUED',
    triggerLabel: 'Certificate Issued',
    actions: [
      { type: 'TAG_USER', label: 'Tag User' },
      { type: 'ENROLL_IN_COURSE', label: 'Enroll in Course' },
    ],
  },
  {
    name: 'Notify on agent merge',
    enabled: false,
    status: 'draft',
    triggerType: 'CODE_CHANGE_MERGED',
    triggerLabel: 'Code Change Merged',
    actions: [
      { type: 'NOTIFY_SLACK', label: 'Notify Slack', config: { channel: '#engineering' } },
      {
        type: 'RUN_AGENT_TASK',
        label: 'Run Agent Task',
        config: { prompt: 'Summarize merged changes and update CHANGELOG if needed.' },
      },
    ],
  },
];

export class AutomationService {
  async ensureSeedForTenant(tenantId: string): Promise<void> {
    const count = await Automation.countDocuments({ tenantId });
    if (count > 0) return;

    for (const item of DEMO_SEED) {
      const status = item.status ?? statusFromEnabled(Boolean(item.enabled));
      await Automation.create({
        tenantId,
        ...item,
        status,
        enabled: enabledFromStatus(status),
        runCount: item.enabled ? Math.floor(Math.random() * 200) + 10 : 0,
      });
    }
    logger.info(`Seeded ${DEMO_SEED.length} automations for tenant ${tenantId}`);
  }

  async getAutomations(tenantId: string, limit = 50, offset = 0): Promise<IAutomation[]> {
    await this.ensureSeedForTenant(tenantId);
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const safeOffset = Math.max(offset, 0);
    return Automation.find({ tenantId }).sort({ createdAt: -1 }).skip(safeOffset).limit(safeLimit);
  }

  async getAutomationById(id: string, tenantId: string): Promise<IAutomation | null> {
    return Automation.findOne({ _id: id, tenantId });
  }

  async getAutomationsByTrigger(tenantId: string, triggerType: AutomationTriggerType): Promise<IAutomation[]> {
    return Automation.find(liveAutomationFilter({ tenantId, triggerType }));
  }

  async getAutomationRuns(
    tenantId: string,
    limit = 20,
    automationId?: string,
  ): Promise<IAutomationRun[]> {
    const filter: { tenantId: string; automationId?: string } = { tenantId };
    if (automationId) filter.automationId = automationId;
    return AutomationRun.find(filter).sort({ triggeredAt: -1 }).limit(limit);
  }

  async getAutomationRunById(id: string, tenantId: string): Promise<IAutomationRun | null> {
    return AutomationRun.findOne({ _id: id, tenantId });
  }

  async createAutomation(input: CreateAutomationInput): Promise<IAutomation> {
    const synced = applyFlowDefinitionSync(input);
    const status = synced.status ?? statusFromEnabled(Boolean(synced.enabled ?? false));
    const enabled = enabledFromStatus(status);
    const automation = await Automation.create({
      ...synced,
      tenantId: input.tenantId,
      status,
      enabled,
      runCount: 0,
    });
    logger.info(`Automation created: ${automation.name} (${automation.tenantId})`);
    return automation;
  }

  async updateAutomation(id: string, tenantId: string, input: UpdateAutomationInput): Promise<IAutomation | null> {
    const existing = await this.getAutomationById(id, tenantId);
    if (!existing) return null;
    if (resolveAutomationStatus(existing) === 'archived') return existing;

    const synced = applyFlowDefinitionSync({
      ...input,
      status:
        input.status ??
        (input.enabled != null ? statusFromEnabled(input.enabled, resolveAutomationStatus(existing)) : undefined),
    });

    const $set: Record<string, unknown> = { ...synced };
    if (synced.status) {
      $set.enabled = enabledFromStatus(synced.status);
      if (synced.status === 'live' && !existing.publishedAt) {
        $set.publishedAt = new Date();
      }
    } else if (synced.enabled != null) {
      const nextStatus = statusFromEnabled(Boolean(synced.enabled), resolveAutomationStatus(existing));
      $set.status = nextStatus;
      $set.enabled = enabledFromStatus(nextStatus);
      if (nextStatus === 'live' && !existing.publishedAt) {
        $set.publishedAt = new Date();
      }
    }

    return Automation.findOneAndUpdate({ _id: id, tenantId }, { $set }, { new: true });
  }

  async toggleAutomation(id: string, tenantId: string, enabled: boolean): Promise<IAutomation | null> {
    return enabled ? this.publishAutomation(id, tenantId) : this.pauseAutomation(id, tenantId);
  }

  /** TODO §12 PublishWorkflow — set live + enabled; stamp publishedAt once. */
  async publishAutomation(id: string, tenantId: string): Promise<IAutomation | null> {
    const existing = await this.getAutomationById(id, tenantId);
    if (!existing) return null;
    if (resolveAutomationStatus(existing) === 'archived') return null;

    const publishErrors = collectAutomationPublishErrors(existing);
    if (publishErrors.length > 0) {
      throw new AutomationPublishError(publishErrors);
    }

    const $set: Record<string, unknown> = {
      status: 'live',
      enabled: true,
      flowDefinition: patchFlowMetaEnabled(existing.flowDefinition, true),
    };
    if (!existing.publishedAt) $set.publishedAt = new Date();

    return Automation.findOneAndUpdate({ _id: id, tenantId }, { $set }, { new: true });
  }

  /** TODO §12 PauseWorkflow */
  async pauseAutomation(id: string, tenantId: string): Promise<IAutomation | null> {
    const existing = await this.getAutomationById(id, tenantId);
    if (!existing) return null;
    if (resolveAutomationStatus(existing) === 'archived') return null;

    return Automation.findOneAndUpdate(
      { _id: id, tenantId },
      {
        $set: {
          status: 'paused',
          enabled: false,
          flowDefinition: patchFlowMetaEnabled(existing.flowDefinition, false),
        },
      },
      { new: true },
    );
  }

  /** TODO §12 ArchiveWorkflow — soft archive (keeps row; stops runs). */
  async archiveAutomation(id: string, tenantId: string): Promise<IAutomation | null> {
    const existing = await this.getAutomationById(id, tenantId);
    if (!existing) return null;

    return Automation.findOneAndUpdate(
      { _id: id, tenantId },
      {
        $set: {
          status: 'archived',
          enabled: false,
          archivedAt: existing.archivedAt ?? new Date(),
          flowDefinition: patchFlowMetaEnabled(existing.flowDefinition, false),
        },
      },
      { new: true },
    );
  }

  async deleteAutomation(id: string, tenantId: string): Promise<boolean> {
    const result = await Automation.findOneAndDelete({ _id: id, tenantId });
    return Boolean(result);
  }

  /**
   * TODO §12 `DuplicateWorkflow` — clone config into a new disabled automation.
   * Does not copy run history. Preserves tenantId from the source row.
   */
  async duplicateAutomation(id: string, tenantId: string, name?: string): Promise<IAutomation | null> {
    const source = await this.getAutomationById(id, tenantId);
    if (!source) return null;

    const copyName = (name?.trim() || `${source.name} (copy)`).slice(0, 200);
    const flowDefinition = source.flowDefinition
      ? (JSON.parse(JSON.stringify(source.flowDefinition)) as Record<string, unknown>)
      : undefined;

    if (flowDefinition && typeof flowDefinition === 'object' && flowDefinition.meta && typeof flowDefinition.meta === 'object') {
      const meta = flowDefinition.meta as Record<string, unknown>;
      meta.name = copyName;
      meta.enabled = false;
    }

    return this.createAutomation({
      tenantId,
      name: copyName,
      triggerType: source.triggerType,
      triggerLabel: source.triggerLabel,
      actions: source.actions.map((a) => ({
        type: a.type,
        label: a.label,
        config: a.config ? ({ ...a.config } as Record<string, unknown>) : undefined,
      })),
      enabled: false,
      status: 'draft',
      flowDefinition,
    });
  }

  /**
   * Test-run: create a run with sample payload without a live trigger event.
   * Works for draft/paused/live; blocked for archived.
   */
  async testAutomation(
    automationId: string,
    tenantId: string,
    testData: Record<string, unknown> = {},
  ): Promise<IAutomationRun> {
    return runAutomationTest({ automationId, tenantId, testData });
  }

  async executeAutomation(
    automationId: string,
    tenantId: string,
    payload: Record<string, unknown> = {},
  ): Promise<IAutomationRun | null> {
    const automation = await this.getAutomationById(automationId, tenantId);
    if (!automation || resolveAutomationStatus(automation) !== 'live' || !automation.enabled) return null;

    const started = Date.now();
    const run = await AutomationRun.create({
      automationId: String(automation._id),
      automationName: automation.name,
      tenantId,
      triggerType: automation.triggerType,
      status: 'running',
      durationMs: 0,
      payload,
      triggeredAt: new Date(),
    });

    try {
      await this.executeAutomationActions(automation, payload);
      const durationMs = Date.now() - started;
      await AutomationRun.updateOne({ _id: run._id }, { status: 'success', durationMs });
      await Automation.updateOne({ _id: automation._id }, { $inc: { runCount: 1 }, $set: { lastRunAt: new Date() } });
      return AutomationRun.findById(run._id);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      const durationMs = Date.now() - started;
      await AutomationRun.updateOne({ _id: run._id }, { status: 'error', durationMs, error: message });
      await Automation.updateOne({ _id: automation._id }, { $inc: { runCount: 1 }, $set: { lastRunAt: new Date() } });
      logger.error(`Automation run failed for "${automation.name}": ${message}`);
      return AutomationRun.findById(run._id);
    }
  }

  private async executeAutomationActions(automation: IAutomation, _payload: Record<string, unknown>): Promise<void> {
    for (const action of automation.actions) {
      logger.info(
        `[automation] ${action.type} for "${automation.name}" (tenant=${automation.tenantId})`,
        action.config ?? {},
      );
    }
  }

  async triggerAutomations(
    tenantId: string,
    triggerType: AutomationTriggerType,
    payload: Record<string, unknown> = {},
    source: 'system' | 'lms' | 'commerce' | 'agent' | 'webhook' = 'system',
  ): Promise<number> {
    const automations = await this.getAutomationsByTrigger(tenantId, triggerType);
    if (automations.length === 0) return 0;
    return emitAutomationEvent({ tenantId, triggerType, payload, source });
  }

  toGraphQL(automation: IAutomation) {
    const status = resolveAutomationStatus(automation);
    return {
      id: String(automation._id),
      tenantId: automation.tenantId,
      name: automation.name,
      enabled: automation.enabled,
      status,
      publishedAt: automation.publishedAt ?? null,
      archivedAt: automation.archivedAt ?? null,
      triggerType: automation.triggerType,
      triggerLabel: automation.triggerLabel,
      actions: automation.actions.map((a: IAutomationAction) => ({
        type: a.type,
        label: a.label,
        config: a.config ?? null,
      })),
      flowDefinition: automation.flowDefinition ?? null,
      runCount: automation.runCount,
      lastRunAt: automation.lastRunAt ?? null,
      createdAt: automation.createdAt,
      updatedAt: automation.updatedAt,
    };
  }

  runToGraphQL(run: IAutomationRun) {
    const startedAt = run.triggeredAt;
    const completedAt =
      run.status === 'running' || !startedAt
        ? null
        : new Date(new Date(startedAt).getTime() + (run.durationMs || 0));
    return {
      id: String(run._id),
      automationId: run.automationId,
      automationName: run.automationName,
      tenantId: run.tenantId,
      triggerType: run.triggerType,
      status: run.status,
      durationMs: run.durationMs,
      error: run.error ?? null,
      startedAt,
      triggeredAt: startedAt,
      completedAt,
    };
  }
}

export const automationService = new AutomationService();
