import { Schema, model, Document, Types } from 'mongoose';
export interface ICustomRolePermissions {
  canManageUsers: boolean;
  canManageCourses: boolean;
  canManageGroups: boolean;
  canViewReports: boolean;
  canManageSettings: boolean;
}
export interface ICustomRole extends Document {
  tenant: Types.ObjectId;
  name: string;
  description?: string;
  permissions: ICustomRolePermissions;
  createdAt: Date;
  updatedAt: Date;
}
const customRoleSchema = new Schema<ICustomRole>(
  {
    tenant: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    permissions: {
      canManageUsers: { type: Boolean, default: false },
      canManageCourses: { type: Boolean, default: false },
      canManageGroups: { type: Boolean, default: false },
      canViewReports: { type: Boolean, default: false },
      canManageSettings: { type: Boolean, default: false },
    },
  },
  { timestamps: true },
);
customRoleSchema.index({ tenant: 1, name: 1 }, { unique: true });
export const CustomRole = model<ICustomRole>('CustomRole', customRoleSchema);
