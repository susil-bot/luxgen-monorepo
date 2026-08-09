export const searchTypeDefs = `
  """T-SRCH-12 — per-tenant search result preferences."""
  type SearchSettings {
    resultsPerPage: Int!
    trackSearchHistory: Boolean!
  }

  """T-SRCH-08 — one logged search event (fire-and-forget from the client)."""
  type SearchEvent {
    id: ID!
  }

  type SearchTopQuery {
    query: String!
    count: Int!
  }

  """T-SRCH-08 — rolling 30-day aggregate for the search analytics admin page."""
  type SearchEventSummary {
    totalSearches: Int!
    avgResultCount: Float!
    zeroResultCount: Int!
    topQueries: [SearchTopQuery!]!
  }

  extend type Query {
    searchSettings(tenantId: ID!): SearchSettings!
    searchEventSummary(tenantId: ID!): SearchEventSummary!
  }

  extend type Mutation {
    updateSearchSettings(tenantId: ID!, resultsPerPage: Int!, trackSearchHistory: Boolean!): SearchSettings!
    logSearchEvent(tenantId: ID!, query: String!, resultCount: Int!): SearchEvent!
  }
`;
