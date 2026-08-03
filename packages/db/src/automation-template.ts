import { Schema, model, Document } from 'mongoose';
import type { AutomationActionType, AutomationTriggerType, IAutomationAction } from './automation';

export type TemplateCategory = 'onboarding' | 'completion' | 'engagement' | 'retention' | 'agent_ops' | 'integrations';

export interface IAutomationTemplate extends Document {
  slug: string;
  name: string;
  description: string;
  category: TemplateCategory;
  priceCents: number;
  featured: boolean;
  triggerType: AutomationTriggerType;
  triggerLabel: string;
  actions: IAutomationAction[];
  /** Full Tower flow graph (trigger/condition/action/wait) — takes priority over `actions` when present. */
  flowDefinition?: Record<string, unknown>;
  installCount: number;
  tags: string[];
  /** Industry tags for Marketplace/Template Library filtering (e.g. 'ecommerce', 'compliance-training'). */
  industry: string[];
  createdAt: Date;
  updatedAt: Date;
}

const templateActionSchema = new Schema<IAutomationAction>(
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
      ],
      required: true,
    },
    label: { type: String, required: true },
    config: { type: Schema.Types.Mixed },
  },
  { _id: false },
);

const automationTemplateSchema = new Schema<IAutomationTemplate>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['onboarding', 'completion', 'engagement', 'retention', 'agent_ops', 'integrations'],
      required: true,
    },
    priceCents: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    triggerType: { type: String, required: true },
    triggerLabel: { type: String, required: true },
    actions: { type: [templateActionSchema], default: [] },
    flowDefinition: { type: Schema.Types.Mixed },
    installCount: { type: Number, default: 0 },
    tags: { type: [String], default: [] },
    industry: { type: [String], default: [] },
  },
  { timestamps: true },
);

automationTemplateSchema.index({ category: 1, featured: -1 });
automationTemplateSchema.index({ industry: 1 });

export const AutomationTemplate = model<IAutomationTemplate>('AutomationTemplate', automationTemplateSchema);

export type { AutomationActionType, AutomationTriggerType };
