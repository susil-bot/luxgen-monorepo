import {
  Coupon,
  type CouponAppliesTo,
  type CouponDiscountType,
  type CouponStatus,
  type ICoupon,
} from '@luxgen/db';
import { GraphQLError } from 'graphql';

export interface CreateCouponInput {
  tenantId: string;
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  appliesTo?: CouponAppliesTo;
  minPurchaseCents?: number | null;
  minQuantity?: number | null;
  usageLimit?: number | null;
  oneUsePerCustomer?: boolean;
  startsAt?: Date | null;
  endsAt?: Date | null;
  status?: CouponStatus;
}

export interface UpdateCouponInput {
  code?: string;
  discountType?: CouponDiscountType;
  discountValue?: number;
  appliesTo?: CouponAppliesTo;
  minPurchaseCents?: number | null;
  minQuantity?: number | null;
  usageLimit?: number | null;
  oneUsePerCustomer?: boolean;
  startsAt?: Date | null;
  endsAt?: Date | null;
  status?: CouponStatus;
}

export interface ListCouponsFilter {
  status?: CouponStatus;
  discountType?: CouponDiscountType;
  search?: string;
}

function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

function validateDiscountFields(discountType: CouponDiscountType, discountValue: number): void {
  if (!Number.isFinite(discountValue) || discountValue < 0) {
    throw new GraphQLError('Discount value must be a non-negative number', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }
  if (discountType === 'PERCENTAGE' && discountValue > 100) {
    throw new GraphQLError('Percentage discount cannot exceed 100', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }
  if (discountType === 'FREE_SHIPPING' && discountValue !== 0) {
    throw new GraphQLError('Free shipping coupons must use discount value 0', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }
}

export class CouponService {
  async listByTenant(tenantId: string, filter: ListCouponsFilter = {}): Promise<ICoupon[]> {
    const query: Record<string, unknown> = { tenantId };
    if (filter.status) query.status = filter.status;
    if (filter.discountType) query.discountType = filter.discountType;

    let items = await Coupon.find(query).sort({ createdAt: -1 });

    if (filter.search?.trim()) {
      const q = filter.search.trim().toUpperCase();
      items = items.filter((c) => c.code.includes(q));
    }

    return items;
  }

  async getById(id: string, tenantId: string): Promise<ICoupon | null> {
    return Coupon.findOne({ _id: id, tenantId });
  }

  async create(input: CreateCouponInput): Promise<ICoupon> {
    const code = normalizeCode(input.code);
    if (!code) {
      throw new GraphQLError('Coupon code is required', { extensions: { code: 'BAD_USER_INPUT' } });
    }
    validateDiscountFields(input.discountType, input.discountValue);

    try {
      return await Coupon.create({
        tenantId: input.tenantId,
        code,
        discountType: input.discountType,
        discountValue: input.discountValue,
        appliesTo: input.appliesTo ?? 'ALL',
        minPurchaseCents: input.minPurchaseCents ?? null,
        minQuantity: input.minQuantity ?? null,
        usageLimit: input.usageLimit ?? null,
        oneUsePerCustomer: input.oneUsePerCustomer ?? false,
        startsAt: input.startsAt ?? null,
        endsAt: input.endsAt ?? null,
        status: input.status ?? 'ACTIVE',
        redemptionCount: 0,
      });
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err && (err as { code?: number }).code === 11000) {
        throw new GraphQLError(`Coupon code ${code} already exists for this tenant`, {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }
      throw err;
    }
  }

  async update(id: string, tenantId: string, input: UpdateCouponInput): Promise<ICoupon | null> {
    const existing = await this.getById(id, tenantId);
    if (!existing) return null;

    const $set: Record<string, unknown> = {};
    if (input.code !== undefined) $set.code = normalizeCode(input.code);
    if (input.discountType !== undefined) $set.discountType = input.discountType;
    if (input.discountValue !== undefined) $set.discountValue = input.discountValue;
    if (input.appliesTo !== undefined) $set.appliesTo = input.appliesTo;
    if (input.minPurchaseCents !== undefined) $set.minPurchaseCents = input.minPurchaseCents;
    if (input.minQuantity !== undefined) $set.minQuantity = input.minQuantity;
    if (input.usageLimit !== undefined) $set.usageLimit = input.usageLimit;
    if (input.oneUsePerCustomer !== undefined) $set.oneUsePerCustomer = input.oneUsePerCustomer;
    if (input.startsAt !== undefined) $set.startsAt = input.startsAt;
    if (input.endsAt !== undefined) $set.endsAt = input.endsAt;
    if (input.status !== undefined) $set.status = input.status;

    const nextType = (input.discountType ?? existing.discountType) as CouponDiscountType;
    const nextValue = (input.discountValue ?? existing.discountValue) as number;
    validateDiscountFields(nextType, nextValue);

    if (Object.keys($set).length === 0) return existing;

    try {
      return await Coupon.findOneAndUpdate({ _id: id, tenantId }, { $set }, { new: true });
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err && (err as { code?: number }).code === 11000) {
        throw new GraphQLError(`Coupon code already exists for this tenant`, {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }
      throw err;
    }
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    const result = await Coupon.findOneAndDelete({ _id: id, tenantId });
    return Boolean(result);
  }

  toGraphQL(coupon: ICoupon) {
    return {
      id: coupon._id.toString(),
      tenantId: coupon.tenantId,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      appliesTo: coupon.appliesTo,
      minPurchaseCents: coupon.minPurchaseCents ?? null,
      minQuantity: coupon.minQuantity ?? null,
      usageLimit: coupon.usageLimit ?? null,
      oneUsePerCustomer: coupon.oneUsePerCustomer,
      redemptionCount: coupon.redemptionCount,
      startsAt: coupon.startsAt ?? null,
      endsAt: coupon.endsAt ?? null,
      status: coupon.status,
      createdAt: coupon.createdAt,
      updatedAt: coupon.updatedAt,
    };
  }
}

export const couponService = new CouponService();
