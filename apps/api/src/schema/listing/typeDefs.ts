export const listingTypeDefs = `
  enum ApplicationStatus {
    DRAFT
    SUBMITTED
    NEED_MORE_INFORMATION
    APPROVED
    REJECTED
    AWAITING_PAYMENT
    PUBLISHED
    EXPIRED
  }

  enum PublicationStatus {
    UNPUBLISHED
    PUBLISHED
    EXPIRED
  }

  type StatusHistoryEntry {
    status: ApplicationStatus!
    at: Date!
    by: String
    note: String
  }

  type BusinessListing {
    id: ID!
    tenantId: String!
    applicantEmail: String!
    applicantName: String
    businessName: String!
    slug: String!
    description: String
    category: String
    website: String
    phone: String
    address: String
    applicationStatus: ApplicationStatus!
    publicationStatus: PublicationStatus!
    reviewerNotes: String
    subscriptionActive: Boolean!
    publishedAt: Date
    expiredAt: Date
    submittedAt: Date
    approvedAt: Date
    paymentCompletedAt: Date
    statusHistory: [StatusHistoryEntry!]!
    createdAt: Date!
    updatedAt: Date!
  }

  type EmailNotification {
    id: ID!
    template: String!
    subject: String!
    status: String!
    sentAt: Date!
  }

  type ListingCheckoutSession {
    url: String!
    sessionId: String!
  }

  type ReminderJobResult {
    sent: Int!
  }

  input CreateListingInput {
    tenantId: String!
    applicantEmail: String!
    applicantName: String
    businessName: String!
    description: String
    category: String
    website: String
    phone: String
    address: String
  }

  input UpdateListingInput {
    businessName: String
    description: String
    category: String
    website: String
    phone: String
    address: String
    applicantName: String
  }

  extend type Query {
    publishedListings(tenantId: String!): [BusinessListing!]!
    publishedListing(tenantId: String!, slug: String!): BusinessListing
    listing(id: ID!): BusinessListing
    myListings(tenantId: String!, email: String!): [BusinessListing!]!
    listingsForReview(tenantId: String!, status: ApplicationStatus): [BusinessListing!]!
    listingNotifications(listingId: ID!, limit: Int): [EmailNotification!]!
  }

  extend type Mutation {
    createListingDraft(input: CreateListingInput!): BusinessListing!
    updateListingDraft(id: ID!, input: UpdateListingInput!): BusinessListing
    submitListingApplication(id: ID!): BusinessListing
    requestListingInformation(id: ID!, notes: String!): BusinessListing
    approveListing(id: ID!): BusinessListing
    rejectListing(id: ID!, notes: String!): BusinessListing
    createListingCheckoutSession(
      listingId: ID!
      successUrl: String!
      cancelUrl: String!
    ): ListingCheckoutSession!
    processListingReminders(tenantId: String): ReminderJobResult!
  }
`;
