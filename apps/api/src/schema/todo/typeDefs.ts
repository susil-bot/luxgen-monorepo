export const todoTypeDefs = `
  enum TaskStatus {
    TODO
    DONE
  }

  type TodoList {
    id: ID!
    tenantId: String!
    name: String!
    taskCount: Int!
    createdById: String
    createdAt: Date!
    updatedAt: Date!
  }

  type Task {
    id: ID!
    tenantId: String!
    todoListId: String!
    title: String!
    notes: String
    status: TaskStatus!
    sortOrder: Int!
    dueDate: Date
    createdById: String
    createdAt: Date!
    updatedAt: Date!
  }

  input CreateTodoListInput {
    tenantId: String!
    name: String!
  }

  input UpdateTodoListInput {
    name: String
  }

  input CreateTaskInput {
    tenantId: String!
    todoListId: String!
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
    """A tenant's named todo lists. Auto-creates a default "My Tasks" list (and adopts any
    pre-multi-list tasks into it) the first time a tenant with no lists calls this."""
    todoLists(tenantId: String!): [TodoList!]!
    todoList(id: ID!, tenantId: String!): TodoList
    tasks(tenantId: String!, todoListId: String, status: TaskStatus): [Task!]!
    task(id: ID!, tenantId: String!): Task
  }

  extend type Mutation {
    createTodoList(input: CreateTodoListInput!): TodoList!
    updateTodoList(id: ID!, tenantId: String!, input: UpdateTodoListInput!): TodoList
    """Deletes the list and every task in it."""
    deleteTodoList(id: ID!, tenantId: String!): Boolean!

    createTask(input: CreateTaskInput!): Task!
    updateTask(id: ID!, tenantId: String!, input: UpdateTaskInput!): Task
    toggleTask(id: ID!, tenantId: String!): Task
    deleteTask(id: ID!, tenantId: String!): Boolean!
    """Persists new sortOrder for each id, in the order given — used by drag-reorder in the To Do list and Board."""
    reorderTasks(tenantId: String!, todoListId: String, orderedIds: [ID!]!): [Task!]!
  }
`;
