# LuxGen Monorepo

A comprehensive multi-tenant platform built with Next.js, Node.js, and MongoDB.

## 📁 Project Structure

```
luxgen-monorepo/
├── apps/
│   ├── api/          # GraphQL API server
│   └── web/          # Next.js web application
├── packages/
│   ├── auth/         # Authentication utilities
│   ├── config/       # Configuration management
│   ├── core/         # Core business logic
│   ├── db/           # Database models and connections
│   ├── shared/       # Shared utilities
│   ├── ui/           # UI component library
│   └── utils/        # Utility functions
└── docs/             # Documentation
```

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development servers
npm run dev

# Run tests
npm test

# Run linting
npm run lint
```

## 📚 Documentation

- [Developer Knowledge Base](./docs/DEVELOPER_KNOWLEDGE_BASE.md)
- [API Documentation](./docs/auth-api.md)
- [Tenant Keys Documentation](./docs/tenant-keys.md)

## 🛠️ Development

This is a monorepo managed with Turbo. Each package can be developed independently while sharing common dependencies.

### Available Scripts

- `npm run dev` - Start all development servers
- `npm run build` - Build all packages
- `npm run test` - Run all tests
- `npm run lint` - Run ESLint on all packages
- `npm run clean` - Clean all build artifacts

## 🏗️ Architecture

The platform follows a multi-tenant architecture with:
- **Tenant Isolation**: Each tenant has isolated data and configuration
- **Shared Infrastructure**: Common services and utilities
- **Scalable Design**: Built to handle multiple tenants efficiently

## 📦 Packages

- **@luxgen/api**: GraphQL API with authentication and tenant management
- **@luxgen/web**: Next.js frontend with tenant-aware routing
- **@luxgen/ui**: Shared UI component library
- **@luxgen/auth**: Authentication and authorization utilities
- **@luxgen/db**: Database models and connections
- **@luxgen/core**: Core business logic and services
- **@luxgen/shared**: Shared utilities and types
- **@luxgen/config**: Configuration management
- **@luxgen/utils**: Utility functions
