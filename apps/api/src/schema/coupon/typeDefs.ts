export const couponTypeDefs = `
  enum CouponDiscountType {
    PERCENTAGE
    FIXED_AMOUNT
    FREE_SHIPPING
    BUY_X_GET_Y
  }

  enum CouponAppliesTo {
    ALL
    PRODUCTS
    COLLECTIONS
  }

  enum CouponStatus {
    ACTIVE
    INACTIVE
    EXPIRED
  }

  type Coupon {
    id: ID!
    tenantId: String!
    code: String!
    discountType: CouponDiscountType!
    discountValue: Float!
    appliesTo: CouponAppliesTo!
    minPurchaseCents: Int
    minQuantity: Int
    usageLimit: Int
    oneUsePerCustomer: Boolean!
    redemptionCount: Int!
    startsAt: Date
    endsAt: Date
    status: CouponStatus!
    createdAt: Date!
    updatedAt: Date!
  }

  input CreateCouponInput {
    tenantId: String!
    code: String!
    discountType: CouponDiscountType!
    discountValue: Float!
    appliesTo: CouponAppliesTo
    minPurchaseCents: Int
    minQuantity: Int
    usageLimit: Int
    oneUsePerCustomer: Boolean
    startsAt: Date
    endsAt: Date
    status: CouponStatus
  }

  input UpdateCouponInput {
    code: String
    discountType: CouponDiscountType
    discountValue: Float
    appliesTo: CouponAppliesTo
    minPurchaseCents: Int
    minQuantity: Int
    usageLimit: Int
    oneUsePerCustomer: Boolean
    startsAt: Date
    endsAt: Date
    status: CouponStatus
  }

  extend type Query {
    coupons(
      tenantId: String!
      status: CouponStatus
      discountType: CouponDiscountType
      search: String
    ): [Coupon!]!
    coupon(id: ID!, tenantId: String!): Coupon
  }

  extend type Mutation {
    createCoupon(input: CreateCouponInput!): Coupon!
    updateCoupon(id: ID!, tenantId: String!, input: UpdateCouponInput!): Coupon
    deleteCoupon(id: ID!, tenantId: String!): Boolean!
  }
`;
