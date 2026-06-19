# LuxGen GraphQL Platform — Web & Mobile Contract

> **Rule:** GraphQL at `apps/api` is the single source of truth. Web (`apps/web`) and mobile (`apps/mobile`, planned) consume the same schema.

---

## Endpoint

| Environment | URL |
|-------------|-----|
| Local | `http://localhost:4000/graphql` |
| Web proxy | `/api/graphql` → API |

## Required headers (all clients)

| Header | Purpose |
|--------|---------|
| `Authorization: Bearer <jwt>` | User identity |
| `x-tenant` | Tenant subdomain (`demo`, `idea-vibes`) |

Mobile must store JWT securely (Keychain / Keystore) and send the same headers as web Apollo client.

---

## Client setup

### Web (existing)

```typescript
// apps/web/graphql/client.ts
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
});

const authLink = setContext((_, { headers }) => ({
  headers: {
    ...headers,
    authorization: localStorage.getItem('authToken') ? `Bearer ${localStorage.getItem('authToken')}` : '',
    'x-tenant': localStorage.getItem('currentTenant') || 'demo',
  },
}));

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
```

### Mobile (recommended — Expo + Apollo)

```typescript
// apps/mobile/src/graphql/client.ts (planned)
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import * as SecureStore from 'expo-secure-store';

const httpLink = createHttpLink({
  uri: process.env.EXPO_PUBLIC_GRAPHQL_URL!,
});

const authLink = setContext(async (_, { headers }) => {
  const token = await SecureStore.getItemAsync('authToken');
  const tenant = await SecureStore.getItemAsync('tenant') || 'demo';
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
      'x-tenant': tenant,
    },
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
```

---

## Domain coverage map

| Domain | GraphQL | Web page | Mobile (planned) |
|--------|---------|----------|------------------|
| Auth | `login`, `register` | `/login` | Auth stack |
| Dashboard | `dashboardData` | `/dashboard` | Home tab |
| Courses | `courses`, `course` | `/courses` | Courses tab |
| Groups | `groups`, `group` | `/groups` | — |
| Users | `users` | `/users` | — |
| **Automations** | `automations`, `automationRuns` | `/automations` | — (admin web only) |
| **Agent tasks** | `agentTask`, `runAgentTask` | `/agent` | — |
| Learner | `learnerDashboard` *(future)* | `/customers` | Primary mobile UX |

---

## Automations API (Phase 7)

```graphql
query Automations($tenantId: String!) {
  automations(tenantId: $tenantId) {
    id name enabled triggerType triggerLabel
    actions { type label config }
    runCount lastRunAt createdAt
  }
}

mutation ToggleAutomation($id: ID!, $enabled: Boolean!) {
  toggleAutomation(id: $id, enabled: $enabled) { id enabled }
}

mutation RunAgentTask($input: RunAgentTaskInput!) {
  runAgentTask(input: $input) {
    sessionId status jobId
  }
}
```

### Agent ↔ Automation trigger types

| Trigger | When fired |
|---------|------------|
| `COURSE_COMPLETED` | Learner completes course |
| `USER_ENROLLED` | User enrolled |
| `CODE_CHANGE_STAGED` | Agent staged files |
| `CODE_CHANGE_COMMITTED` | Agent committed branch |
| `CODE_CHANGE_MERGED` | Agent merged to base |
| `CODE_CHANGE_FAILED` | Agent/validation failed |
| `SCHEDULE` | Cron (future) |
| `WEBHOOK` | External POST |

### Action types

| Action | Config |
|--------|--------|
| `SEND_EMAIL` | `{ templateId, to }` |
| `RUN_AGENT_TASK` | `{ prompt, skill?, autoMerge? }` |
| `NOTIFY_SLACK` | `{ channel, message }` |
| `CALL_WEBHOOK` | `{ url, method }` |
| `TAG_USER` | `{ tag }` |

---

## Adding a new feature (checklist)

1. Add Mongoose model in `packages/db` (if persisted)
2. Add service in `apps/api/src/services/`
3. Add `typeDefs` + `resolvers` in `apps/api/src/schema/<domain>/`
4. Register in `apps/api/src/schema/index.ts`
5. Add `apps/web/graphql/queries/<domain>.ts`
6. Add mobile query file mirroring web (same gql document)
7. **Do not** add REST endpoints unless streaming (Agent SSE) or file upload requires it

---

## Agent Studio exception

Agent chat uses **SSE** at `/api/agent/chat` (streaming). Status, tasks, audit, and automations use GraphQL or JSON REST under `/api/agent/*`. Long-term: `agentTaskStream` subscription.

---

*See `docs/BUSINESS_STRATEGY_2026.md` for product positioning and monetization.*
