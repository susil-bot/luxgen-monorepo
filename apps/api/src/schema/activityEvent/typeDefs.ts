export const activityEventTypeDefs = `
  enum ActivitySubjectType {
    PRODUCT
    ORDER
    CUSTOMER
  }

  enum ActivityEventKind {
    SYSTEM
    STAFF_COMMENT
    APP
    FIELD_CHANGE
  }

  enum ActivityActorType {
    SYSTEM
    STAFF
    APP
  }

  type ActivityEvent {
    id: ID!
    subjectType: ActivitySubjectType!
    subjectId: String!
    kind: ActivityEventKind!
    eventType: String!
    message: String!
    createdAt: Date!
    actorType: ActivityActorType!
    actorName: String
    field: String
    oldValue: String
    newValue: String
    metadata: JSON
    criticalAlert: Boolean!
  }

  type ActivityEventEdge {
    node: ActivityEvent!
    cursor: String!
  }

  type ActivityEventPageInfo {
    hasNextPage: Boolean!
    endCursor: String
  }

  type ActivityEventConnection {
    edges: [ActivityEventEdge!]!
    pageInfo: ActivityEventPageInfo!
    totalCount: Int!
  }

  input ActivityCommentAttachmentInput {
    url: String!
    name: String!
    mimeType: String
  }

  input AddActivityCommentInput {
    tenantId: ID!
    subjectType: ActivitySubjectType!
    subjectId: String!
    message: String!
    mentions: [String!]
    attachments: [ActivityCommentAttachmentInput!]
  }

  extend type Query {
    activityEvents(
      tenantId: ID!
      subjectType: ActivitySubjectType!
      subjectId: String!
      first: Int
      after: String
    ): ActivityEventConnection!
  }

  extend type Mutation {
    addActivityComment(input: AddActivityCommentInput!): ActivityEvent!
  }

  extend type Subscription {
    activityEventAdded(
      tenantId: ID!
      subjectType: ActivitySubjectType!
      subjectId: String!
    ): ActivityEvent!
  }
`;
