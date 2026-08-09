# Todo Engine (Task + Reminder + Workflow)

Architecture pack for extending the existing Todo List — **not** a separate reminder product.

| Doc                                  | Purpose                                      |
| ------------------------------------ | -------------------------------------------- |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Current vs proposed system, phases, security |
| [DATABASE.md](./DATABASE.md)         | Schema today + target entities               |
| [API.md](./API.md)                   | GraphQL + job routes                         |
| [AUTOMATION.md](./AUTOMATION.md)     | Triggers, conditions, actions, idempotency   |
| [TESTING.md](./TESTING.md)           | Unit / integration / E2E                     |

**Rule:** Implement in phases (see ARCHITECTURE §10). Deterministic engine before AI.

**Status**

| Phase                   | State                                            |
| ----------------------- | ------------------------------------------------ |
| 1 Task enrichment       | Shipped (`#489`)                                 |
| 2 Reminders + job sweep | Shipped (`#490`)                                 |
| 3 Required fields       | Shipped (`#492`)                                 |
| 4 Recurrence            | Shipped (`#494`)                                 |
| 5 Task automation       | In progress (`feat/todo-phase5-task-automation`) |
