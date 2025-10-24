# LuxGen Monorepo

A comprehensive multi-tenant platform built with Next.js, Node.js, and MongoDB. Features dynamic tenant detection, theme-aware UI components, and enterprise-grade architecture.

## ✨ Key Features

- **🏢 Multi-Tenant Architecture**: Dynamic tenant detection via subdomains and query parameters
- **🎨 Theme System**: CSS custom properties with tenant-specific branding
- **📱 Responsive Design**: Mobile-first UI components with breakpoint management
- **🔐 Authentication**: JWT-based auth with per-tenant key rotation
- **📊 Analytics**: Built-in performance tracking and user analytics
- **🛡️ Error Handling**: Comprehensive error boundaries and graceful fallbacks
- **♿ Accessibility**: WCAG compliant components with proper ARIA attributes
- **🔧 TypeScript**: Full TypeScript support across all packages

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

## 🐳 Docker Development

```bash
# Start all services with Docker
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
```

## 🔧 Recent Improvements

### ✅ Hydration Error Fixes
- Fixed React hydration mismatches in `TenantDebug` component
- Resolved server/client tenant detection inconsistencies
- Added proper SSR support with `initialTenant` prop

### ✅ Multi-Tenant System
- Dynamic tenant detection from subdomains (`ideavibes.localhost:3000`)
- Query parameter fallback (`?tenant=demo`)
- Tenant-specific theming and branding
- API integration for dynamic tenant configuration

### ✅ UI Component Library
- Comprehensive NavBar with search and notifications
- Collapsible Sidebar with hierarchical navigation
- AppLayout with responsive design
- SearchBar and CountryLanguageDropdown components
- Error boundaries and debugging tools

### ✅ API Integration
- GraphQL API with tenant-aware queries
- REST endpoints for tenant configuration
- User management with tenant separation
- Database seeding with sample multi-tenant data

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
