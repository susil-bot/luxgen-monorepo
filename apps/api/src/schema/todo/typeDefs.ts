export const todoTypeDefs = `
  enum TaskStatus {
    TODO
    DONE
  }

  type Task {
    id: ID!
    tenantId: String!
    title: String!
    notes: String
    status: TaskStatus!
    sortOrder: Int!
    dueDate: Date
    createdById: String
    createdAt: Date!
    updatedAt: Date!
  }

  input CreateTaskInput {
    tenantId: String!
    title: String!
    notes: String
    status: TaskStatus
    dueDate: Date
  }

  input UpdateTaskInput {
    title: String
    notes: String
    status: TaskStatus
    dueDate: Date
  }

  extend type Query {
    tasks(tenantId: String!, status: TaskStatus): [Task!]!
    task(id: ID!, tenantId: String!): Task
  }

  extend type Mutation {
    createTask(input: CreateTaskInput!): Task!
    updateTask(id: ID!, tenantId: String!, input: UpdateTaskInput!): Task
    toggleTask(id: ID!, tenantId: String!): Task
    deleteTask(id: ID!, tenantId: String!): Boolean!
    """Persists new sortOrder for each id, in the order given — used by drag-reorder in the To Do list and Board."""
    reorderTasks(tenantId: String!, orderedIds: [ID!]!): [Task!]!
  }
`;
