import {
  Automation,
  AutomationRun,
  type AutomationActionType,
  type AutomationTriggerType,
  type IAutomation,
  type IAutomationAction,
  type IAutomationRun,
} from '@luxgen/db';
import { logger } from '../utils/logger';

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
}

export interface UpdateAutomationInput {
  name?: string;
  triggerType?: AutomationTriggerType;
  triggerLabel?: string;
  actions?: AutomationActionInput[];
  enabled?: boolean;
}

const DEMO_SEED: Omit<CreateAutomationInput, 'tenantId'>[] = [
  {
    name: 'Welcome new learners',
    enabled: true,
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
    triggerType: 'SCHEDULE',
    triggerLabel: 'Scheduled',
    actions: [{ type: 'SEND_EMAIL', label: 'Send Email' }],
  },
  {
    name: 'Tag power learners',
    enabled: true,
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
      await Automation.create({ tenantId, ...item, runCount: item.enabled ? Math.floor(Math.random() * 200) + 10 : 0 });
    }
    logger.info(`Seeded ${DEMO_SEED.length} automations for tenant ${tenantId}`);
  }

  async getAutomations(tenantId: string): Promise<IAutomation[]> {
    await this.ensureSeedForTenant(tenantId);
    return Automation.find({ tenantId }).sort({ createdAt: -1 });
  }

  async getAutomationById(id: string, tenantId: string): Promise<IAutomation | null> {
    return Automation.findOne({ _id: id, tenantId });
  }

  async getAutomationsByTrigger(tenantId: string, triggerType: AutomationTriggerType): Promise<IAutomation[]> {
    return Automation.find({ tenantId, enabled: true, triggerType });
  }

  async getAutomationRuns(tenantId: string, limit = 20): Promise<IAutomationRun[]> {
    return AutomationRun.find({ tenantId }).sort({ triggeredAt: -1 }).limit(limit);
  }

  async createAutomation(input: CreateAutomationInput): Promise<IAutomation> {
    const automation = await Automation.create({
      ...input,
      enabled: input.enabled ?? false,
      runCount: 0,
    });
    logger.info(`Automation created: ${automation.name} (${automation.tenantId})`);
    return automation;
  }

  async updateAutomation(id: string, tenantId: string, input: UpdateAutomationInput): Promise<IAutomation | null> {
    return Automation.findOneAndUpdate({ _id: id, tenantId }, { $set: input }, { new: true });
  }

  async toggleAutomation(id: string, tenantId: string, enabled: boolean): Promise<IAutomation | null> {
    return Automation.findOneAndUpdate({ _id: id, tenantId }, { $set: { enabled } }, { new: true });
  }

  async deleteAutomation(id: string, tenantId: string): Promise<boolean> {
    const result = await Automation.findOneAndDelete({ _id: id, tenantId });
    return Boolean(result);
  }

  toGraphQL(automation: IAutomation) {
    return {
      id: String(automation._id),
      tenantId: automation.tenantId,
      name: automation.name,
      enabled: automation.enabled,
      triggerType: automation.triggerType,
      triggerLabel: automation.triggerLabel,
      actions: automation.actions.map((a: IAutomationAction) => ({
        type: a.type,
        label: a.label,
        config: a.config ?? null,
      })),
      runCount: automation.runCount,
      lastRunAt: automation.lastRunAt ?? null,
      createdAt: automation.createdAt,
      updatedAt: automation.updatedAt,
    };
  }

  runToGraphQL(run: IAutomationRun) {
    return {
      id: String(run._id),
      automationId: run.automationId,
      automationName: run.automationName,
      tenantId: run.tenantId,
      triggerType: run.triggerType,
      status: run.status,
      durationMs: run.durationMs,
      error: run.error ?? null,
      triggeredAt: run.triggeredAt,
    };
  }
}

export const automationService = new AutomationService();
