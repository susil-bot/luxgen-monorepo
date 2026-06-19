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
  }

  input AddActivityCommentInput {
    tenantId: ID!
    subjectType: ActivitySubjectType!
    subjectId: String!
    message: String!
  }

  extend type Query {
    activityEvents(
      tenantId: ID!
      subjectType: ActivitySubjectType!
      subjectId: String!
      first: Int
    ): [ActivityEvent!]!
  }

  extend type Mutation {
    addActivityComment(input: AddActivityCommentInput!): ActivityEvent!
  }
`;
