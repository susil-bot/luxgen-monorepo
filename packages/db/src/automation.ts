import { Schema, model, Document } from 'mongoose';

export type AutomationTriggerType =
  | 'COURSE_COMPLETED'
  | 'USER_ENROLLED'
  | 'GROUP_JOINED'
  | 'CERTIFICATE_ISSUED'
  | 'CERTIFICATE_EXPIRING_SOON'
  | 'SCHEDULE'
  | 'WEBHOOK'
  | 'ORDER_CREATED'
  | 'ORDER_DRAFTED'
  | 'ORDER_UPDATED'
  | 'PAYMENT_SENT'
  | 'CODE_CHANGE_STAGED'
  | 'CODE_CHANGE_COMMITTED'
  | 'CODE_CHANGE_MERGED'
  | 'CODE_CHANGE_FAILED';

export type AutomationActionType =
  | 'SEND_EMAIL'
  | 'ADD_TO_GROUP'
  | 'REMOVE_FROM_GROUP'
  | 'ENROLL_IN_COURSE'
  | 'ISSUE_CERTIFICATE'
  | 'CALL_WEBHOOK'
  | 'NOTIFY_SLACK'
  | 'TAG_USER'
  | 'RUN_AGENT_TASK'
  | 'UPDATE_ORDER_FIELDS';

export interface IAutomationAction {
  type: AutomationActionType;
  label: string;
  config?: Record<string, unknown>;
}

export interface IAutomation extends Document {
  /** Tenant isolation — TODO §11 `organizationId` */
  tenantId: string;
  name: string;
  /**
   * Lifecycle stand-in for TODO `WorkflowStatus` (DRAFT/LIVE/PAUSED/ARCHIVED).
   * `false` ≈ draft/paused; `true` ≈ live. Archive = delete (no soft status yet).
   */
  enabled: boolean;
  /** Flat trigger — mirrored from `flowDefinition` entry node via `flowToLegacyAutomation` */
  triggerType: AutomationTriggerType;
  triggerLabel: string;
  /** Flat actions — mirrored from action nodes; prefer graph at runtime when flow valid */
  actions: IAutomationAction[];
  /**
   * Canonical Tower graph (`TowerFlowDocument` v1 from `@luxgen/automation-flow`).
   * Maps TODO `Workflow.trigger` + `Workflow.steps` (see docs/todo-orchestrator/audits/automation-model-map.md).
   */
  flowDefinition?: Record<string, unknown>;
  /** TODO `totalRuns` (success/fail split not stored — see AutomationRun) */
  runCount: number;
  lastRunAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type AutomationRunStatus = 'success' | 'error' | 'running';

export interface IAutomationRun extends Document {
  automationId: string;
  automationName: string;
  tenantId: string;
  triggerType: AutomationTriggerType;
  status: AutomationRunStatus;
  durationMs: number;
  error?: string;
  payload?: Record<string, unknown>;
  triggeredAt: Date;
}

const automationActionSchema = new Schema<IAutomationAction>(
  {
    type: {
      type: String,
      enum: [
        'SEND_EMAIL',
        'ADD_TO_GROUP',
        'REMOVE_FROM_GROUP',
        'ENROLL_IN_COURSE',
        'ISSUE_CERTIFICATE',
        'CALL_WEBHOOK',
        'NOTIFY_SLACK',
        'TAG_USER',
        'RUN_AGENT_TASK',
        'UPDATE_ORDER_FIELDS',
      ],
      required: true,
    },
    label: { type: String, required: true },
    config: { type: Schema.Types.Mixed },
  },
  { _id: false },
);

const automationSchema = new Schema<IAutomation>(
  {
    tenantId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    enabled: { type: Boolean, default: false },
    triggerType: {
      type: String,
      enum: [
        'COURSE_COMPLETED',
        'USER_ENROLLED',
        'GROUP_JOINED',
        'CERTIFICATE_ISSUED',
        'CERTIFICATE_EXPIRING_SOON',
        'SCHEDULE',
        'WEBHOOK',
        'ORDER_CREATED',
        'ORDER_DRAFTED',
        'ORDER_UPDATED',
        'PAYMENT_SENT',
        'CODE_CHANGE_STAGED',
        'CODE_CHANGE_COMMITTED',
        'CODE_CHANGE_MERGED',
        'CODE_CHANGE_FAILED',
      ],
      required: true,
    },
    triggerLabel: { type: String, required: true },
    actions: { type: [automationActionSchema], default: [] },
    flowDefinition: { type: Schema.Types.Mixed },
    runCount: { type: Number, default: 0 },
    lastRunAt: { type: Date },
  },
  { timestamps: true },
);

automationSchema.index({ tenantId: 1, enabled: 1, triggerType: 1 });

const automationRunSchema = new Schema<IAutomationRun>(
  {
    automationId: { type: String, required: true, index: true },
    automationName: { type: String, required: true },
    tenantId: { type: String, required: true, index: true },
    triggerType: { type: String, required: true },
    status: { type: String, enum: ['success', 'error', 'running'], default: 'running' },
    durationMs: { type: Number, default: 0 },
    error: { type: String },
    payload: { type: Schema.Types.Mixed },
    triggeredAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

automationRunSchema.index({ tenantId: 1, triggeredAt: -1 });

export const Automation = model<IAutomation>('Automation', automationSchema);
export const AutomationRun = model<IAutomationRun>('AutomationRun', automationRunSchema);
