# LuxGen Monorepo

A multi-tenant learning management system built with Next.js, GraphQL, and MongoDB.

## Architecture


| Layer                               | Responsibility                                                                          | Example Files / Folders                                                            |
| ----------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **1. Presentation (UI Layer)**      | Visual components, forms, buttons, pages — tenant-aware UI                              | `/packages/ui/*`, `/features/auth/pages/LoginPage.tsx`                             |
| **2. View Logic (Container Layer)** | Hooks, state management, orchestrates form actions, calls services                      | `/features/auth/hooks/useLogin.ts`, `/features/auth/containers/LoginContainer.tsx` |
| **3. Domain / Service Layer**       | Business logic, validations, core service calls                                         | `/features/auth/services/AuthService.ts`                                           |
| **4. Data Access / API Layer**      | Handles API communication (REST/GraphQL) and data formatting                            | `/lib/api/authApi.ts`, `/lib/graphql/mutations/login.ts`                           |
| **5. Context / Tenant Layer**       | Provides current tenant context, injects tenant configs (theme, API base URL, branding) | `/context/TenantContext.tsx`, `/providers/TenantProvider.tsx`                      |
| **6. Infrastructure Layer**         | Backend integration, config, caching, environment setup                                 | `/config/env.ts`, `/lib/httpClient.ts`, `/config/tenantConfig.json`                |


- **Frontend**: Next.js with TypeScript
- **Backend**: Node.js with Apollo GraphQL Server
- **Database**: MongoDB
- **Monorepo**: Turborepo for build orchestration

## Project Structure

```
luxgen-monorepo/
├── apps/
│   ├── web/               # Next.js frontend
│   └── api/               # GraphQL API server
├── packages/
│   ├── db/                # MongoDB schemas
│   ├── auth/              # Authentication utilities
│   ├── core/              # Business logic
│   ├── ui/                # Shared UI components
│   ├── utils/             # Common utilities
│   └── config/            # Shared configuration
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development servers:
   ```bash
   npm run dev
   ```

3. Build all packages:
   ```bash
   npm run build
   ```

## Development

- `npm run dev` - Start all development servers
- `npm run build` - Build all packages
- `npm run lint` - Lint all packages
- `npm run test` - Run tests
- `npm run clean` - Clean build artifacts

## Multi-tenancy

The system supports multi-tenancy through subdomain routing:
- `tenant1.luxgen.com` - Tenant 1 dashboard
- `tenant2.luxgen.com` - Tenant 2 dashboard
- `admin.luxgen.com` - Admin panel
