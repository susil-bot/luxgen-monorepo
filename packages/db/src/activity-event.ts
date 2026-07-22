import { Schema, model, Document, Types } from 'mongoose';

/** Shopify-style resource attachment — maps to LuxGen admin surfaces */
export enum ActivitySubjectType {
  PRODUCT = 'PRODUCT',
  ORDER = 'ORDER',
  CUSTOMER = 'CUSTOMER',
}

export enum ActivityEventKind {
  SYSTEM = 'SYSTEM',
  STAFF_COMMENT = 'STAFF_COMMENT',
  APP = 'APP',
  FIELD_CHANGE = 'FIELD_CHANGE',
}

export enum ActivityActorType {
  SYSTEM = 'SYSTEM',
  STAFF = 'STAFF',
  APP = 'APP',
}

export interface IActivityEvent extends Document {
  tenant: Types.ObjectId;
  subjectType: ActivitySubjectType;
  /** courseId | courseId:studentId | userId */
  subjectId: string;
  kind: ActivityEventKind;
  eventType: string;
  message: string;
  actorType: ActivityActorType;
  actorId?: Types.ObjectId;
  actorName?: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  metadata?: Record<string, unknown>;
  /** Shopify-style critical alert — surfaces prominently in admin timeline */
  criticalAlert?: boolean;
  createdAt: Date;
}

const activityEventSchema = new Schema<IActivityEvent>(
  {
    tenant: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    subjectType: {
      type: String,
      enum: Object.values(ActivitySubjectType),
      required: true,
    },
    subjectId: { type: String, required: true, index: true },
    kind: {
      type: String,
      enum: Object.values(ActivityEventKind),
      required: true,
    },
    eventType: { type: String, required: true, index: true },
    message: { type: String, required: true },
    actorType: {
      type: String,
      enum: Object.values(ActivityActorType),
      required: true,
      default: ActivityActorType.SYSTEM,
    },
    actorId: { type: Schema.Types.ObjectId, ref: 'User' },
    actorName: { type: String },
    field: { type: String },
    oldValue: { type: String },
    newValue: { type: String },
    metadata: { type: Schema.Types.Mixed, default: {} },
    criticalAlert: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

activityEventSchema.index({ tenant: 1, subjectType: 1, subjectId: 1, createdAt: -1 });

export const ActivityEvent = model<IActivityEvent>('ActivityEvent', activityEventSchema);
