import { gql } from '@apollo/client';

export const COUPON_FIELDS = gql`
  fragment CouponFields on Coupon {
    id
    tenantId
    code
    discountType
    discountValue
    appliesTo
    minPurchaseCents
    minQuantity
    usageLimit
    oneUsePerCustomer
    redemptionCount
    startsAt
    endsAt
    status
    createdAt
    updatedAt
  }
`;

export const GET_COUPONS = gql`
  query GetCoupons($tenantId: String!, $status: CouponStatus, $discountType: CouponDiscountType, $search: String) {
    coupons(tenantId: $tenantId, status: $status, discountType: $discountType, search: $search) {
      ...CouponFields
    }
  }
  ${COUPON_FIELDS}
`;

export const GET_COUPON = gql`
  query GetCoupon($id: ID!, $tenantId: String!) {
    coupon(id: $id, tenantId: $tenantId) {
      ...CouponFields
    }
  }
  ${COUPON_FIELDS}
`;

export const CREATE_COUPON = gql`
  mutation CreateCoupon($input: CreateCouponInput!) {
    createCoupon(input: $input) {
      ...CouponFields
    }
  }
  ${COUPON_FIELDS}
`;

export const UPDATE_COUPON = gql`
  mutation UpdateCoupon($id: ID!, $tenantId: String!, $input: UpdateCouponInput!) {
    updateCoupon(id: $id, tenantId: $tenantId, input: $input) {
      ...CouponFields
    }
  }
  ${COUPON_FIELDS}
`;

export const DELETE_COUPON = gql`
  mutation DeleteCoupon($id: ID!, $tenantId: String!) {
    deleteCoupon(id: $id, tenantId: $tenantId)
  }
`;
