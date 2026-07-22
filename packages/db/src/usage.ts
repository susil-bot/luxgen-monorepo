import { Schema, model, Document } from 'mongoose';

export interface ITenantUsageMonthly extends Document {
  tenantId: string;
  period: string;
  automationRuns: number;
  activeLearners: number;
  agentTasks: number;
  overageReportedAt?: Date;
  updatedAt: Date;
  createdAt: Date;
}

const tenantUsageMonthlySchema = new Schema<ITenantUsageMonthly>(
  {
    tenantId: { type: String, required: true, index: true },
    period: { type: String, required: true, index: true },
    automationRuns: { type: Number, default: 0 },
    activeLearners: { type: Number, default: 0 },
    agentTasks: { type: Number, default: 0 },
    overageReportedAt: Date,
  },
  { timestamps: true },
);

tenantUsageMonthlySchema.index({ tenantId: 1, period: 1 }, { unique: true });

export const TenantUsageMonthly = model<ITenantUsageMonthly>('TenantUsageMonthly', tenantUsageMonthlySchema);

export function currentUsagePeriod(): string {
  return new Date().toISOString().slice(0, 7);
}
