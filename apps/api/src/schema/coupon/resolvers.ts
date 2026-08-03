import type { CouponAppliesTo, CouponDiscountType, CouponStatus } from '@luxgen/db';
import { GraphQLError } from 'graphql';
import type { GraphQLContext } from '../../context';
import { scopedTenantId as resolveScopedTenantId } from '../../graphql/tenantScope';
import { couponService, type CreateCouponInput, type UpdateCouponInput } from '../../services/couponService';

function parseOptionalDate(value: unknown): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  const d = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(d.getTime())) {
    throw new GraphQLError('Invalid date', { extensions: { code: 'BAD_USER_INPUT' } });
  }
  return d;
}

export const couponResolvers = {
  Query: {
    coupons: async (
      _: unknown,
      {
        tenantId,
        status,
        discountType,
        search,
      }: {
        tenantId: string;
        status?: CouponStatus;
        discountType?: CouponDiscountType;
        search?: string;
      },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.tenantId && !tenantId) throw new GraphQLError('Tenant context required');
      const scopedId = resolveScopedTenantId(ctx, tenantId);
      const items = await couponService.listByTenant(scopedId, { status, discountType, search });
      return items.map((c) => couponService.toGraphQL(c));
    },
    coupon: async (_: unknown, { id, tenantId }: { id: string; tenantId: string }, ctx: GraphQLContext) => {
      const scopedId = resolveScopedTenantId(ctx, tenantId);
      const item = await couponService.getById(id, scopedId);
      return item ? couponService.toGraphQL(item) : null;
    },
  },
  Mutation: {
    createCoupon: async (_: unknown, { input }: { input: CreateCouponInput }, ctx: GraphQLContext) => {
      const scopedId = resolveScopedTenantId(ctx, input.tenantId);
      const created = await couponService.create({
        ...input,
        tenantId: scopedId,
        startsAt: parseOptionalDate(input.startsAt) ?? null,
        endsAt: parseOptionalDate(input.endsAt) ?? null,
        appliesTo: (input.appliesTo as CouponAppliesTo | undefined) ?? 'ALL',
      });
      return couponService.toGraphQL(created);
    },
    updateCoupon: async (
      _: unknown,
      { id, tenantId, input }: { id: string; tenantId: string; input: UpdateCouponInput },
      ctx: GraphQLContext,
    ) => {
      const scopedId = resolveScopedTenantId(ctx, tenantId);
      const patch: UpdateCouponInput = {
        ...input,
        startsAt: parseOptionalDate(input.startsAt),
        endsAt: parseOptionalDate(input.endsAt),
      };
      const updated = await couponService.update(id, scopedId, patch);
      return updated ? couponService.toGraphQL(updated) : null;
    },
    deleteCoupon: async (_: unknown, { id, tenantId }: { id: string; tenantId: string }, ctx: GraphQLContext) => {
      const scopedId = resolveScopedTenantId(ctx, tenantId);
      return couponService.delete(id, scopedId);
    },
  },
};
