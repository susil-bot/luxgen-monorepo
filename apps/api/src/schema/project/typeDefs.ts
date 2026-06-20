export const projectTypeDefs = `
  enum ProjectItemStatus {
    BACKLOG
    READY
    IN_PROGRESS
    IN_REVIEW
    DONE
  }

  enum ProjectItemIteration {
    CURRENT
    NEXT
  }

  enum ProjectItemPriority {
    P0
    P1
    P2
    P3
  }

  type ProjectItem {
    id: ID!
    tenantId: String!
    title: String!
    description: String!
    status: ProjectItemStatus!
    iteration: ProjectItemIteration!
    priority: ProjectItemPriority!
    assigneeName: String
    assigneeId: ID
    startDate: Date
    endDate: Date
    estimate: Int
    labels: [String!]!
    courseId: ID
    sortOrder: Int!
    createdAt: Date!
    updatedAt: Date!
  }

  input CreateProjectItemInput {
    tenantId: String!
    title: String!
    description: String
    status: ProjectItemStatus
    iteration: ProjectItemIteration
    priority: ProjectItemPriority
    assigneeName: String
    assigneeId: ID
    startDate: Date
    endDate: Date
    estimate: Int
    labels: [String!]
    courseId: ID
  }

  input UpdateProjectItemInput {
    title: String
    description: String
    status: ProjectItemStatus
    iteration: ProjectItemIteration
    priority: ProjectItemPriority
    assigneeName: String
    assigneeId: ID
    startDate: Date
    endDate: Date
    estimate: Int
    labels: [String!]
    courseId: ID
    sortOrder: Int
  }

  extend type Query {
    projectItems(
      tenantId: String!
      iteration: ProjectItemIteration
      status: ProjectItemStatus
      priority: ProjectItemPriority
      assigneeId: ID
      search: String
    ): [ProjectItem!]!
    projectItem(id: ID!, tenantId: String!): ProjectItem
  }

  extend type Mutation {
    createProjectItem(input: CreateProjectItemInput!): ProjectItem!
    updateProjectItem(id: ID!, tenantId: String!, input: UpdateProjectItemInput!): ProjectItem
    moveProjectItem(id: ID!, tenantId: String!, status: ProjectItemStatus!): ProjectItem
    deleteProjectItem(id: ID!, tenantId: String!): Boolean!
  }
`;
