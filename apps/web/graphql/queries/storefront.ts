import { gql } from '@apollo/client';

export const GET_STOREFRONT_PRODUCTS = gql`
  query GetStorefrontProducts($tenantId: ID!, $category: String) {
    storefrontProducts(tenantId: $tenantId, category: $category) {
      id
      title
      description
      status
      category
      priceCents
      currency
      instructorName
      enrollmentCount
    }
  }
`;

export const GET_STOREFRONT_PRODUCT = gql`
  query GetStorefrontProduct($id: ID!) {
    storefrontProduct(id: $id) {
      id
      title
      description
      status
      category
      priceCents
      currency
      instructorName
      enrollmentCount
      tenantId
    }
  }
`;

export const GET_STOREFRONT_COLLECTIONS = gql`
  query GetStorefrontCollections($tenantId: ID!) {
    storefrontCollections(tenantId: $tenantId) {
      id
      name
      description
      color
      icon
      memberCount
    }
  }
`;

export const GET_STOREFRONT_COLLECTION = gql`
  query GetStorefrontCollection($id: ID!, $tenantId: ID!) {
    storefrontCollection(id: $id, tenantId: $tenantId) {
      id
      name
      description
      color
      icon
      memberCount
    }
  }
`;

export const GET_STOREFRONT_BUNDLES = gql`
  query GetStorefrontBundles($tenantId: ID!) {
    storefrontBundles(tenantId: $tenantId) {
      id
      title
      description
      slug
      courseIds
      priceCents
      currency
      billingInterval
      status
    }
  }
`;

export const GET_STOREFRONT_BUNDLE = gql`
  query GetStorefrontBundle($id: ID!, $tenantId: ID!) {
    storefrontBundle(id: $id, tenantId: $tenantId) {
      id
      title
      description
      slug
      courseIds
      priceCents
      currency
      billingInterval
      status
    }
  }
`;

export const GET_LEARNER_SUBSCRIPTIONS = gql`
  query GetLearnerSubscriptions($tenantId: ID!) {
    learnerSubscriptions(tenantId: $tenantId) {
      id
      status
      currentPeriodEnd
      bundle {
        id
        title
        billingInterval
        priceCents
        currency
      }
    }
  }
`;

export const SUBSCRIBE_TO_BUNDLE = gql`
  mutation SubscribeToBundle($bundleId: ID!) {
    subscribeToBundle(bundleId: $bundleId) {
      subscriptionId
      alreadySubscribed
      bundleId
    }
  }
`;

export const CANCEL_LEARNER_SUBSCRIPTION = gql`
  mutation CancelLearnerSubscription($subscriptionId: ID!) {
    cancelLearnerSubscription(subscriptionId: $subscriptionId)
  }
`;
