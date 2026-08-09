import { gql } from '@apollo/client';

/**
 * T-SRCH-08 — search analytics. Backend half (schema/resolver/service/model) is a paired,
 * separately-tracked apps/api change (this task's touch splits FE/BE across two PRs). Until
 * that lands, both operations below will 404/error at the GraphQL layer — callers on the client
 * use `errorPolicy: 'all'` and treat a missing field as "no data yet", never as a hard failure.
 */
export const LOG_SEARCH_EVENT = gql`
  mutation LogSearchEvent($tenantId: ID!, $query: String!, $resultCount: Int!) {
    logSearchEvent(tenantId: $tenantId, query: $query, resultCount: $resultCount) {
      id
    }
  }
`;

export const GET_SEARCH_EVENT_SUMMARY = gql`
  query GetSearchEventSummary($tenantId: ID!) {
    searchEventSummary(tenantId: $tenantId) {
      totalSearches
      avgResultCount
      zeroResultCount
      topQueries {
        query
        count
      }
    }
  }
`;
