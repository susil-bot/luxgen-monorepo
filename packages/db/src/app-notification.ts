import { Schema, model, Document } from 'mongoose';

export type AppNotificationCategory =
  | 'task_reminder'
  | 'task_assigned'
  | 'task_due_soon'
  | 'task_overdue'
  | 'automation'
  | 'system';

export const APP_NOTIFICATION_CATEGORIES: AppNotificationCategory[] = [
  'task_reminder',
  'task_assigned',
  'task_due_soon',
  'task_overdue',
  'automation',
  'system',
];

export interface IAppNotification extends Document {
  tenantId: string;
  userId: string;
  category: AppNotificationCategory;
  title: string;
  body: string;
  taskId?: string | null;
  reminderId?: string | null;
  readAt?: Date | null;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const appNotificationSchema = new Schema<IAppNotification>(
  {
    tenantId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    category: { type: String, enum: APP_NOTIFICATION_CATEGORIES, required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    taskId: { type: String, default: null, index: true },
    reminderId: { type: String, default: null },
    readAt: { type: Date, default: null },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

appNotificationSchema.index({ tenantId: 1, userId: 1, createdAt: -1 });
appNotificationSchema.index({ tenantId: 1, userId: 1, readAt: 1 });

export const AppNotification = model<IAppNotification>('AppNotification', appNotificationSchema);
