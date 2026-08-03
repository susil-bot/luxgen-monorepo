import { Schema, model, Document } from 'mongoose';

/** Discount mechanics for commerce coupons (TODO Commerce §6). */
export type CouponDiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING' | 'BUY_X_GET_Y';

export const COUPON_DISCOUNT_TYPES: CouponDiscountType[] = [
  'PERCENTAGE',
  'FIXED_AMOUNT',
  'FREE_SHIPPING',
  'BUY_X_GET_Y',
];

export type CouponAppliesTo = 'ALL' | 'PRODUCTS' | 'COLLECTIONS';

export const COUPON_APPLIES_TO: CouponAppliesTo[] = ['ALL', 'PRODUCTS', 'COLLECTIONS'];

export type CouponStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED';

export const COUPON_STATUSES: CouponStatus[] = ['ACTIVE', 'INACTIVE', 'EXPIRED'];

export interface ICoupon extends Document {
  tenantId: string;
  code: string;
  discountType: CouponDiscountType;
  /** Percent (0–100) or fixed amount in cents, depending on discountType. */
  discountValue: number;
  appliesTo: CouponAppliesTo;
  minPurchaseCents?: number | null;
  minQuantity?: number | null;
  usageLimit?: number | null;
  oneUsePerCustomer: boolean;
  redemptionCount: number;
  startsAt?: Date | null;
  endsAt?: Date | null;
  status: CouponStatus;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    tenantId: { type: String, required: true, index: true },
    code: { type: String, required: true, trim: true, uppercase: true },
    discountType: {
      type: String,
      enum: COUPON_DISCOUNT_TYPES,
      required: true,
      default: 'PERCENTAGE',
    },
    discountValue: { type: Number, required: true, min: 0, default: 0 },
    appliesTo: {
      type: String,
      enum: COUPON_APPLIES_TO,
      default: 'ALL',
    },
    minPurchaseCents: { type: Number, min: 0, default: null },
    minQuantity: { type: Number, min: 0, default: null },
    usageLimit: { type: Number, min: 1, default: null },
    oneUsePerCustomer: { type: Boolean, default: false },
    redemptionCount: { type: Number, min: 0, default: 0 },
    startsAt: { type: Date, default: null },
    endsAt: { type: Date, default: null },
    status: {
      type: String,
      enum: COUPON_STATUSES,
      default: 'ACTIVE',
      index: true,
    },
  },
  { timestamps: true },
);

couponSchema.index({ tenantId: 1, code: 1 }, { unique: true });

export const Coupon = model<ICoupon>('Coupon', couponSchema);
