# LuxGen API Reference

> **GraphQL endpoint:** `http://localhost:4000/graphql` (dev)  
> **Headers:** `Authorization: Bearer <jwt>`, `x-tenant: demo`  
> **Playground:** `http://localhost:4000/graphql` when `APOLLO_INTROSPECTION=true`

See [GRAPHQL_PLATFORM.md](./GRAPHQL_PLATFORM.md) for client setup (web + mobile).

---

## REST routes

| Method | Path                            | Purpose                                                |
| ------ | ------------------------------- | ------------------------------------------------------ |
| GET    | `/health`                       | API health check                                       |
| GET    | `/api/billing/plan?tenant=demo` | Effective plan + feature flags (for server-side gates) |
| POST   | `/api/billing/webhook`          | Stripe webhooks (raw body)                             |
| POST   | `/api/jobs/listing-reminders`   | Process listing reminder emails (`x-jobs-key`)         |
| POST   | `/api/auth/*`                   | Auth routes — see [auth-api.md](./auth-api.md)         |
| POST   | `/api/tenant/*`                 | Tenant config                                          |

### Web-only (Next.js `apps/web/pages/api/`)

| Method | Path                | Purpose                                                                  |
| ------ | ------------------- | ------------------------------------------------------------------------ |
| POST   | `/api/agent/chat`   | Agent SSE stream (Enterprise gate)                                       |
| POST   | `/api/agent/commit` | Git commit staged session                                                |
| POST   | `/api/agent/merge`  | Merge agent branch                                                       |
| GET    | `/api/agent/health` | Ollama status                                                            |
| …      | `/api/agent/*`      | See [technical/agent/AGENT_STUDIO.md](./technical/agent/AGENT_STUDIO.md) |

---

## GraphQL — Auth & users

```graphql
mutation Login($input: LoginInput!) {
  login(input: $input) { token user { id email firstName lastName } }
}

query GetCurrentUser {
  # See apps/web/graphql/queries/auth.ts
}
```

---

## GraphQL — Dashboard

```graphql
query GetDashboardData($tenant: String) {
  getDashboardData(tenant: $tenant) {
    stats {
      totalCourses
      activeStudents
      completionRate
      totalGroups
    }
    recentActivities {
      id
      type
      title
      timestamp
    }
  }
}
```

**Web query file:** `apps/web/graphql/queries/dashboard.ts`

---

## GraphQL — Commerce (tenant → customer → product → order)

Full functional spec: [technical/COMMERCE_API.md](./technical/COMMERCE_API.md)

Entity map: `Tenant` → `User` / `customers` (STUDENT) → `Course` (product) → `Enrollment` (order).

```graphql
# Customers (learners)
query Customers($tenantId: ID!, $search: String) {
  customers(tenantId: $tenantId, search: $search) {
    id
    email
    firstName
    lastName
    phone
    staffNotes
    marketingEmail
  }
}

# Products
query Courses($tenantId: ID!) {
  courses(tenantId: $tenantId) {
    id
    title
    status
    description
  }
}

# Orders
query Enrollments($tenantId: ID!) {
  enrollments(tenantId: $tenantId) {
    id
    courseId
    studentId
    notes
    tags
    paymentStatus
    enrolledAt
  }
}

query DraftEnrollments($tenantId: ID!) {
  draftEnrollments(tenantId: $tenantId) {
    id
    courseId
    studentId
    tags
    paymentStatus
    enrolledAt
  }
}

query AbandonedCheckouts($tenantId: ID!) {
  abandonedCheckouts(tenantId: $tenantId) {
    id
    courseId
    studentId
    amountCents
    currency
    status
    customerEmail
    checkoutUrl
    courseTitle
    createdAt
    abandonedAt
  }
}

mutation EnrollStudent($courseId: ID!, $studentId: ID!) {
  enrollStudent(courseId: $courseId, studentId: $studentId) {
    id
  }
}
```

**Web query files:** `graphql/queries/users.ts`, `courses.ts`, `enrollment.ts`, `storefront.ts`

---

## GraphQL — Courses & groups

```graphql
query Courses($tenantId: ID!) {
  courses(tenantId: $tenantId) {
    id
    title
    status
    instructor {
      id
      firstName
    }
  }
}

query Groups($tenantId: ID!) {
  groups(tenantId: $tenantId) {
    id
    name
    memberCount
  }
}
```

---

## GraphQL — Automations (Phase 7)

```graphql
query Automations($tenantId: String!) {
  automations(tenantId: $tenantId) {
    id
    name
    enabled
    triggerType
    triggerLabel
    actions {
      type
      label
      config
    }
    runCount
    lastRunAt
  }
}

mutation CreateAutomation($input: CreateAutomationInput!) {
  createAutomation(input: $input) {
    id
    name
    enabled
  }
}

mutation ToggleAutomation($id: ID!, $enabled: Boolean!) {
  toggleAutomation(id: $id, enabled: $enabled) {
    id
    enabled
  }
}

mutation RunAgentTask($input: RunAgentTaskInput!) {
  runAgentTask(input: $input) {
    sessionId
    status
    jobId
  }
}
```

**Requires:** Pro plan for mutations. Enterprise for `runAgentTask`.  
**Web:** `apps/web/graphql/queries/automations.ts`

---

## GraphQL — Project (creator iteration boards)

```graphql
query ProjectItems($tenantId: String!, $iteration: ProjectItemIteration) {
  projectItems(tenantId: $tenantId, iteration: $iteration) {
    id
    title
    status
    iteration
    priority
    assigneeName
    startDate
    endDate
    estimate
    labels
  }
}

mutation CreateProjectItem($input: CreateProjectItemInput!) {
  createProjectItem(input: $input) {
    id
    title
    status
    iteration
  }
}

mutation MoveProjectItem($id: ID!, $tenantId: String!, $status: ProjectItemStatus!) {
  moveProjectItem(id: $id, tenantId: $tenantId, status: $status) {
    id
    status
    sortOrder
  }
}

mutation UpdateProjectItem($id: ID!, $tenantId: String!, $input: UpdateProjectItemInput!) {
  updateProjectItem(id: $id, tenantId: $tenantId, input: $input) {
    id
    title
    status
    iteration
    priority
  }
}

mutation DeleteProjectItem($id: ID!, $tenantId: String!) {
  deleteProjectItem(id: $id, tenantId: $tenantId)
}
```

**Requires:** Pro plan (`project` feature flag).  
**Web:** `apps/web/graphql/queries/project.ts`

---

## GraphQL — Billing (Phase 9)

```graphql
query TenantBilling($tenantId: String!) {
  tenantBilling(tenantId: $tenantId) {
    plan
    planName
    priceMonthly
    subscriptionStatus
    featureFlags {
      automations
      analytics
      agentStudio
      mobileApp
    }
    limits {
      maxLearners
      maxAutomations
      maxAutomationRunsPerMonth
    }
  }
}

query PricingPlans {
  pricingPlans {
    id
    name
    priceMonthly
    features
    limits {
      maxLearners
    }
  }
}

mutation CreateCheckoutSession($tenantId: String!, $plan: PlanTier!, $successUrl: String!, $cancelUrl: String!) {
  createCheckoutSession(tenantId: $tenantId, plan: $plan, successUrl: $successUrl, cancelUrl: $cancelUrl) {
    url
    sessionId
  }
}
```

**Web:** `apps/web/graphql/queries/billing.ts`  
**Doc:** [PHASE_9_BILLING.md](./PHASE_9_BILLING.md)

---

## GraphQL — Marketplace & usage (Phase 10)

```graphql
query AutomationTemplates($featured: Boolean) {
  automationTemplates(featured: $featured) {
    slug
    name
    description
    priceLabel
    installCount
    category
  }
}

mutation InstallAutomationTemplate($tenantId: String!, $slug: String!) {
  installAutomationTemplate(tenantId: $tenantId, slug: $slug) {
    id
    name
    enabled
  }
}

query TenantUsage($tenantId: String!) {
  tenantUsage(tenantId: $tenantId) {
    automationRuns
    activeLearners
    automationCount
    percentUsed {
      automationRuns
      activeLearners
    }
    withinLimits {
      automationRuns
      automations
    }
  }
}
```

**Web:** `apps/web/graphql/queries/marketplace.ts`

---

## GraphQL — Business listings

```graphql
query PublishedListings($tenantId: String!) {
  publishedListings(tenantId: $tenantId) {
    id
    businessName
    slug
    description
    category
    publishedAt
  }
}

mutation CreateListingDraft($input: CreateListingInput!) {
  createListingDraft(input: $input) {
    id
    applicationStatus
  }
}

mutation SubmitListingApplication($id: ID!) {
  submitListingApplication(id: $id) {
    id
    applicationStatus
  }
}

mutation ApproveListing($id: ID!) {
  approveListing(id: $id) {
    id
    applicationStatus
  }
}

mutation CreateListingCheckoutSession($listingId: ID!, $successUrl: String!, $cancelUrl: String!) {
  createListingCheckoutSession(listingId: $listingId, successUrl: $successUrl, cancelUrl: $cancelUrl) {
    url
    sessionId
  }
}
```

**Web:** `apps/web/graphql/queries/listings.ts`  
**Doc:** [LISTING_SUBSCRIPTION_LIFECYCLE.md](./LISTING_SUBSCRIPTION_LIFECYCLE.md)

---

## Error codes (GraphQL extensions)

| Code                    | Meaning                              |
| ----------------------- | ------------------------------------ |
| `PLAN_UPGRADE_REQUIRED` | Feature gated by plan tier           |
| `USAGE_LIMIT_EXCEEDED`  | Monthly automation/learner limit hit |

---

## Schema registration

Add new domains in:

1. `apps/api/src/schema/<domain>/typeDefs.ts`
2. `apps/api/src/schema/<domain>/resolvers.ts`
3. `apps/api/src/schema/index.ts` — merge typeDefs + resolvers
4. `apps/web/graphql/queries/<domain>.ts`

Skill: [skills/graphql/SKILL.md](../skills/graphql/SKILL.md)
