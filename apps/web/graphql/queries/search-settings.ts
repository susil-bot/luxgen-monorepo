import { gql } from '@apollo/client';

/**
 * T-SRCH-12 — search settings. Backend half (schema/resolver/service/model) is a paired,
 * separately-tracked apps/api change. Until that lands this errors gracefully (errorPolicy
 * 'all') and the settings page falls back to sensible defaults rather than blocking the page.
 */
export const GET_SEARCH_SETTINGS = gql`
  query GetSearchSettings($tenantId: ID!) {
    searchSettings(tenantId: $tenantId) {
      resultsPerPage
      trackSearchHistory
    }
  }
`;

export const UPDATE_SEARCH_SETTINGS = gql`
  mutation UpdateSearchSettings($tenantId: ID!, $resultsPerPage: Int!, $trackSearchHistory: Boolean!) {
    updateSearchSettings(tenantId: $tenantId, resultsPerPage: $resultsPerPage, trackSearchHistory: $trackSearchHistory) {
      resultsPerPage
      trackSearchHistory
    }
  }
`;
